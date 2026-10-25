// Image confirmation flow: read first, let the student choose/correct, then solve.
(()=>{
  const $=id=>document.getElementById(id),button=$('solve-button'),panel=$('question-review'),input=$('file-input');
  let questions=[],selected=0;
  button.querySelector('span').textContent='Read image questions';
  const reset=()=>{questions=[];selected=0;panel.hidden=true;panel.replaceChildren();button.querySelector('span').textContent='Read image questions'};
  const highlight=region=>{
    if(!region||!$('preview-img').naturalWidth)return;
    const stage=$('crop-stage'),img=$('preview-img'),overlay=$('crop-selection'),r=stage.getBoundingClientRect();
    const scale=Math.min(r.width/img.naturalWidth,r.height/img.naturalHeight),ox=(r.width-img.naturalWidth*scale)/2,oy=(r.height-img.naturalHeight*scale)/2;
    cropRect={x:ox+region.x*img.naturalWidth*scale,y:oy+region.y*img.naturalHeight*scale,w:region.width*img.naturalWidth*scale,h:region.height*img.naturalHeight*scale};
    overlay.hidden=false;Object.assign(overlay.style,{left:cropRect.x+'px',top:cropRect.y+'px',width:cropRect.w+'px',height:cropRect.h+'px'});$('crop-apply').disabled=true;
  };
  const showQuestions=list=>{
    questions=list.length?list:[{number:1,text:'',region:null}];selected=0;panel.replaceChildren();panel.hidden=false;
    const title=document.createElement('h3');title.textContent=list.length>1?'Choose the question you want to solve':list.length===1?'Check what I read':'I could not read a clear question';panel.appendChild(title);
    const hint=document.createElement('p');hint.textContent=list.length>1?list.length+' questions detected. Select one, then check or edit its transcription.':list.length?'Check the transcription and fix anything I misread before solving.':'You can crop the image or type the question below. No quiz or guessing step is required.';panel.appendChild(hint);
    const listBox=document.createElement('div');listBox.className='detected-question-list';
    questions.forEach((q,i)=>{const card=document.createElement('button');card.type='button';card.className='detected-question';card.setAttribute('aria-pressed',String(i===0));const tag=document.createElement('b');tag.textContent='Question '+(i+1);const text=document.createElement('span');text.textContent=q.text||'Question text not detected';card.append(tag,text);card.addEventListener('click',()=>{selected=i;listBox.querySelectorAll('button').forEach((item,j)=>item.setAttribute('aria-pressed',String(j===i)));$('question-correction').value=q.text||'';highlight(q.region)});listBox.appendChild(card)});
    panel.appendChild(listBox);
    const label=document.createElement('label');label.htmlFor='question-correction';label.textContent='Edit the detected question';panel.appendChild(label);
    const edit=document.createElement('textarea');edit.id='question-correction';edit.rows=3;edit.maxLength=600;edit.value=questions[0].text||'';edit.setAttribute('aria-describedby','question-review-hint');panel.appendChild(edit);hint.id='question-review-hint';
    if(questions[0].region)highlight(questions[0].region);
    button.querySelector('span').textContent='Solve this question';
  };
  const solveOriginalImage=async()=>{
    button.querySelector('span').textContent='Reading the full image…';document.body.classList.remove('intake');document.querySelector('.lesson').hidden=false;$('lesson-content').innerHTML='<div class="loading"><div class="loading-orbit"></div><p>Reading the full image and working through the question…</p></div>';
    const fd=new FormData();fd.append('subject',window.subj||'auto');fd.append('image',input.files[0]);const response=await fetch('/api/analyze',{method:'POST',body:fd}),result=await response.json();if(!response.ok)throw new Error(result.error||'Something went wrong.');render(result);
    if(result.mode==='demo')notify('Demo lesson shown. Add a Gemini key to analyze your image.');else{$('mode-pill').classList.add('live');$('mode-pill').innerHTML='<i></i> GEMINI ACTIVE'}
  };
  button.onclick=async()=>{
    if(!input.files[0]){notify('Upload a photo of your question first.');return}
    button.disabled=true;
    try{
      if(!questions.length){button.querySelector('span').textContent='Reading the image…';const fd=new FormData();fd.append('image',input.files[0]);const response=await fetch('/api/read-image',{method:'POST',body:fd}),data=await response.json();if(!response.ok)throw new Error(data.error||'Could not read this image.');const detected=Array.isArray(data.questions)?data.questions:[];if(!detected.length){await solveOriginalImage();return}showQuestions(detected);return}
      const confirmed=$('question-correction').value.trim();if(!confirmed){notify('Type or correct the question before solving.');return}
      button.querySelector('span').textContent='Solving the confirmed question…';document.body.classList.remove('intake');document.querySelector('.lesson').hidden=false;$('lesson-content').innerHTML='<div class="loading"><div class="loading-orbit"></div><p>Working through the question you confirmed…</p></div>';
      const fd=new FormData();fd.append('subject',window.subj||'auto');fd.append('text',confirmed);fd.append('image',input.files[0]);const response=await fetch('/api/analyze',{method:'POST',body:fd}),result=await response.json();if(!response.ok)throw new Error(result.error||'Something went wrong.');result.studentQuestion=confirmed;result.question||=confirmed;result.multipleQuestionsDetected=questions.length>1;result.questionCount=questions.length;result.selectedQuestionNumber=selected+1;render(result);
      if(result.mode==='demo')notify('Demo lesson shown. Add a Gemini key to analyze your question.');else{$('mode-pill').classList.add('live');$('mode-pill').innerHTML='<i></i> GEMINI ACTIVE'}
    }catch(error){if(questions.length){document.querySelector('.lesson').hidden=true;document.body.classList.add('intake')}notify(error.message)}finally{button.disabled=false;button.querySelector('span').textContent=questions.length?'Solve this question':'Read image questions'}
  };
  input.addEventListener('change',reset);$('dropzone').addEventListener('drop',reset);$('crop-apply').addEventListener('click',reset);$('remove-image').addEventListener('click',reset);$('new-question').addEventListener('click',reset);
})();

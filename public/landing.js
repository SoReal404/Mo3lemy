// Gravity-inspired, subject-aware motion for the مُعلمي learning home page.
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const subjectColors = { math: '#5eb5ff', chem: '#ff8a5c', arabic: '#e7c46a' };
  const setSubject = subject => { document.body.dataset.subject = subject; };
  setSubject('math');
  $('.intro')?.remove();
  const main = $('main');
  main.id = 'tool';

  const hero = document.createElement('section');
  hero.className = 'hero';
  hero.innerHTML = `<div class="hero-copy"><div class="eyebrow"><span class="sparkle">✳</span> مُعلمي · INTERACTIVE EXPLANATIONS</div><h1>Every answer<br>has a <em>why.</em></h1><p>Drop in a question. Understand the reasoning, explore the idea, and see every subject take shape — in math, chemistry, and Arabic.</p><div class="hero-cta"><a href="#tool" class="cta">Bring a question <span aria-hidden="true">↘</span></a><div class="subj" aria-label="Choose a subject"><button data-s="math" style="--c:${subjectColors.math}">Math</button><button data-s="chem" style="--c:${subjectColors.chem}">Chemistry</button><button data-s="arabic" style="--c:${subjectColors.arabic}">العربية</button></div></div><div class="hero-proof"><span><i></i> IMAGE OR TEXT</span><span><i></i> STEP BY STEP</span><span><i></i> INTERACTIVE</span></div></div><div class="hero-orbit-label" aria-hidden="true"><span>IDEAS IN MOTION</span><i>✳</i><b>01 / 03</b></div>`;

  const chapters = [
    { subject: 'math', label: '01 · MATHEMATICS', title: 'The idea<br><em>becomes visible.</em>', text: 'Watch a point move along the curve as the slope changes. The graph is part of the reasoning, not decoration.' },
    { subject: 'chem', label: '02 · CHEMISTRY', title: 'Mix it.<br><em>See why it reacts.</em>', text: 'Explore a virtual bench with 38 reagents. Track pH, observe gas and precipitates, and follow the chemistry as you mix.', link: '<a class="chap-link" href="/chemistry-lab/">Enter the chemistry lab <span aria-hidden="true">↗</span></a>' },
    { subject: 'arabic', label: '03 · العربية', title: 'Every word<br><em>has a job.</em>', text: 'Explore a complete Arabic sentence word by word, with its إعراب and the rule that explains it.' },
  ];
  const story = document.createElement('section');
  story.id = 'story';
  story.setAttribute('aria-label', 'Explore subjects');
  story.innerHTML = `<div class="story-sticky"><div class="story-text">${chapters.map((chapter, i) => `<article class="chap ${i === 0 ? 'on' : ''}" data-i="${i}" style="--c:${subjectColors[chapter.subject]}"><span class="chap-n">${chapter.label}</span><h2>${chapter.title}</h2><p>${chapter.text}</p>${chapter.link || ''}</article>`).join('')}</div><div class="story-stage" data-ch="0"><div class="stage-topline"><span>LESSON IN MOTION</span><span class="stage-live"><i></i> LIVE</span></div><svg id="sm" viewBox="0 0 400 300" role="img" aria-label="Interactive function graph"><path id="sm-ax" d="M20 150H380M200 20V280"/><path id="sm-c"/><line id="sm-t"/><circle id="sm-p" r="6"/><text id="sm-l" x="24" y="40"></text><text class="graph-axis-label" x="354" y="171">x</text><text class="graph-axis-label" x="207" y="32">y</text></svg><canvas id="sc" width="400" height="300" aria-label="Animated reaction illustration"></canvas><div id="sa" dir="rtl" lang="ar"><span class="stage-kicker">WORD-BY-WORD · إعراب</span><div class="sa-words"><span style="--c:#e7c46a">ذَهَبَ</span><span style="--c:#92d6aa">الطَّالِبُ</span><span style="--c:#83bfff">إِلَى</span></div><div class="sa-tip"></div></div><div class="stage-index"><span>01</span><i></i><span>03</span></div></div></div>`;

  const anatomy = document.createElement('section');
  anatomy.id = 'anatomy';
  anatomy.innerHTML = `<div class="an-sticky"><div class="an-text"><div class="eyebrow"><span class="sparkle">✳</span> THE مُعلمي METHOD</div><h2>One question.<br><em>More than an answer.</em></h2><p>Every lesson connects the result to the reasoning, then gives you space to try the idea yourself.</p><div class="method-points"><span><b>01</b> Understand the question</span><span><b>02</b> Follow each clear step</span><span><b>03</b> Explore it hands-on</span></div></div><div class="an-scene"><div class="an-stack">${[['Question','Read it faithfully','Photo, typed problem, or a single cropped question.'],['Reasoning','Understand each move','Every transformation gets its own plain-language reason.'],['Visualization','See what changes','A graph, reaction, or grammar view suited to the topic.'],['Practice','Make it yours','Move the controls, annotate the board, and ask again.']].map(([title, line, detail], i) => `<article class="layer" style="--i:${i}"><b>0${i + 1} · ${title}</b><code>${line}</code><span class="rev">${detail}</span></article>`).join('')}</div></div></div>`;

  const start = document.createElement('section');
  start.className = 'start-gate';
  start.innerHTML = '<div class="start-gate-copy"><span>YOUR STUDY SPACE IS READY</span><h2>Curiosity is a<br><em>good place to start.</em></h2><p>Bring one problem. Leave with the reasoning, the notation, and a place to explore the idea.</p></div><a class="start-gate-button" href="#tool">Start learning <b aria-hidden="true">↘</b></a>';
  main.before(hero, story, anatomy, start);
  start.querySelector('a').addEventListener('click', event => {
    event.preventDefault();
    document.querySelector('.workspace').scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'center' });
    setTimeout(() => $('#dropzone')?.focus(), reducedMotion ? 0 : 450);
  });

  // A lightweight, interactive 2.5D field of shaded spheres. It echoes Gravity's
  // scroll choreography without adding a WebGL dependency or delaying the lesson UI.
  const canvas = document.createElement('canvas');
  canvas.className = 'gravity-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  hero.prepend(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  let width = 0, height = 0, pixelRatio = 1, pointerX = -1000, pointerY = -1000;
  const mobile = matchMedia('(max-width: 700px)').matches;
  const ballCount = mobile ? 42 : 74;
  const palette = ['#4072ff', '#79a8ff', '#a7c2ff', '#a2ead2', '#b79cff'];
  const balls = Array.from({ length: ballCount }, (_, i) => ({
    index: i, radius: 8 + Math.random() ** 1.8 * (mobile ? 15 : 27),
    x: width * .72 + (Math.random() - .5) * 180, y: height * .48 + (Math.random() - .5) * 180,
    vx: (Math.random() - .5) * .8, vy: (Math.random() - .5) * .8,
    phase: Math.random() * Math.PI * 2, color: i % palette.length,
  }));
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = hero.clientWidth; height = hero.clientHeight; pixelRatio = dpr;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', resize, { passive: true });
  hero.addEventListener('pointermove', event => {
    const rect = hero.getBoundingClientRect();
    pointerX = event.clientX - rect.left; pointerY = event.clientY - rect.top;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointerX = -1000; pointerY = -1000; }, { passive: true });
  function drawBall(ball, x, y, radius, color, alpha) {
    const gradient = ctx.createRadialGradient(x - radius * .34, y - radius * .4, radius * .04, x + radius * .08, y + radius * .1, radius * 1.12);
    gradient.addColorStop(0, 'rgba(255,255,255,.98)');
    gradient.addColorStop(.12, 'rgba(255,255,255,.72)');
    gradient.addColorStop(.3, color);
    gradient.addColorStop(.72, color);
    gradient.addColorStop(1, 'rgba(15,24,43,.22)');
    ctx.save(); ctx.globalAlpha = alpha; ctx.shadowColor = color; ctx.shadowBlur = radius * .45;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fillStyle = gradient; ctx.fill();
    ctx.shadowBlur = 0; ctx.globalAlpha = alpha * .55;
    ctx.beginPath(); ctx.ellipse(x - radius * .31, y - radius * .42, radius * .18, radius * .09, -.55, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.globalAlpha = alpha * .32; ctx.beginPath(); ctx.arc(x, y, radius * 1.22, -.45, 1.15);
    ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, radius * .045); ctx.stroke();
    ctx.restore();
  }

  function renderField(time) {
    if (!reducedMotion) requestAnimationFrame(renderField);
    ctx.clearRect(0, 0, width, height);
    const s = width < 700 ? .82 : 1;
    const positions = [];
    for (const ball of balls) {
      const orbit = Math.sqrt(ball.index / ballCount), angle = ball.index * 2.399963;
      const targetX = (.75 + Math.cos(angle) * .17 * orbit) * width;
      const targetY = (.48 + Math.sin(angle) * .23 * orbit) * height + (reducedMotion ? 0 : Math.sin(time * .0007 + ball.phase) * 8);
      const dx = ball.x - pointerX, dy = ball.y - pointerY, distance = Math.hypot(dx, dy);
      if (!reducedMotion && distance < 150 && distance > 0.01) {
        const force = (1 - distance / 150) * (1 + Math.hypot(ball.vx, ball.vy) * .35);
        ball.vx += dx / distance * force * 1.2; ball.vy += dy / distance * force * 1.2;
      }
      if (reducedMotion) { ball.x = targetX; ball.y = targetY; }
      else {
        ball.vx += (targetX - ball.x) * .035; ball.vy += (targetY - ball.y) * .035;
        ball.vx *= .91; ball.vy *= .91;
        ball.x += ball.vx; ball.y += ball.vy;
        const r = ball.radius * s;
        if (ball.x < r || ball.x > width - r) { ball.vx *= -.72; ball.x = clamp(ball.x, r, width - r); }
        if (ball.y < r || ball.y > height - r) { ball.vy *= -.72; ball.y = clamp(ball.y, r, height - r); }
      }
      positions.push({ ball, x: ball.x, y: ball.y, radius: ball.radius * s, color: palette[ball.color], alpha: .82 * (.54 + Math.min(.35, ball.radius / 55)) });
    }
    positions.sort((a, b) => a.y - b.y);
    for (const item of positions) drawBall(item.ball, item.x, item.y, item.radius, item.color, item.alpha);
  }
  requestAnimationFrame(renderField);

  hero.querySelectorAll('.subj button').forEach(button => button.addEventListener('click', () => {
    const subject = button.dataset.s; setSubject(subject);
    if (subject === 'chem') { document.querySelector('.chap-link')?.focus(); document.querySelector('.chap-link')?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'center' }); return; }
    document.querySelector(`[data-sample="${subject === 'math' ? 'derivative' : 'arabic'}"]`)?.click();
    document.querySelector('#tool').scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
  }));

  // The scroll vignette now echoes Gravity's color morph and shape choreography,
  // while its teaching examples remain specific to each مُعلمي subject.
  const fn = t => t ** 3 - 3 * t;
  const curve = $('#sm-c');
  curve.setAttribute('d', Array.from({ length: 85 }, (_, i) => { const t = -2.1 + i * .05; return `${i ? 'L' : 'M'}${200 + t * 85},${150 - fn(t) * 30}`; }).join(''));
  const reactionCtx = $('#sc').getContext('2d');
  const bubbles = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), r: 2 + Math.random() * 5, v: .002 + Math.random() * .006 }));
  function drawReaction(amount) {
    const g = reactionCtx; g.clearRect(0, 0, 400, 300);
    const mixChannel = (a, b) => Math.round(mix(a, b, amount));
    g.fillStyle = `rgb(${mixChannel(60, 255)},${mixChannel(150, 138)},${mixChannel(255, 92)})`; g.globalAlpha = .55;
    g.beginPath(); g.moveTo(110, 130); g.lineTo(290, 130); g.lineTo(270, 265); g.lineTo(130, 265); g.fill();
    g.globalAlpha = 1; g.strokeStyle = '#ffffff88'; g.lineWidth = 3; g.beginPath(); g.moveTo(100, 60); g.lineTo(130, 265); g.lineTo(270, 265); g.lineTo(300, 60); g.stroke();
    g.fillStyle = '#fff';
    for (const bubble of bubbles) { bubble.y -= bubble.v * (reducedMotion ? .15 : .3 + amount * 2); if (bubble.y < 0) bubble.y = 1; if (amount > .1) { g.globalAlpha = .25 + amount * .6; g.beginPath(); g.arc(135 + bubble.x * 130 + Math.sin(bubble.y * 20) * 4, 262 - bubble.y * 180, bubble.r, 0, Math.PI * 2); g.fill(); } }
    g.globalAlpha = 1; g.font = '600 16px Manrope,sans-serif'; g.fillText(amount > .35 ? 'CO₂ ↑ · gas evolved' : 'HCl + CaCO₃', 120, 35);
  }
  const arabicTips = ['فعل ماضٍ مبني على الفتح — لأن الفعل الماضي لا يتغير آخره', 'فاعل مرفوع — لأنه من قام بالفعل', 'حرف جر — الاسم بعده يكون مجروراً'];
  const progressOf = element => clamp(-element.getBoundingClientRect().top / (element.offsetHeight - innerHeight));
  let lastChapter = -1;
  function updateScroll() {
    const storyProgress = progressOf(story), chapter = Math.min(2, Math.floor(storyProgress * 3)), within = clamp(storyProgress * 3 - chapter);
    $('.story-stage').dataset.ch = String(chapter);
    story.querySelectorAll('.chap').forEach((item, index) => item.classList.toggle('on', index === chapter));
    const rect = story.getBoundingClientRect();
    if (rect.top < innerHeight && rect.bottom > 0 && chapter !== lastChapter) { lastChapter = chapter; setSubject(chapters[chapter].subject); }
    const x = -1.9 + 3.8 * within, slope = 3 * x * x - 3, y = fn(x), px = 200 + x * 85, py = 150 - y * 30;
    $('#sm-p').setAttribute('cx', px); $('#sm-p').setAttribute('cy', py);
    const tangent = $('#sm-t'); tangent.setAttribute('x1', px - 70); tangent.setAttribute('x2', px + 70); tangent.setAttribute('y1', py + 70 * slope * 30 / 85); tangent.setAttribute('y2', py - 70 * slope * 30 / 85);
    $('#sm-l').textContent = `f(x)=x³−3x   slope = 3x²−3 = ${slope.toFixed(1)}`;
    if (chapter === 1) drawReaction(within);
    const wordIndex = Math.min(2, Math.floor(within * 3));
    $('#sa').querySelectorAll('.sa-words span').forEach((word, index) => word.classList.toggle('on', index === wordIndex));
    $('#sa .sa-tip').textContent = arabicTips[wordIndex];
    const anatomyProgress = progressOf(anatomy);
    anatomy.style.setProperty('--gap', `${8 + anatomyProgress * 105}px`);
    anatomy.style.setProperty('--rot', `${58 - anatomyProgress * 18}deg`);
  }
  addEventListener('scroll', updateScroll, { passive: true });
  addEventListener('resize', updateScroll, { passive: true });
  updateScroll();
})();

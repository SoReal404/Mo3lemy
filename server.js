import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const root = path.dirname(fileURLToPath(import.meta.url));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, /^image\/(png|jpeg|webp|gif)$/.test(file.mimetype)) });
// Optional: let your existing site call this API from another origin (set ALLOWED_ORIGIN=https://yoursite.com).
app.use((req, res, next) => { if (process.env.ALLOWED_ORIGIN) { res.set({ 'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN, 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' }); if (req.method === 'OPTIONS') return res.sendStatus(204); } next(); });
// Cost guard: per-IP hourly cap on paid endpoints (RATE_LIMIT_PER_HOUR, default 30).
const hits = new Map();
app.use(['/api/analyze', '/api/speech', '/api/explain', '/api/read-image'], (req, res, next) => { const k = req.ip, now = Date.now(), cap = Number(process.env.RATE_LIMIT_PER_HOUR) || 30; const list = (hits.get(k) || []).filter(t => now - t < 36e5); if (list.length >= cap) return res.status(429).json({ error: 'Hourly limit reached. Please try again later.' }); list.push(now); hits.set(k, list); next(); });
app.use(express.static(path.join(root, 'public')));
app.use(express.json({ limit: '20kb' }));

const demo = {
  title: 'A little equation, a big idea',
  question: 'Solve 2x + 3 = 11',
  answer: 'x = 4',
  explanation: 'Undo the +3 first: subtract 3 from both sides to get 2x = 8. Then divide both sides by 2, so x = 4. Check: 2(4) + 3 = 11.',
  options: [
    { label: 'A', text: '3', reason: 'Substituting 3 gives 2(3) + 3 = 9, not 11.' },
    { label: 'B', text: '5', reason: 'Substituting 5 gives 2(5) + 3 = 13, too high.' },
    { label: 'C', text: '4', reason: 'Correct: 2(4) + 3 = 11.' },
    { label: 'D', text: '7', reason: 'This comes from subtracting 3 but forgetting to divide by 2.' }
  ],
  steps: [
    { title: 'Start with the balance', detail: 'An equation is like a balanced scale. Both sides must stay equal.', expression: '2x + 3 = 11' },
    { title: 'Undo addition', detail: 'Subtract 3 from both sides to keep the balance.', expression: '2x = 8' },
    { title: 'Undo multiplication', detail: 'Divide both sides by 2. Now x stands alone.', expression: 'x = 4' },
    { title: 'Check your answer', detail: 'Put 4 back in the original equation: 2 × 4 + 3 = 11.', expression: '11 = 11 ✓' }
  ],
  visual: { type: 'equation', expression: '2x + 3 = 11', variable: 'x', value: 4, min: 0, max: 8, label: 'Keep both sides equal' }
};

const prompt = `You are a careful, encouraging tutor for advanced math and science. Read the uploaded problem and produce an interactive lesson. When a student-confirmed question is supplied, solve exactly that question. For unconfirmed multi-question images, identify candidates and ask the student to choose before solving. Include top-level fields "multipleQuestionsDetected": boolean and "questionCount": integer. Return only JSON matching: {"title":"short","question":"faithful transcription","answer":"correct result","explanation":"clear compact explanation, aim <=1000 chars, hard maximum 1500; include reasoning","spokenExplanation":"a warm, concise voiceover written for speech, not copied notation: say every equation in natural spoken words, for example ‘y prime equals cosecant squared x’ and ‘y equals three minus cotangent of x’; speak fractions, powers, Greek letters, derivatives, and punctuation as a human tutor would; include the reasoning and final answer; no LaTeX, symbols, bullet labels, or stage directions","options":[{"label":"A","text":"choice","reason":"why correct/incorrect"}],"steps":[{"title":"short","detail":"teaching explanation","expression":"math expression"}],"visual":{"type":"derivative|function|equation|sequence|geometry|data","label":"what to explore","expression":"simple expression using x, e, pi, sin, cos, tan, csc, cosec, sec, cot, sqrt, abs, ln, exp, ^ and arithmetic; e.g. 3-cot(x)","derivative":"simple derivative expression using same syntax, when applicable","variable":"x","value":number,"min":number,"max":number,"points":[{"x":number,"y":number,"label":"optional"}],"focus":"slope|area|roots|transform|sequence|geometry"}}. Include EVERY visible answer choice and explain each, with options=[] if none. Give as many logical steps as needed for complete clarity; do not cap the step count. Make every transformation explicit and independently understandable. Choose a visualization that genuinely teaches this exact problem. For sequences and data, return meaningful discrete points [{"x":termIndexOrX,"y":value,"label":"..."}] and useful axis ranges. For geometry, return labeled vertices/points in order and a shape name when applicable. Include the math display string using \\(LaTeX\\) delimiters for fractions, integrals, powers, and special notation: derivatives should show f and f' together with a movable tangent and slope; functions should graph the given function and support inspection; equations should interactively test the variable; sequences should show terms; geometry/data should use an appropriate diagram. For an initial-value problem that gives dy/dx and y at x=a, explicitly integrate dy/dx to obtain y(x), determine the integration constant from the initial value, and evaluate at the requested x. Visualize the resulting y(x) together with its derivative dy/dx, and choose an x-range that includes the given/requested x while avoiding singularities. Supply the actual expression, derivative, and useful range; for this example the forms 3-cot(x) and csc(x)^2 are valid. Do not substitute an unrelated canned example. Use JSON null for values you cannot infer. Never return HTML, SVG, code, or instructions to execute code. Do not invent unreadable information.`;

const detectPrompt = ` FIRST decide the subject yourself and add two top-level fields: "subject":"math"|"chemistry"|"arabic" and "problemType":"algebra|linear|quadratic|derivative|integral|limit|trigonometry|geometry|statistics|physics|optimization|other" (for Arabic use "irab"). For definite/indefinite integrals use visual {"type":"integral","expression":"integrand","a":lower limit,"min":number,"max":number,"value":upper limit}. Quadratics use visual type "function".
If the input is an Arabic sentence or Arabic grammar (إعراب) question, set subject "arabic" and visual {"type":"arabic"}. Use the ENTIRE image and any quoted verse/passage as grammatical context even when a confirmed question is supplied. Add "arabic":{"sentenceType":"...","sourceText":"the complete relevant sentence or verse exactly as printed","focusText":"the exact word, phrase, or clause asked about","words":[{"word":"each word of the COMPLETE relevant sentence, with full tashkeel when legible","pos":"...","case":"raf|nasb|jarr|jazm|mabni","irab":"complete formal إعراب in Arabic","why":"simple Arabic reason","whyEn":"same reason in simple English","focus":true}]}. Include one entry for every word in the relevant source sentence in reading order; attach pronoun suffixes to their word and explain them in that word's irab. Mark only words belonging to the requested phrase with focus=true. Answer the exact grammar question and, for multiple choice, include the correct option label and exact option text in answer and include all visible options with reasons. Explain in Arabic and English. CRITICAL: determine a clause's grammatical role from its complete host sentence. Do not call a clause صلة الموصول merely because an اسم موصول such as من occurs nearby: only the clause directly describing that relative pronoun is its صلة. Check whether the requested clause is instead a خبر لا, خبر مبتدأ, حال, صفة, or another syntactic role. Example: in "ولا كل من تهواه يهواك قلبه", "تهواه" is صلة الموصول, while "يهواك قلبه" is في محل رفع خبر لا النافية للجنس; the correct choice for the latter is "أ — رفع خبر لا". For other questions, reason from their own complete context and options; do not copy the example. Be precise and never invent unreadable words.`;

const arabicSpacingPrompt = `For every Arabic string, put one ordinary visible space between each separate word. Never concatenate words in answer, explanation, spokenExplanation, options, sourceText, words[].pos, words[].irab, words[].why, or words[].whyEn. Keep Arabic word order intact.`;

const stepsPrompt = ` STEP FORMAT (math): there is no math branch to pick; you choose the tools. Every step object must be {"title":"short","rule":"name the rule or principle applied in this step","latex":"the equation at this step in LaTeX (e.g. \\\\frac{dy}{dx}=3\\\\cdot6x^{6-1}=18x^{5})","note":"one or two sentences: what changed in this step and WHY (name the rule, show the arithmetic)","symbols":[{"sym":"LaTeX of a symbol/number that appears","why":"why it is there / what it means"}],"scene":{...}}. Give 2-3 symbols per step that a student might not understand. Show EVERY algebraic transformation as its own step; never skip arithmetic. "scene" is optional per step and drives the graph: {"type":"function|derivative|integral","expression":"...","derivative":"...","a":number,"min":number,"max":number,"value":number,"legend":[{"c":"f|d|t","text":"what this drawn line/area MEANS in this problem"}],"caption":"one sentence telling the student what the graph shows at THIS step and how it connects to the algebra","answers":[{"x":number,"label":"short label"}] (put a marker where the final answer lives on the x-axis: roots, the evaluation point, an upper limit; always include it in the final step's scene),"notes":[{"x":number,"y":number,"text":"short note pinned on the graph"}]}. Only add a scene when the graph genuinely clarifies that step; each scene must change what is shown (different function, point or region). Use the simple syntax (x, ^, *, sin, cos, tan, sqrt, ln, exp, pi).`;

const chemPrompt = ` CHEMISTRY: prioritize exam practice in iron and metallurgy; qualitative analysis (carbonate, sulfate, halide, nitrate and phosphate tests); volumetric analysis and titration; ionic equilibrium (Kc, Kw, pH, Ka, Kb, hydrolysis, Ksp); electrochemistry (half-reactions, cells, electrolysis, Faraday laws); and organic conversions (alcohols, aldehydes, ketones, acids, esters, aromatics). For any chemistry question, set subject="chemistry" and visual {"type":"chem"}. For a non-reaction problem, set chemistry.labType to titration, equilibrium, electrochemistry, organic, or metallurgy and include a lab object: titration uses acidM, baseM, acidVolumeMl, baseMaxMl and acid/base labels; equilibrium uses Kc and species with formula, initial concentration, signed change, coefficient and side; electrochemistry uses anode/cathode names and reduction potentials; organic/metallurgy uses ordered stages with equations and explanations. Include exact known values only; use null when absent. For qualitative tests, use labType qualitative with the tested ion, reagent, observation, and confirmatory test. If the question is about a reaction, compounds, gases, precipitates, acids/bases, redox, balancing, etc., set "subject":"chemistry","problemType":"reaction", visual {"type":"chem"}, options [] and add "chemistry":{"type":"short reaction class","reactants":[{"formula":"ASCII formula e.g. Ca(OH)2","coef":number,"state":"s|l|g|aq","name":"..."}],"products":[...same],"obs":{"from":"#hex liquid colour before","to":"#hex colour after","solid":{"color":"#hex","label":"…"}|null,"precipitate":{"color":"#hex","label":"…"}|null,"gas":{"formula":"CO2","label":"CO₂ bubbles — gas evolved"}|null,"heat":"exo|endo|none","liquidLabel":"…"},"elements":[{"sym":"Ca","name":"Calcium","z":20,"why":"its role in THIS reaction"}],"gasTest":"how to identify the gas / precipitate, if any"}. Coefficients MUST balance (the app verifies atom counts). Use real, accurate colours and observations. Steps: unbalanced equation, balancing, why it happens, identify gas/precipitate; use \\\\rightarrow, \\\\uparrow, \\\\downarrow in latex. If there is no reaction, set coefficients anyway to the best-known reaction and say so in the explanation.`;

function providerError(status, body, provider) {
  let detail = '', payload;
  try { payload = JSON.parse(body); detail = payload?.error?.message || ''; } catch { detail = body.slice(0, 300); }
  status = Number(status) || Number(payload?.error?.code) || 0;
  if (status === 429 || /quota|resource_exhausted/i.test(detail)) return `${provider} quota is unavailable for this key or model right now. Check billing and model access in the provider dashboard. Your uploaded problem was not analyzed.`;
  if (status === 401 || status === 403) return `${provider} rejected the API key or the key lacks permission. Check the key and project access.`;
  if (status === 404) return `${provider} could not find the configured model or voice. Check its ID in .env.`;
  return `${provider} request failed (${status}). ${detail.slice(0, 240)}`;
}

function getProviderStatus(error) {
  let status = Number(error?.status) || Number(error?.code) || 0;
  if (!status) {
    const message = String(error?.message || '');
    try { status = Number(JSON.parse(message)?.error?.code) || 0; } catch {}
    if (!status && /\b503\b|SERVICE_UNAVAILABLE|UNAVAILABLE/i.test(message)) status = 503;
    if (!status && /\b429\b|RESOURCE_EXHAUSTED/i.test(message)) status = 429;
  }
  return status;
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function generateLesson(ai, model, { file, text, hint }) {
  const parts = [];
  if (file) parts.push({ inlineData: { mimeType: file.mimetype, data: file.buffer.toString('base64') } });
  if (text) parts.push({ text: `Student-confirmed question (use this exact question; do not select another problem from other image content):\n"""${text}"""` });
  const result = await ai.models.generateContent({
    model,
    contents: [...parts, { text: prompt + detectPrompt + arabicSpacingPrompt + stepsPrompt + chemPrompt + (hint && hint !== 'auto' ? ` The student selected the subject: ${hint}.` : '') }],
    config: { responseMimeType: 'application/json' }
  });
  const data = JSON.parse(result.text);
  if (data.subject === 'chemistry' || data.visual?.type === 'chem') {
    const c = data.chemistry, supportedLabs = ['reaction','qualitative','titration','equilibrium','electrochemistry','organic','metallurgy'];
    if (!c || !supportedLabs.includes(c.labType || 'reaction')) throw new Error('Could not identify the chemistry lab for this question. Try a clearer image.');
    if (Array.isArray(c.reactants) && Array.isArray(c.products)) [...c.reactants, ...c.products].forEach(r => { r.coef = Math.max(1, Math.round(Number(r.coef) || 1)); r.formula = String(r.formula || '').replace(/[^A-Za-z0-9()]/g, ''); r.state ||= ''; });
    if (!c.lab && (!c.reactants?.length || !c.products?.length)) throw new Error('The chemistry response did not include a usable lab. Please try again.');
    c.obs ||= {}; c.elements ||= []; data.subject = 'chemistry'; data.problemType = c.labType || 'reaction'; data.options = []; data.visual = { type: 'chem' };
    data.question ||= 'Chemistry question'; data.answer ||= 'See the result in the lab'; data.explanation ||= 'Explore the chemistry model.'; data.steps ||= [];
  } else if (data.subject === 'arabic' || data.visual?.type === 'arabic') {
    const words = Array.isArray(data.arabic?.words) ? data.arabic.words.filter(w => w?.word) : [];
    if (!words.length) throw new Error('Could not parse that Arabic sentence. Try a clearer image or type it.');
    const ok = ['raf', 'nasb', 'jarr', 'jazm', 'mabni'];
    words.forEach(w => { w.case = ok.includes(w.case) ? w.case : 'mabni'; w.pos ||= ''; w.irab ||= ''; w.why ||= ''; w.whyEn ||= ''; w.focus = w.focus === true; });
    data.subject = 'arabic'; data.problemType = 'irab'; data.arabic.words = words; data.options = Array.isArray(data.options) ? data.options : []; data.visual = { type: 'arabic' };
    data.question ||= words.map(w => w.word).join(' ');
    data.answer ||= data.question; data.explanation ||= 'Hover each word to see its إعراب.';
    data.steps = words.map(w => ({ title: `${w.word} — ${w.pos}`, detail: w.whyEn || w.why, expression: w.irab }));
  } else if (!data.explanation || !data.answer || !Array.isArray(data.steps) || !Array.isArray(data.options) || !data.visual || !['derivative','function','equation','sequence','geometry','data','integral'].includes(data.visual.type)) throw new Error('The tutor response was incomplete. Please try another image.');
  data.explanation = [...data.explanation].slice(0, 1500).join('');
  if (typeof data.spokenExplanation !== 'string') data.spokenExplanation = data.explanation;
  data.spokenExplanation = [...data.spokenExplanation].slice(0, 1500).join('');
  data.multipleQuestionsDetected = data.multipleQuestionsDetected === true;
  data.questionCount = Math.max(1, Math.min(30, Math.round(Number(data.questionCount) || 1)));
  data.mode = 'live';
  data.modelUsed = model;
  return data;
}

app.get('/api/status', async (_req, res) => {
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  const checks = await Promise.all([
    process.env.GEMINI_API_KEY ? fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}`, { headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY }, signal: AbortSignal.timeout(8000) }).then(async r => ({ configured: true, model, connected: r.ok, message: r.ok ? 'Gemini connected' : providerError(r.status, await r.text(), 'Gemini') })).catch(() => ({ configured: true, model, connected: false, message: 'Gemini could not be reached. Check your connection.' })) : { configured: false, model, connected: false, message: 'Add GEMINI_API_KEY in .env' },
    process.env.ELEVENLABS_API_KEY ? fetch('https://api.elevenlabs.io/v1/user', { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY }, signal: AbortSignal.timeout(8000) }).then(async r => ({ configured: true, connected: r.ok, message: r.ok ? 'ElevenLabs connected' : providerError(r.status, await r.text(), 'ElevenLabs') })).catch(() => ({ configured: true, connected: false, message: 'ElevenLabs could not be reached. Check your connection.' })) : { configured: false, connected: false, message: 'Add ELEVENLABS_API_KEY in .env' }
  ]);
  res.json({ gemini: checks[0], elevenLabs: checks[1] });
});

app.post('/api/read-image', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Choose an image first.' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'Add a Gemini API key to read questions from images.' });
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
      contents: [
        { inlineData: { mimeType: req.file.mimetype, data: req.file.buffer.toString('base64') } },
        { text: 'Read all legible schoolwork in this image, including printed Arabic exam pages. Return JSON only: {"questions":[{"text":"faithful transcription in the original language and script, including the question stem and every answer choice","region":{"x":0,"y":0,"width":1,"height":1}}]}. Arabic must be read right to left and kept in Arabic script; do not translate it. Preserve clearly visible tashkeel, Latin text, numbers, symbols, and equations. For a multiple-choice question, keep its stem and all choices together as ONE question. Include any quoted sentence or passage needed to answer it. Ignore decorative headings and logos. Detect separate numbered questions in reading order, at most 12. Region coordinates are normalized 0..1 relative to the full image and should include the complete question and choices. Do not solve, guess unreadable text, or add explanatory prose. If some text is legible, return it even if other text is blurred. Return an empty array only when no schoolwork text can be read.' }
      ],
      config: { responseMimeType: 'application/json' }
    });
    const parsed = JSON.parse(result.text || '{}');
    const questions = (Array.isArray(parsed.questions) ? parsed.questions : []).slice(0, 12).map((q, i) => {
      const r = q.region || {};
      return { number: i + 1, text: String(q.text || '').trim().slice(0, 600), region: { x: Math.max(0, Math.min(1, Number(r.x) || 0)), y: Math.max(0, Math.min(1, Number(r.y) || 0)), width: Math.max(0, Math.min(1, Number(r.width) || 1)), height: Math.max(0, Math.min(1, Number(r.height) || 1)) } };
    }).filter(q => q.text);
    return res.json({ questions });
  } catch (error) {
    const status = getProviderStatus(error) || 502;
    return res.status(status === 429 ? 429 : 502).json({ error: providerError(status, error.message || '', 'Gemini') });
  }
});

app.post('/api/analyze', upload.single('image'), async (req, res) => {
  const input = { hint: String(req.body?.subject || 'auto').slice(0, 12), file: req.file, text: typeof req.body?.text === 'string' ? req.body.text.trim().slice(0, 600) : '' };
  if (!input.file && !input.text) return res.status(400).json({ error: 'Add a PNG, JPG, WEBP or GIF image under 8 MB, or type your problem.' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'Image solving needs a Gemini API key. You can still explore the interactive sample lessons on the left.' });
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const primary = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
    const fallbackModels = (process.env.GEMINI_FALLBACK_MODELS || process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite,gemini-3.6-flash')
      .split(',').map(model => model.trim()).filter((model, index, models) => model && model !== primary && models.indexOf(model) === index);
    try {
      const data = await generateLesson(ai, primary, input);
      return res.json(data);
    } catch (firstError) {
      if (getProviderStatus(firstError) !== 503) throw firstError;
      console.warn(`Gemini ${primary} is temporarily busy; retrying once before fallback.`);
      await wait(900 + Math.floor(Math.random() * 500));
      try {
        const data = await generateLesson(ai, primary, input);
        return res.json(data);
      } catch (retryError) {
        if (getProviderStatus(retryError) !== 503 || !fallbackModels.length) throw retryError;
        let lastError = retryError;
        for (const fallback of fallbackModels) {
          console.warn(`Gemini ${primary} is still busy; trying fallback ${fallback}.`);
          try {
            const data = await generateLesson(ai, fallback, input);
            data.fallbackUsed = true;
            return res.json(data);
          } catch (fallbackError) {
            lastError = fallbackError;
            if (getProviderStatus(fallbackError) !== 503) throw fallbackError;
          }
        }
        throw lastError;
      }
    }
  } catch (error) {
    const status = getProviderStatus(error) || 502;
    const message = providerError(status, error.message || '', 'Gemini');
    console.error('Gemini analysis failed:', message);
    res.status(status === 429 ? 429 : status === 401 || status === 403 ? status : 502).json({ error: message });
  }
});

app.post('/api/explain', async (req, res) => {
  const question = String(req.body?.question || '').trim().slice(0, 240);
  const problem = String(req.body?.problem || '').trim().slice(0, 600);
  const answer = String(req.body?.answer || '').trim().slice(0, 300);
  const step = String(req.body?.step || '').trim().slice(0, 500);
  if (!question || !step) return res.status(400).json({ error: 'Choose a step and enter the part you want clarified.' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'Add a Gemini API key to ask a follow-up. The original step is still available.' });
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const contents = 'You are a patient math and science tutor. Explain only the student requested point in plain, precise language. Keep it under 140 words, use correct notation, and do not change the supplied answer.\nProblem: ' + problem + '\nCorrect answer: ' + answer + '\nCurrent step: ' + step + '\nStudent asks: ' + question;
    const result = await ai.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite', contents });
    return res.json({ explanation: String(result.text || '').slice(0, 1600) });
  } catch (error) {
    const status = getProviderStatus(error) || 502;
    return res.status(status === 429 ? 429 : 502).json({ error: providerError(status, error.message || '', 'Gemini') });
  }
});
app.post('/api/speech', async (req, res) => {
  const text = typeof req.body?.narration === 'string' ? req.body.narration.slice(0, 1500) : '';
  if (!text) return res.status(400).json({ error: 'There is no spoken lesson to generate.' });
  if (!process.env.ELEVENLABS_API_KEY) return res.status(503).json({ error: 'Add an ElevenLabs API key to enable voice. The written lesson is ready.' });
  try {
    const voice = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`, { method: 'POST', headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' }, body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.55, similarity_boost: 0.75 } }) });
    if (!response.ok) return res.status(response.status === 429 ? 429 : response.status === 401 || response.status === 403 ? response.status : 502).json({ error: providerError(response.status, await response.text(), 'ElevenLabs') });
    res.type('audio/mpeg').send(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error('Speech generation failed:', error.message);
    res.status(502).json({ error: 'Voice generation failed. You can still read the explanation above.' });
  }
});

app.listen(process.env.PORT || 3000, () => console.log(`مُعلمي is ready at http://localhost:${process.env.PORT || 3000}`));

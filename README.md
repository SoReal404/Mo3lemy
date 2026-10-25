<!-- مُعلمي | Interactive learning, one clear step at a time -->
<div align="center">
  <h1>مُعلمي</h1>
  <p><strong>Understand the why behind every answer.</strong></p>
  <p>Upload a school question, follow a clear explanation, and explore the idea in an interactive workspace.</p>
  <p>
    <img alt="Node.js 20+" src="https://img.shields.io/badge/Node.js-20%2B-43853d?logo=nodedotjs&logoColor=white">
    <img alt="Express 5" src="https://img.shields.io/badge/Express-5-111111?logo=express&logoColor=white">
    <img alt="Math, chemistry, Arabic" src="https://img.shields.io/badge/LEARN-Math%20%7C%20Chemistry%20%7C%20Arabic-6f9e76">
    <img alt="AI powered" src="https://img.shields.io/badge/AI-Gemini-4285F4?logo=googlegemini&logoColor=white">
  </p>
</div>

---

## ✨ What you can do

| 📚 Subject | 🧭 Learning tools |
| --- | --- |
| **Math** | Step-by-step solutions, rendered notation, and interactive graphs for supported problems. |
| **Chemistry** | Reaction and concept explanations, with focused interactive chemistry views. |
| **Chemistry Lab** | A separate React + TypeScript sandbox with draggable reagents, beakers/flasks/test tubes, ion concentrations, pH, temperature estimates, indicators, animated gas bubbles, and balanced reaction equations. |
| **Arabic grammar** | Word-by-word إعراب, case highlighting, and explanations of the grammatical rule. |
| **Any subject** | Upload a question photo, review detected text, choose a question, and ask for a step to be explained again. |

The interactive board is a dedicated workspace. Use the available controls to explore a graph or model, annotate it, and reset it to the solution state. Open the chemistry sandbox from **Chemistry Lab** in the main navigation or visit `/chemistry-lab/`.

The lab code is isolated from the lesson UI: `src/chemistry-lab/engine/ChemistryEngine.ts` owns solution state and stoichiometric updates, `src/chemistry-lab/canvas/LabCanvas.tsx` draws the bench and bubble particles, and `src/chemistry-lab/components/` contains the shelf and live analysis panels. Vite builds the React/TypeScript page into `public/chemistry-lab/` for Express and Vercel to serve.

## 🚀 Run locally

**Requirements:** Node.js 20 or newer and npm.

```powershell
npm install
Copy-Item .env.example .env
npm start
```

Open [http://localhost:3000](http://localhost:3000). If you already have a `.env`, keep it and edit its values instead of copying the example over it.

The demo lessons work without API keys. Image analysis needs a Gemini API key. Voice lessons also need an ElevenLabs key. The interactive chemistry lab runs locally in the browser and does not need an AI key.

## 🔐 Configure API keys

Add these values to your local `.env` file. Keep the file private; it is excluded from Git.

| Variable | Required? | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | For image analysis | Gemini access key from [Google AI Studio](https://aistudio.google.com/app/apikey). |
| `GEMINI_MODEL` | No | Model name; defaults to `gemini-3.1-flash-lite`. |
| `GEMINI_FALLBACK_MODELS` | No | Comma-separated fallback models for temporary availability issues. |
| `ELEVENLABS_API_KEY` | For voice lessons | ElevenLabs API key. |
| `ELEVENLABS_VOICE_ID` | No | Voice ID; a default is provided. |
| `PORT` | No | Local server port; defaults to `3000`. |

**Never put provider keys in browser JavaScript or commit `.env`.** For Vercel, add keys under **Project Settings → Environment Variables** and redeploy.

## ☁️ Deploy to Vercel

This project uses Express and can be deployed from its GitHub repository through Vercel's [Express support](https://vercel.com/docs/frameworks/backend/express).

1. Push this repository to GitHub and import it from [vercel.com/new](https://vercel.com/new).
2. Add `GEMINI_API_KEY` as a **Production** environment variable. Add `ELEVENLABS_API_KEY` if voice lessons are needed.
3. Deploy, then share the generated `vercel.app` address.

Vercel Functions have a **4.5 MB request-body limit**. Keep uploaded images below 4 MB when using the Vercel deployment; the local app's upload limit is higher. See [Vercel Function limits](https://vercel.com/docs/functions/limitations).

Vercel Hobby is for personal, non-commercial projects. Anyone who can access a shared public URL can use the app's configured AI providers, so protect your provider quotas and keep API keys private.

## 🧰 Built with

- Node.js and Express
- Vanilla JavaScript, HTML, and CSS for the main lesson experience
- React, TypeScript, and Vite for the standalone chemistry lab
- Google Gemini for reading and explaining questions
- KaTeX for mathematics notation
- ElevenLabs for optional voice lessons

## 🛡️ Privacy notes

Uploaded images are held in memory by the server for the request and are not saved as files. Avoid uploading private or sensitive information. API keys stay on the server and should only be configured through local environment files or the hosting provider's secret settings.

---

<div align="center">
  <strong>مُعلمي</strong> · Learn one step at a time ✳
</div>

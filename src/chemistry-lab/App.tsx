import { useEffect, useMemo, useRef, useState } from 'react';
import { ChemicalShelf } from './components/ChemicalShelf';
import { LivePanel } from './components/LivePanel';
import { LabCanvas } from './canvas/LabCanvas';
import { addChemical, CHEMICALS, createContainer } from './engine/ChemistryEngine';
import type { ChemicalId, ContainerState, VesselKind } from './engine/types';
import './chemistry.css';

const vesselKinds: VesselKind[] = ['Beaker', 'Erlenmeyer flask', 'Test tube'];
const MAX_VESSELS = 4;

export default function App() {
  const [containers, setContainers] = useState<ContainerState[]>([createContainer('Beaker', 1)]);
  const [selectedId, setSelectedId] = useState(containers[0].id);
  const [chemicalId, setChemicalId] = useState<ChemicalId>('hcl');
  const [dose, setDose] = useState(5);
  const [notice, setNotice] = useState('Choose a chemical, then click a vessel to add it.');
  const [pouring, setPouring] = useState(false);
  const containersRef = useRef(containers); containersRef.current = containers;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pourTimer = useRef<number | undefined>(undefined);
  const vessel = useMemo(() => containers.find(item => item.id === selectedId) || containers[0], [containers, selectedId]);
  const selectedChemical = CHEMICALS.find(item => item.id === chemicalId) || CHEMICALS[0];
  useEffect(() => () => { if (pourTimer.current !== undefined) window.clearInterval(pourTimer.current); }, []);

  const pour = (id: string, reagent: ChemicalId, amount = dose) => {
    const current = containersRef.current.find(item => item.id === id);
    if (!current) return;
    try {
      const result = addChemical(current, reagent, amount);
      const updated = containersRef.current.map(item => item.id === id ? result.state : item);
      containersRef.current = updated; setContainers(updated);
      const reagentName = CHEMICALS.find(item => item.id === reagent)?.name || reagent;
      setNotice(result.events.length ? `${result.events.map(event => event.title).join(' + ')} · ${result.events.at(-1)?.equation}` : `${reagentName} added to ${current.label}.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not add that chemical.'); }
  };

  const addVessel = (kind: VesselKind) => {
    if (containersRef.current.length >= MAX_VESSELS) { setNotice(`The bench holds up to ${MAX_VESSELS} vessels. Remove one to make room.`); return; }
    const numbers = containersRef.current.map(item => Number(item.label.match(/(\d+)$/)?.[1] || 0));
    const next = createContainer(kind, Math.max(0, ...numbers) + 1);
    const updated = [...containersRef.current, next]; containersRef.current = updated; setContainers(updated); setSelectedId(next.id);
    setNotice(`${next.label} is ready with 50 mL of water.`);
  };
  const removeVessel = (id: string) => {
    if (containersRef.current.length <= 1) { setNotice('Keep at least one vessel on the bench.'); return; }
    const updated = containersRef.current.filter(item => item.id !== id); containersRef.current = updated; setContainers(updated);
    if (selectedId === id) setSelectedId(updated[0].id);
    setNotice('Vessel removed from the experiment workspace.');
  };
  const resetVessel = () => {
    if (!vessel) return;
    const clean = createContainer(vessel.kind, Number(vessel.label.match(/(\d+)$/)?.[1] || 1));
    clean.id = vessel.id; clean.label = vessel.label;
    const updated = containersRef.current.map(item => item.id === vessel.id ? clean : item); containersRef.current = updated; setContainers(updated);
    setNotice(`${vessel.label} reset to 50 mL of water at 20 °C.`);
  };
  const resetAll = () => {
    const clean = [createContainer('Beaker', 1)]; containersRef.current = clean; setContainers(clean); setSelectedId(clean[0].id);
    setNotice('Bench reset. One clean beaker is ready.');
  };
  const startPour = () => {
    if (pourTimer.current !== undefined) return;
    setPouring(true);
    const increment = selectedChemical.doseLabel === 'g' ? 0.01 : 0.25;
    pour(vessel.id, chemicalId, increment);
    pourTimer.current = window.setInterval(() => pour(vessel.id, chemicalId, increment), 180);
  };
  const stopPour = () => { if (pourTimer.current !== undefined) window.clearInterval(pourTimer.current); pourTimer.current = undefined; setPouring(false); };
  const saveScreenshot = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const link = document.createElement('a'); link.download = 'mo3lemy-chemistry-bench.png'; link.href = canvas.toDataURL('image/png'); link.click();
  };
  const saveReport = async () => {
    try { const { downloadExperimentPdf } = await import('./report/createExperimentPdf'); downloadExperimentPdf(containers, canvasRef.current); setNotice('Color experiment report downloaded as a PDF.'); }
    catch { setNotice('Could not export the report. Please try again after the bench finishes drawing.'); }
  };

  return <main className="chem-lab-app">
    <header className="lab-topbar">
      <a href="/" className="lab-brand"><span className="lab-brand-icon">✳</span><span>مُعلمي <small>CHEMISTRY LAB</small></span></a>
      <div className="lab-top-links"><a href="/">← Back to lessons</a><span className="lab-state-pill"><i /> REACTION ENGINE READY</span></div>
    </header>
    <section className="lab-intro"><div><span className="eyebrow">VIRTUAL CHEMISTRY SANDBOX · 01</span><h1>Mix it.<br/><em>See why it reacts.</em></h1><p>Choose a reagent and add it to the glassware. Watch the ions, colour, temperature and reaction equation update as you experiment.</p></div>
      <div className="lab-intro-aside"><span>✳</span><div><b>Start with a prediction</b><small>What do you think will happen when these chemicals meet?</small></div></div>
    </section>
    <section className="lab-workspace" aria-label="Virtual chemistry lab">
      <ChemicalShelf selected={chemicalId} onSelect={setChemicalId} />
      <section className="lab-panel bench-panel">
        <div className="panel-heading"><div><span className="eyebrow">02 · THE LAB BENCH</span><h2>Experiment workspace</h2></div><button className="text-button" type="button" onClick={resetAll}>Reset bench <span>↺</span></button></div>
        <div className="bench-toolbar"><div className="vessel-buttons">{vesselKinds.map(kind => <button key={kind} type="button" disabled={containers.length >= MAX_VESSELS} title={containers.length >= MAX_VESSELS ? `Maximum ${MAX_VESSELS} vessels` : `Add ${kind}`} onClick={() => addVessel(kind)}><span>＋</span>{kind}</button>)}</div><div className="export-actions"><button className="text-button screenshot-button" type="button" onClick={saveScreenshot}>⇩ Save image</button><button className="report-button" type="button" onClick={saveReport}>▤ Export colorful PDF</button></div></div>
        <div className="canvas-frame"><LabCanvas ref={canvasRef} containers={containers} selectedId={selectedId} selectedChemical={chemicalId} onSelectVessel={setSelectedId} onPour={pour} /><div className="canvas-status"><i /> {notice}</div></div>
        <div className="bench-footer"><div className="vessel-tabs" role="tablist" aria-label="Select a vessel">{containers.map(item => <span key={item.id} className={`vessel-tab ${item.id === selectedId ? 'active' : ''}`}><button type="button" role="tab" aria-selected={item.id === selectedId} onClick={() => setSelectedId(item.id)}>{item.kind === 'Test tube' ? '◯' : '▱'} {item.label}</button>{containers.length > 1 && <button type="button" className="remove-vessel" aria-label={`Remove ${item.label}`} title={`Remove ${item.label}`} onClick={() => removeVessel(item.id)}>×</button>}</span>)}</div>
          <div className="dose-controls"><label htmlFor="dose">Dose</label><input id="dose" type="number" min="0.1" max={selectedChemical.doseLabel === 'g' ? 5 : 250} step={selectedChemical.doseLabel === 'g' ? 0.05 : 0.5} value={dose} onChange={event => setDose(Math.max(.1, Number(event.target.value) || .1))}/><span>{selectedChemical.doseLabel}</span>
            <button type="button" className="pour-button" onClick={() => pour(vessel.id, chemicalId)}>Pour {selectedChemical.formula}</button>
            <button type="button" className={`hold-button ${pouring ? 'is-pouring' : ''}`} onPointerDown={event => { event.preventDefault(); startPour(); }} onPointerUp={stopPour} onPointerLeave={stopPour} onPointerCancel={stopPour} aria-label="Press and hold to pour slowly">{pouring ? 'Pouring…' : 'Hold to pour'}</button>
          </div>
        </div>
        <div className="safety-strip"><span>⚑</span><p><b>Virtual experiment.</b> The reaction model is simplified for learning; it does not represent laboratory safety instructions or real-world quantities.</p></div>
      </section>
      <LivePanel vessel={vessel} onReset={resetVessel} />
    </section>
    <footer className="lab-footer"><span>مُعلمي · CHEMISTRY LAB</span><span>Observe → Measure → Explain ✳</span></footer>
  </main>;
}

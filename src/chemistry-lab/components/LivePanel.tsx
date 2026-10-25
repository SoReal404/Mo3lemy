import { contentsOf, ionConcentrations, pHOf } from '../engine/ChemistryEngine';
import type { ContainerState } from '../engine/types';

interface Props { vessel: ContainerState; onReset: () => void; }

export function LivePanel({ vessel, onReset }: Props) {
  const pH = pHOf(vessel);
  const pHColor = pH < 3 ? '#ef6764' : pH < 6.5 ? '#f0b35b' : pH < 7.5 ? '#72ca8e' : pH < 11 ? '#56b3cf' : '#a780ec';
  return <aside className="lab-panel live-panel">
    <div className="panel-heading"><div><span className="eyebrow">03 · LIVE ANALYSIS</span><h2>Inside the vessel</h2></div><button className="icon-button" type="button" onClick={onReset} title="Reset this vessel" aria-label="Reset this vessel">↺</button></div>
    <div className="selected-vessel-label"><span className="live-dot" />{vessel.label}<small>MODEL UPDATED IN REAL TIME</small></div>
    <div className="metrics-grid">
      <div className="metric-card ph-card"><span>pH</span><b style={{ color: pHColor }}>{pH.toFixed(2)}</b><div className="ph-track"><i style={{ left: `${(pH / 14) * 100}%`, background: pHColor }} /></div><small>{pH < 6.5 ? 'ACIDIC' : pH < 7.5 ? 'NEUTRAL' : 'BASIC'}</small></div>
      <div className="metric-card"><span>Temperature</span><b>{vessel.temperatureC.toFixed(1)}<i>°C</i></b><small>EST. SOLUTION TEMP</small></div>
      <div className="metric-card"><span>Total volume</span><b>{vessel.volumeMl.toFixed(1)}<i>mL</i></b><small>INCLUDING REAGENTS</small></div>
      <div className="metric-card"><span>Gas formed</span><b>{(vessel.gasMoles * 1000).toFixed(2)}<i>mmol</i></b><small>H₂ COLLECTED</small></div>
    </div>
    <section className="data-section"><div className="section-heading"><h3>Molecular inventory</h3><span>{ionConcentrations(vessel).length} dissolved ions</span></div>
      <div className="contents-list">{contentsOf(vessel).map(item => <div className="content-row" key={item}><span className="content-orb" />{item}</div>)}</div>
    </section>
    <section className="data-section equation-section"><div className="section-heading"><h3>Reaction log</h3><span>Balanced equations</span></div>
      {vessel.reactions.length ? <div className="reaction-list">{[...vessel.reactions].reverse().map(reaction => <article className="reaction-card" key={reaction.id}>
        <div className="reaction-title"><span>✓</span>{reaction.title}</div><div className="reaction-equation">{reaction.equation}</div><p>{reaction.detail}</p>
      </article>)}</div> : <div className="empty-reaction"><span>∑</span><b>No reaction yet</b><p>Add a reagent to see a balanced equation and the change it causes.</p></div>}
    </section>
    <div className="engine-note"><span>ⓘ</span><p>Teaching model: strong electrolytes are treated as dissociated ions. Temperature is an idealized adiabatic estimate; real results vary with heat loss and solution density.</p></div>
  </aside>;
}

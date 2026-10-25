import { CHEMICALS } from '../engine/ChemistryEngine';
import type { ChemicalId } from '../engine/types';

const categories = ['Acids', 'Bases', 'Indicators', 'Metals', 'Salts'] as const;

interface Props { selected: ChemicalId; onSelect: (id: ChemicalId) => void; }

export function ChemicalShelf({ selected, onSelect }: Props) {
  return <aside className="lab-panel chemical-shelf">
    <div className="panel-heading"><div><span className="eyebrow">01 · CHEMICAL SHELF</span><h2>Choose a reagent</h2></div><span className="shelf-count">{CHEMICALS.length} ITEMS</span></div>
    <p className="panel-intro">Select a bottle, then click a vessel—or drag it onto the bench.</p>
    {categories.map(category => <section className="shelf-category" key={category}>
      <h3>{category}<span>{CHEMICALS.filter(item => item.category === category).length}</span></h3>
      <div className="chemical-list">{CHEMICALS.filter(item => item.category === category).map(item => <button
        key={item.id} type="button" draggable aria-pressed={selected === item.id}
        className={`chemical-card ${selected === item.id ? 'is-selected' : ''}`}
        onClick={() => onSelect(item.id)} onDragStart={event => { event.dataTransfer.setData('text/chemical-id', item.id); event.dataTransfer.effectAllowed = 'copy'; onSelect(item.id); }}>
        <span className="chemical-swatch" style={{ '--chemical-color': item.color } as React.CSSProperties}>{item.category === 'Indicators' ? '◉' : item.category === 'Metals' ? '▦' : '●'}</span>
        <span className="chemical-info"><b>{item.name}</b><small><strong>{item.formula}</strong> · {item.shortDescription}</small></span>
        <span className="chemical-grip" aria-hidden="true">⠿</span>
      </button>)}</div>
    </section>)}
    <div className="shelf-tip"><span>✳</span><p><b>Hands-on mode</b><br/>Try HCl + NaOH, then add an indicator. Use the same measured amount to find the neutral point.</p></div>
  </aside>;
}

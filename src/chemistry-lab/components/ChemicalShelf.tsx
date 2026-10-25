import { CHEMICALS } from '../engine/ChemistryEngine';
import type { ChemicalId } from '../engine/types';

const categories = ['Acids', 'Bases', 'Indicators', 'Metals', 'Salts', 'Solvents'] as const;

interface Props { selected: ChemicalId; onSelect: (id: ChemicalId) => void; onAdd: (id: ChemicalId, amount: number) => void; }

export function ChemicalShelf({ selected, onSelect, onAdd }: Props) {
  return <aside className="lab-panel chemical-shelf">
    <div className="panel-heading"><div><span className="eyebrow">01 · CHEMICAL SHELF</span><h2>Choose a reagent</h2></div><span className="shelf-count">{CHEMICALS.length} ITEMS</span></div>
    <p className="panel-intro">Drag a reagent to the bench, select it and click a vessel, or use ＋ to add it directly. Hover or focus any reagent for details.</p>
    <div className="shelf-catalog">{categories.map(category => <section className="shelf-category" key={category}>
      <h3>{category}<span>{CHEMICALS.filter(item => item.category === category).length}</span></h3>
      <div className="chemical-list">{CHEMICALS.filter(item => item.category === category).map(item => {
        const recommendedDose = item.doseLabel === 'g' ? 0.15 : item.category === 'Indicators' ? 1 : 5;
        const information = `${item.name} (${item.formula})\n${item.information || item.shortDescription}\n${item.shortDescription}\nModel dose: ${item.doseLabel}`;
        return <div className="chemical-row" key={item.id}>
          <button type="button" draggable title={information} aria-label={`${item.name}, ${item.formula}. ${item.information || item.shortDescription}`} aria-pressed={selected === item.id}
            className={`chemical-card ${selected === item.id ? 'is-selected' : ''}`}
            onClick={() => onSelect(item.id)} onDragStart={event => { event.dataTransfer.setData('text/chemical-id', item.id); event.dataTransfer.effectAllowed = 'copy'; onSelect(item.id); }}>
            <span className="chemical-swatch" style={{ '--chemical-color': item.color } as React.CSSProperties}>{item.category === 'Indicators' ? '◉' : item.category === 'Metals' ? '▦' : '●'}</span>
            <span className="chemical-info"><b>{item.name}</b><small><strong>{item.formula}</strong> · {item.shortDescription}</small></span>
            <span className="chemical-grip" aria-hidden="true">⠿</span>
          </button>
          <button className="chemical-quick-add" type="button" title={`Add ${recommendedDose} ${item.doseLabel} ${item.name} to the selected vessel`} aria-label={`Add ${item.name} to the selected vessel`} onClick={() => onAdd(item.id, recommendedDose)}>＋</button>
        </div>;
      })}</div>
    </section>)}</div>
    <div className="shelf-tip"><span>✳</span><p><b>Hands-on mode</b><br/>Try HCl + NaOH, then add an indicator. Use the same measured amount to find the neutral point.</p></div>
  </aside>;
}

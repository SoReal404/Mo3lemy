import { forwardRef, useEffect, useRef } from 'react';
import { liquidColor, pHOf } from '../engine/ChemistryEngine';
import type { ChemicalId, ContainerState } from '../engine/types';

interface Props {
  containers: ContainerState[];
  selectedId: string;
  selectedChemical: ChemicalId;
  onSelectVessel: (id: string) => void;
  onPour: (id: string, chemical: ChemicalId) => void;
}
interface Bubble { x: number; y: number; r: number; speed: number; drift: number; }

export const LabCanvas = forwardRef<HTMLCanvasElement, Props>(function LabCanvas({ containers, selectedId, selectedChemical, onSelectVessel, onPour }, ref) {
  const localRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ containers, selectedId, selectedChemical, onSelectVessel, onPour });
  stateRef.current = { containers, selectedId, selectedChemical, onSelectVessel, onPour };

  useEffect(() => {
    const canvas = localRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let frame = 0;
    let width = 0;
    let height = 0;
    const bubbles = new Map<string, Bubble[]>();
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
    const draw = () => {
      frame = requestAnimationFrame(draw);
      const { containers: items, selectedId: active, selectedChemical: activeChemical } = stateRef.current;
      ctx.clearRect(0, 0, width, height);
      const backdrop = ctx.createLinearGradient(0, 0, 0, height);
      backdrop.addColorStop(0, '#15241e'); backdrop.addColorStop(1, '#0c1512');
      ctx.fillStyle = backdrop; ctx.fillRect(0, 0, width, height);
      drawGrid(ctx, width, height);
      ctx.fillStyle = '#26352d'; ctx.fillRect(0, height * .79, width, height * .21);
      ctx.fillStyle = '#34483d'; ctx.fillRect(0, height * .79, width, 2);
      ctx.fillStyle = '#7b9182'; ctx.font = '10px "DM Mono", monospace'; ctx.fillText('LAB BENCH · DRAG A REAGENT TO A VESSEL', 22, 26);

      items.forEach((vessel, index) => {
        const centerX = width * (index + 1) / (items.length + 1);
        const size = vessel.kind === 'Test tube' ? 62 : vessel.kind === 'Erlenmeyer flask' ? 126 : 112;
        const top = height * .24;
        const base = height * .76;
        const h = base - top;
        const liquidLevel = base - h * Math.max(.24, Math.min(.68, .28 + vessel.volumeMl / 540));
        const selected = active === vessel.id;
        const path = vesselPath(vessel.kind, centerX, top + 23, size, h - 20);

        ctx.save(); ctx.clip(path);
        const color = liquidColor(vessel);
        const liquid = ctx.createLinearGradient(centerX - size / 2, liquidLevel, centerX + size / 2, base);
        liquid.addColorStop(0, color); liquid.addColorStop(1, tint(color, -22));
        ctx.globalAlpha = .82; ctx.fillStyle = liquid; ctx.fillRect(centerX - size, liquidLevel, size * 2, base - liquidLevel + 20);
        ctx.globalAlpha = .5; ctx.fillStyle = '#eef9f4'; ctx.fillRect(centerX - size * .38, liquidLevel + 3, size * .76, 2);
        if (vessel.solidsMol['Cu(OH)2(s)']) {
          ctx.globalAlpha = .84; ctx.fillStyle = '#6bbad9';
          ctx.beginPath(); ctx.ellipse(centerX, base - 16, size * .28, 7, 0, 0, Math.PI * 2); ctx.fill();
        }
        const cloud = bubbles.get(vessel.id) || [];
        const lastGasEvent = [...vessel.reactions].reverse().find(reaction => reaction.gasMoles > 0);
        const gasActive = Boolean(lastGasEvent && Date.now() - lastGasEvent.at < 6_000);
        if (gasActive) {
          if (Math.random() < Math.min(.38, .04 + vessel.gasMoles * 14)) cloud.push({ x: centerX + (Math.random() - .5) * size * .45, y: base - 15, r: 1.5 + Math.random() * 3, speed: .45 + Math.random() * .9, drift: (Math.random() - .5) * .3 });
          for (let i = cloud.length - 1; i >= 0; i--) {
            const bubble = cloud[i]; bubble.y -= bubble.speed; bubble.x += bubble.drift;
            if (bubble.y < liquidLevel + 8) { cloud.splice(i, 1); continue; }
            ctx.globalAlpha = .7; ctx.strokeStyle = '#e8fff5'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2); ctx.stroke();
          }
        }
        bubbles.set(vessel.id, cloud); ctx.restore();

        ctx.lineWidth = selected ? 3 : 2; ctx.strokeStyle = selected ? '#c6ef9a' : '#90aa9b'; ctx.fillStyle = '#dff0e51b';
        ctx.stroke(path); ctx.fill(path);
        drawGraduations(ctx, vessel.kind, centerX, top + 25, size, h - 24);
        ctx.fillStyle = selected ? '#e8f6da' : '#a6b8ac'; ctx.textAlign = 'center'; ctx.font = '600 12px Manrope, sans-serif'; ctx.fillText(vessel.label, centerX, base + 19);
        ctx.fillStyle = '#8fa398'; ctx.font = '10px "DM Mono", monospace'; ctx.fillText(`${Math.round(vessel.volumeMl)} mL · pH ${pHOf(vessel).toFixed(1)}`, centerX, base + 36);
        if (selected && activeChemical) {
          ctx.fillStyle = '#d6f29e'; ctx.beginPath(); ctx.arc(centerX, top + 7, 4, 0, Math.PI * 2); ctx.fill();
        }
      });
    };
    draw();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  const setRefs = (node: HTMLCanvasElement | null) => {
    localRef.current = node;
    if (typeof ref === 'function') ref(node); else if (ref) ref.current = node;
  };

  const pointVessel = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget, rect = canvas.getBoundingClientRect(), x = event.clientX - rect.left;
    const items = stateRef.current.containers;
    const index = Math.max(0, Math.min(items.length - 1, Math.round((x / rect.width) * items.length - .5)));
    return items[index];
  };

  return <canvas ref={setRefs} className="lab-bench-canvas" aria-label="Interactive chemistry bench. Click a vessel to pour the selected chemical." onClick={event => {
    const vessel = pointVessel(event); if (!vessel) return;
    stateRef.current.onSelectVessel(vessel.id); stateRef.current.onPour(vessel.id, stateRef.current.selectedChemical);
  }} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; }} onDrop={event => {
    event.preventDefault(); const id = event.dataTransfer.getData('text/chemical-id') as ChemicalId; const vessel = pointVessel(event);
    if (vessel && id) { stateRef.current.onSelectVessel(vessel.id); stateRef.current.onPour(vessel.id, id); }
  }} />;
});

function vesselPath(kind: ContainerState['kind'], x: number, y: number, w: number, h: number) {
  const p = new Path2D();
  if (kind === 'Test tube') {
    p.moveTo(x - w * .3, y); p.lineTo(x - w * .3, y + h * .76); p.quadraticCurveTo(x - w * .3, y + h, x, y + h);
    p.quadraticCurveTo(x + w * .3, y + h, x + w * .3, y + h * .76); p.lineTo(x + w * .3, y); p.closePath();
  } else if (kind === 'Erlenmeyer flask') {
    p.moveTo(x - w * .16, y); p.lineTo(x + w * .16, y); p.lineTo(x + w * .16, y + h * .35); p.lineTo(x + w * .47, y + h * .86);
    p.quadraticCurveTo(x + w * .5, y + h, x + w * .36, y + h); p.lineTo(x - w * .36, y + h); p.quadraticCurveTo(x - w * .5, y + h, x - w * .47, y + h * .86);
    p.lineTo(x - w * .16, y + h * .35); p.closePath();
  } else {
    p.moveTo(x - w * .42, y); p.lineTo(x - w * .42, y + h * .9); p.quadraticCurveTo(x - w * .42, y + h, x - w * .32, y + h);
    p.lineTo(x + w * .32, y + h); p.quadraticCurveTo(x + w * .42, y + h, x + w * .42, y + h * .9); p.lineTo(x + w * .42, y); p.closePath();
  }
  return p;
}

function drawGraduations(ctx: CanvasRenderingContext2D, kind: ContainerState['kind'], x: number, y: number, w: number, h: number) {
  if (kind === 'Erlenmeyer flask') return;
  ctx.strokeStyle = '#bdd4c83f'; ctx.lineWidth = 1;
  for (let i = 1; i <= 5; i++) { const yy = y + h * i / 6, length = (kind === 'Test tube' ? w * .17 : w * .15); ctx.beginPath(); ctx.moveTo(x + w * .32, yy); ctx.lineTo(x + w * .32 - length, yy); ctx.stroke(); }
}
function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = '#d7f0df08'; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = 0; x < w; x += 28) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
  for (let y = 0; y < h; y += 28) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
  ctx.stroke();
}
function tint(hex: string, amount: number) {
  const number = Number.parseInt(hex.slice(1), 16), r = Math.max(0, Math.min(255, (number >> 16) + amount)), g = Math.max(0, Math.min(255, ((number >> 8) & 255) + amount)), b = Math.max(0, Math.min(255, (number & 255) + amount));
  return `rgb(${r} ${g} ${b})`;
}

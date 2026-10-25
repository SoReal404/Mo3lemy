import { jsPDF } from 'jspdf';
import { contentsOf, pHOf } from '../engine/ChemistryEngine';
import type { ContainerState } from '../engine/types';

const green: [number, number, number] = [40, 81, 62];
const mint: [number, number, number] = [220, 244, 211];

export function downloadExperimentPdf(containers: ContainerState[], bench: HTMLCanvasElement | null) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageW = pdf.internal.pageSize.getWidth(), pageH = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const header = (kicker: string, title: string) => {
    pdf.setFillColor(...green); pdf.rect(0, 0, pageW, 43, 'F');
    pdf.setTextColor(...mint); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.text(kicker.toUpperCase(), margin, 14);
    pdf.setTextColor(255, 255, 255); pdf.setFontSize(23); pdf.text(title, margin, 27);
    pdf.setTextColor(209, 225, 211); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.text(`Mo3lemy Chemistry Lab  |  ${new Date().toLocaleString()}`, margin, 36);
  };
  const section = (title: string, y: number) => {
    pdf.setFillColor(236, 244, 232); pdf.roundedRect(margin, y - 6, pageW - margin * 2, 10, 2, 2, 'F');
    pdf.setTextColor(...green); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11); pdf.text(title, margin + 3, y + 1);
  };
  const writeLines = (text: string, x: number, y: number, maxW: number, lineH = 5) => {
    pdf.setTextColor(45, 56, 48); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9);
    const safe = pdfSafe(text);
    const lines = pdf.splitTextToSize(safe, maxW) as string[];
    for (const line of lines) {
      if (y > pageH - 17) { pdf.addPage(); header('Experiment report · continued', 'Lab notebook'); y = 55; }
      pdf.text(line, x, y); y += lineH;
    }
    return y;
  };

  header('Virtual chemistry experiment', 'Experiment workspace');
  let y = 53;
  section('WORKSPACE SCREENSHOT', y); y += 10;
  if (bench) {
    const image = bench.toDataURL('image/png');
    const maxW = pageW - margin * 2, maxH = 91;
    const ratio = bench.width / Math.max(bench.height, 1);
    const w = Math.min(maxW, maxH * ratio), h = w / ratio;
    pdf.setDrawColor(218, 229, 219); pdf.roundedRect(margin, y, w, h, 2, 2, 'S');
    pdf.addImage(image, 'PNG', margin + 1, y + 1, w - 2, h - 2, undefined, 'FAST');
    y += h + 11;
  } else y += 5;
  y = writeLines(`Vessels on bench: ${containers.length}   |   Total logged reactions: ${containers.reduce((n, vessel) => n + vessel.reactions.length, 0)}`, margin, y, pageW - margin * 2);
  y += 6;
  section('VESSEL INVENTORY & REACTION LOG', y); y += 11;
  containers.forEach((vessel, index) => {
    if (y > pageH - 55) { pdf.addPage(); header('Vessel details', 'Experiment observations'); y = 54; }
    pdf.setFillColor(index % 2 ? 241 : 231, index % 2 ? 247 : 241, index % 2 ? 237 : 230);
    pdf.roundedRect(margin, y - 5, pageW - margin * 2, 17, 2, 2, 'F');
    pdf.setTextColor(...green); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(13); pdf.text(vessel.label || `Beaker ${index + 1}`, margin + 4, y + 1);
    pdf.setTextColor(76, 94, 80); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9);
    pdf.text(`${vessel.kind}   |   ${vessel.volumeMl.toFixed(1)} mL   |   ${vessel.temperatureC.toFixed(1)} C   |   pH ${pHOf(vessel).toFixed(2)}   |   Gas: ${vessel.gasMoles.toFixed(4)} mol ${vessel.gasSpecies || ''}`, margin + 4, y + 7);
    y += 18;
    section('INSIDE THE VESSEL', y); y += 8;
    for (const item of contentsOf(vessel)) y = writeLines(`• ${item}`, margin + 3, y, pageW - margin * 2 - 6);
    y += 3;
    section(`REACTION LOG · ${vessel.reactions.length} EVENTS`, y); y += 9;
    if (!vessel.reactions.length) y = writeLines('No reaction recorded for this vessel yet.', margin + 3, y, pageW - margin * 2 - 6);
    for (const [reactionIndex, reaction] of vessel.reactions.entries()) {
      y = writeLines(`${reactionIndex + 1}. ${reaction.title}  |  ${new Date(reaction.at).toLocaleTimeString()}`, margin + 3, y, pageW - margin * 2 - 6);
      pdf.setFont('courier', 'bold'); pdf.setTextColor(77, 104, 76); pdf.setFontSize(8);
      const equationLines = pdf.splitTextToSize(pdfSafe(reaction.equation), pageW - margin * 2 - 12) as string[];
      for (const line of equationLines) { if (y > pageH - 17) { pdf.addPage(); header('Reaction log · continued', vessel.label); y = 55; } pdf.text(line, margin + 6, y); y += 4.2; }
      y = writeLines(reaction.detail, margin + 6, y, pageW - margin * 2 - 12, 4.5); y += 2;
    }
    y += 7;
  });
  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page); pdf.setDrawColor(215, 227, 216); pdf.line(margin, pageH - 12, pageW - margin, pageH - 12);
    pdf.setTextColor(110, 130, 112); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.text('MO3LEMY  ·  VIRTUAL CHEMISTRY NOTEBOOK', margin, pageH - 7);
    pdf.text(`${page} / ${pages}`, pageW - margin, pageH - 7, { align: 'right' });
  }
  pdf.save(`mo3lemy-experiment-${new Date().toISOString().slice(0, 10)}.pdf`);
}

function pdfSafe(value: string) {
  return value.normalize('NFKD').replace(/[₀-₉]/g, char => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(char)))
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, char => String('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(char)))
    .replace(/⁺/g, '+').replace(/⁻/g, '-').replace(/−/g, '-').replace(/²/g, '2').replace(/³/g, '3')
    .replace(/⁻/g, '-').replace(/→/g, '->').replace(/↓/g, ' (precipitate)').replace(/↑/g, ' (gas)')
    .replace(/·/g, ' | ').replace(/°/g, ' deg ').replace(/⁻¹/g, '-1').replace(/⁺/g, '+')
    .replace(/[^ -ÿ]/g, '?');
}

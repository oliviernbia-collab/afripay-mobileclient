export function formatFcfa(value) {
  const n = Number(value || 0);
  return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

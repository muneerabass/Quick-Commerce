/** Rupee formatting. Prices in the catalogue are whole rupees. */
export function formatPrice(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function formatCount(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(value);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

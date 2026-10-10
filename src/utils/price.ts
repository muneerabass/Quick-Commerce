// Backend stores prices as integer minor units (paise). All UI math and
// display must go through these helpers so we never confuse rupees with paise.

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function formatPrice(paise: number): string {
  const rupees = paiseToRupees(paise);
  const sign = rupees < 0 ? '-' : '';
  const abs = Math.abs(rupees);
  // Rupee symbol + Indian locale grouping, two decimals.
  return `${sign}₹${abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPriceCompact(paise: number): string {
  const rupees = paiseToRupees(paise);
  if (Number.isInteger(rupees)) {
    return `₹${rupees.toLocaleString('en-IN')}`;
  }
  return formatPrice(paise);
}

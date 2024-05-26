

function tryConvertToFraction(amount: number) {
  const rangeMap = {
    '1/8': [0.12, 0.13],
    '1/5': [0.18, 0.21],
    '2/5': [0.37, 0.41],
    '1/4': [0.24, 0.26],
    '1/3': [0.30, 0.35],
    '1/2': [0.45, 0.55],
    '2/3': [0.65, 0.68],
    '3/4': [0.70, 0.80],
  };
  for (const [text, range] of Object.entries(rangeMap)) {
    if (amount >= range[0] && amount <= range[1]) {
      return text;
    }
  }
  return Math.round(amount * 10) / 10;
}

function abbreviateUnit(unit: string, plural: boolean) {
  switch (unit) {
    case 'teaspoon':
      return 'tsp';
    case 'tablespoon':
      return 'tbsp';
    case 'cup':
      return plural ? 'cups' : 'cup';
    case 'millilitre':
      return 'ml';
    case 'litre':
      return 'L';
    case 'milligram':
      return 'mg';
    case 'gram':
      return 'g';
    case 'kilogram':
      return 'kg';
    case 'each':
      return '';
    default:
      return unit;
  }
}

export function formatIngredientQuantity(amount: number, unit: string): string {
  const amountText = tryConvertToFraction(amount);
  if (unit === 'each') {
    return amountText.toString();
  }
  return `${amountText} ${unit ? abbreviateUnit(unit, amount > 1) : ''}`.trim();
}


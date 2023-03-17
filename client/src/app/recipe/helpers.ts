

function tryConvertToFraction(amount: number) {
  switch (amount.toString().slice(0, 5)) {
    case '0.5':
      return '1/2';
    case '0.333':
      return '1/3';
    case '0.666':
      return '2/3';
    case '0.25':
      return '1/4';
    case '0.125':
      return '1/8';
  };
  return amount;
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


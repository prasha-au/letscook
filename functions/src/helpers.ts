import type {IngredientGroup, InstructionStep, ResolvedUrl} from '../../interfaces';
import _ from 'lodash';
import {parseIngredient as parseIngredientLib, unitsOfMeasure} from 'parse-ingredient';

export const EXTRA_PAGE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36',
  'upgrade-insecure-requests': '1',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
  'accept-encoding': 'gzip, deflate, br',
  'accept-language': 'en-US,en;q=0.9,en;q=0.8',
} as const;

export function resolveUrl(query: string): ResolvedUrl | null {
  let url: URL;
  try {
    url = new URL(query);
  } catch (e) {
    return null;
  }
  return {
    id: url.hostname.replace(/^www\./, '').replace(/\./g, '_') + url.pathname.replace(/\/$/g, '').replace(/(\.|\/)/g, '_'),
    url: `${url.origin}${url.pathname}`,
  };
}

export function cleanUndefinedValues<T>(value: T): T {
  if (_.isPlainObject(value)) {
    return _(value as Record<string, unknown>).mapValues((v) => cleanUndefinedValues(v)).pickBy((v) => v !== undefined).value() as unknown as T;
  } else if (Array.isArray(value)) {
    return value.map((v) => cleanUndefinedValues(v)).filter((v) => v !== undefined) as unknown as T;
  } else {
    return value;
  }
}

export function tryCleanupImageUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    return `${url.origin}${url.pathname}`.replace(/-\d+x\d+(\.\w+)$/g, '$1');
  } catch (e) {
    return rawUrl;
  }
}

export function parseIngredient(ingredient: string): Omit<IngredientGroup['ingredients'][number], 'notes'> | undefined {
  const fracMatch = ingredient.match(/&frac(\d)(\d);/);
  if (fracMatch) {
    ingredient = ingredient.replace(fracMatch[0], (parseInt(fracMatch[1]) / parseInt(fracMatch[2])).toFixed(2));
  }
  ingredient = ingredient
      .replace('half', '0.5')
      .replace('quarter', '0.25')
      .replace('third', '0.33')
      .replace(/(\d+)L/, '$1 liter');

  function addUomAlternates(key: string, alternates: string[]) {
    return {[key]: {...unitsOfMeasure[key], alternates: [...unitsOfMeasure[key].alternates, ...alternates]}};
  }

  const parsedValue = parseIngredientLib(ingredient, {
    normalizeUOM: true,
    additionalUOMs: {
      ...addUomAlternates('tablespoon', ['Tbsp']),
      ...addUomAlternates('teaspoon', ['Tsp']),
      ...addUomAlternates('liter', ['litre']),
      ...addUomAlternates('milliliter', ['millilitre']),
    },
  })[0];
  if (parsedValue === undefined) {
    return undefined;
  }

  if (parsedValue.unitOfMeasure === 'pound') {
    const value = (parsedValue.quantity ?? 1) * 0.453592;
    if (value > 1) {
      parsedValue.unitOfMeasure = 'kilogram';
      parsedValue.quantity = Math.round(value * 100) / 100;
    } else {
      parsedValue.unitOfMeasure = 'gram';
      parsedValue.quantity = Math.round(value * 100) * 10;
    }
  } else if (parsedValue.unitOfMeasure == 'ounce') {
    parsedValue.unitOfMeasure = 'gram';
    parsedValue.quantity = parsedValue.quantity ? Math.round(parsedValue.quantity * 28.3495) : null;
  }

  parsedValue.unitOfMeasure = parsedValue.unitOfMeasure?.replace(/s$/, '').toLowerCase() ?? null;

  return {
    name: parsedValue.description.replace(/^x /g, ''),
    amount: parsedValue.quantity ?? 1,
    unit: parsedValue.unitOfMeasure ?? 'each',
  };
}


function parseDurationValue(valueStr: string) {
  if (valueStr.includes('/')) {
    const match = valueStr.match(/(?:(\d+)\s+)?(\d+)\/(\d+)/m);
    if (!match) {
      return undefined;
    }
    const [, whole, numerator, denominator] = match;
    return parseInt(whole ?? '0') + (parseInt(numerator) / parseInt(denominator));
  } else if (valueStr.includes('.')) {
    return parseFloat(valueStr);
  } else {
    const value = parseInt(valueStr);
    return isNaN(value) ? undefined : value;
  }
}

function parseUnit(valueStr: string) {
  const unit = valueStr.match(/(seconds?|secs?|minutes?|mins?|hours?|hrs?)/gm)?.[0].toLowerCase().replace(/s$/, '');
  switch (unit) {
    case 'second':
    case 'sec':
      return 1000;
    case 'minute':
    case 'min':
      return 60 * 1000;
    case 'hour':
    case 'hr':
      return 60 * 60 * 1000;
    default:
      return undefined;
  }
}

export function parseInstructionStep(text: string): InstructionStep {
  const matches = text.matchAll(/(((?:\d+\.\d)|(?:\d+\s+\d+\/\d+)|(?:\d+\/\d+)|\d+)\s?(seconds?|secs?|minutes?|mins?|hours?|hrs?)\s?)+/gm);
  const timers = Array.from(matches).map(match => {
    const values = match[0] !== match[1]
      ? Array.from(match[0].matchAll(/((\d+)\s?(seconds?|secs?|minutes?|mins?|hours?|hrs?)+)/gm)).map(v => v[0])
      : [match[0]];

    const finalValue = values.reduce((acc, curr) => {
      const durationValue = parseDurationValue(curr);
      const modifier = parseUnit(curr);
      return acc + (durationValue ?? 0) * (modifier ?? 0);
    }, 0);

    return finalValue === 0 ? undefined : { text: match[0].trim(), duration: Math.round(finalValue) };
  }).filter((v): v is Exclude<typeof v, undefined> => v !== undefined);
  return { text, timers };
}

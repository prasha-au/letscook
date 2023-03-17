import {cleanUndefinedValues, parseIngredient, resolveUrl, tryCleanupImageUrl} from './helpers';

describe('resolveUrl', () => {
  describe('when generating an ID', () => {
    it('should replace slashes and dots with an underscope', () => {
      expect(resolveUrl('https://www.site.com/test.path/.some-item')?.id).toBe('site_com_test_path__some-item');
    });
    it('should strip the trailing slash', () => {
      expect(resolveUrl('https://www.site.com/vegan-chilli/')?.id).toBe('site_com_vegan-chilli');
      expect(resolveUrl('https://www.site.com/vegan-chilli')?.id).toBe('site_com_vegan-chilli');
    });
    it('should ignore query parameters', () => {
      expect(resolveUrl('https://www.site.com/item?abc=123')?.id).toBe('site_com_item');
    });
    it('should strip the www. prefix from the origin', () => {
      expect(resolveUrl('https://www.site-www.com/www-item.www')?.id).toBe('site-www_com_www-item_www');
    });
  });

  describe('when returning the URL', () => {
    it('should strip out query parameters', () => {
      expect(resolveUrl('https://www.site.com/item?abc=123')?.url).toBe('https://www.site.com/item');
    });
  });
});


describe('cleanUndefinedValues', () => {
  it('should recursively remove undefined values from arrays and objects', () => {
    expect(cleanUndefinedValues({
      a: undefined,
      b: [undefined, 'b', 'test', undefined],
      c: {
        d: undefined,
        e: ['test', undefined, 'test'],
      },
    })).toEqual({
      b: ['b', 'test'],
      c: {
        e: ['test', 'test'],
      },
    });
  });

  it('it should ensure that keys are removed', () => {
    const cleanedValue = cleanUndefinedValues({a: undefined});
    expect('a' in cleanedValue).toBe(false);
  });
});


describe('tryCleanupImageUrl', () => {
  it('should remove -<width>x<height> from image url', () => {
    expect(tryCleanupImageUrl('https://www.site.com/vegan-chilli-500x200.jpg'))
        .toBe('https://www.site.com/vegan-chilli.jpg');
  });
  it('should strip url parameters', () => {
    expect(tryCleanupImageUrl('https://www.site.com/vegan-chilli.jpg?abc=123'))
        .toBe('https://www.site.com/vegan-chilli.jpg');
  });
});


describe('parseIngredient', () => {
  it('should replace html entities for fractions', () => {
    expect(parseIngredient('&frac12; cup sugar')?.amount).toBe(0.5);
    expect(parseIngredient('&frac13; cup sugar')?.amount).toBe(0.33);
    expect(parseIngredient('&frac23; cup sugar')?.amount).toBe(0.67);
  });

  it('should replace fraction text for numeric values', () => {
    expect(parseIngredient('half cup of sugar')?.amount).toBe(0.5);
    expect(parseIngredient('quarter cup of sugar')?.amount).toBe(0.25);
    expect(parseIngredient('third cup of sugar')?.amount).toBe(0.33);
  });

  it('should default quantity to 1', () => {
    expect(parseIngredient('cup sugar')?.amount).toBe(1);
  });

  it('should default unit to each', () => {
    expect(parseIngredient('1 capsicum')?.unit).toBe('each');
  });

  it('should replace "x" in front of ingredient names', () => {
    expect(parseIngredient('1 cup x sugar')?.name).toBe('sugar');
  });

  it('should be able to parse lb to g when less than 1 kg', () => {
    expect(parseIngredient('1 lb sugar')).toMatchObject({amount: 450, unit: 'gram'});
  });

  it('should be able to parse lb to kg when more than 1 kg', () => {
    expect(parseIngredient('3 lb sugar')).toMatchObject({amount: 1.36, unit: 'kilogram'});
  });

  it('should be able to parse oz to g', () => {
    expect(parseIngredient('1 oz sugar')).toMatchObject({amount: 28, unit: 'gram'});
  });

  it('should be able to parse the first item from alternative measurements', () => {
    expect(parseIngredient('500g / 1lb sugar')).toMatchObject({amount: 500, unit: 'gram'});
    expect(parseIngredient('1lb / 500g sugar')).toMatchObject({amount: 450, unit: 'gram'});
  });

  it('should depluralize units', () => {
    expect(parseIngredient('5 cups sugar')?.unit).toBe('cup');
  });

  it('should be able to handle units being part of the amount', () => {
    expect(parseIngredient('5kg sugar')).toMatchObject({amount: 5, unit: 'kilogram'});
  });

  describe('should convert units to a consistent value', () => {
    for (const [from, to] of Object.entries({
      tsp: 'teaspoon',
      tbsp: 'tablespoon',
      kg: 'kilogram',
      g: 'gram',
      ml: 'milliliter',
      millilitre: 'milliliter',
      l: 'liter',
      litre: 'liter',
      Tbsp: 'tablespoon',
      Tsp: 'teaspoon',
    })) {
      it(`${from} to ${to}`, () => {
        expect(parseIngredient(`5 ${from} item`)?.unit).toBe(to);
      });
    }
  });
  it('should convert L to litre when placed next to a number', () => {
    expect(parseIngredient('5L of milk')?.unit).toBe('liter');
  });
});

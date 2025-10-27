import { NumericTransformer } from './numeric';

describe('numeric.ts', () => {
  const transformer = new NumericTransformer();

  describe('to()', () => {
    it('should convert null to null', () => {
      expect(transformer.to(null)).toBeNull();
    });

    it('should convert undefined to null', () => {
      expect(transformer.to(undefined)).toBeNull();
    });

    it('should return number as is', () => {
      expect(transformer.to(42)).toBe(42);
      expect(transformer.to(0)).toBe(0);
      expect(transformer.to(-3.14)).toBe(-3.14);
    });
  });

  describe('from()', () => {
    it('should convert null to null', () => {
      expect(transformer.from(null)).toBeNull();
    });

    it('should convert undefined to null', () => {
      expect(transformer.from(undefined)).toBeNull();
    });

    it('should parse valid numeric strings', () => {
      expect(transformer.from('42')).toBe(42);
      expect(transformer.from('3.14')).toBe(3.14);
      expect(transformer.from('-7.5')).toBe(-7.5);
    });

    it('should parse scientific notation', () => {
      expect(transformer.from('1e3')).toBe(1000);
      expect(transformer.from('2.5e-2')).toBe(0.025);
    });

    it('should return null for non-numeric strings', () => {
      expect(transformer.from('abc')).toBeNull();
      expect(transformer.from('')).toBeNull();
      expect(transformer.from('abc123')).toBeNull();
      expect(transformer.from('123abc456')).toBeNull();
    });
  });
});

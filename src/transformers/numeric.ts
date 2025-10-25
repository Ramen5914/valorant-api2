import { ValueTransformer } from 'typeorm';

export class NumericTransformer implements ValueTransformer {
  to(value: null | undefined | number): number | null {
    return value === undefined ? null : value;
  }

  from(value: string | null | undefined): number | null {
    if (value === null || value === undefined) return null;
    const n = parseFloat(value);
    return Number.isNaN(n) ? null : n;
  }
}

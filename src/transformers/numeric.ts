import { ValueTransformer } from 'typeorm';

export class NumericTransformer implements ValueTransformer {
  to(value: null | undefined | number): number | null {
    return value === undefined ? null : value;
  }

  from(value: string | null | undefined): number | null {
    if (value === null || value === undefined) return null;
    if (!/^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(value.trim())) {
      return null;
    }

    return parseFloat(value);
  }
}

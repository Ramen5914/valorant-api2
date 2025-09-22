import { millisToDuration } from './time';

describe('time.ts', () => {
  describe('millisToDuration()', () => {
    it('should convert milliseconds to ISO 8601 duration format', () => {
      expect(millisToDuration(1000)).toBe('PT1.000S');
      expect(millisToDuration(60000)).toBe('PT1M');
      expect(millisToDuration(3600000)).toBe('PT1H');
    });

    it('should handle complex time combinations', () => {
      expect(millisToDuration(3661000)).toBe('PT1H1M1.000S');
      expect(millisToDuration(7323000)).toBe('PT2H2M3.000S');
      expect(millisToDuration(1815000)).toBe('PT30M15.000S');
    });

    it('should handle fractional seconds', () => {
      expect(millisToDuration(1500)).toBe('PT1.500S');
      expect(millisToDuration(2750)).toBe('PT2.750S');
      expect(millisToDuration(500)).toBe('PT0.500S');
    });

    it('should handle edge cases', () => {
      expect(millisToDuration(0)).toBe('PT0.000S');
      expect(millisToDuration(1)).toBe('PT0.001S');
      expect(millisToDuration(999)).toBe('PT0.999S');
    });

    it('should handle large values', () => {
      expect(millisToDuration(86400000)).toBe('PT24H');
      expect(millisToDuration(90061000)).toBe('PT25H1M1.000S');
    });

    it('should handle typical game match durations', () => {
      expect(millisToDuration(1800000)).toBe('PT30M');
      expect(millisToDuration(2580000)).toBe('PT43M');
      expect(millisToDuration(1735000)).toBe('PT28M55.000S');
      expect(millisToDuration(1715000)).toBe('PT28M35.000S');
    });

    it('should omit zero components correctly', () => {
      expect(millisToDuration(30000)).toBe('PT30.000S');
      expect(millisToDuration(300000)).toBe('PT5M');
      expect(millisToDuration(7200000)).toBe('PT2H');
      expect(millisToDuration(3900000)).toBe('PT1H5M');
    });

    it('should handle fractional seconds with hours and minutes', () => {
      expect(millisToDuration(3661500)).toBe('PT1H1M1.500S');
      expect(millisToDuration(7323750)).toBe('PT2H2M3.750S');
      expect(millisToDuration(534780137)).toBe('PT148H33M0.137S');
    });
  });
});

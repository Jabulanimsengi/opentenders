import { parseSouthAfricanTenderDate } from './date-parser';

describe('parseSouthAfricanTenderDate', () => {
  it.each([
    ['2026-06-15', '2026-06-15'],
    ['15 June 2026', '2026-06-15'],
    ['15/06/2026', '2026-06-15'],
    ['Closing Date: 12/05/2026 Year: 2026', '2026-05-12'],
    ['2026/06/15', '2026-06-15'],
    ['15 Jun 2026 at 11:00', '2026-06-15'],
    ['Closing: Friday, 15 June 2026, 11:00', '2026-06-15'],
    ['11:00 on 15 June 2026', '2026-06-15'],
    ['WEDNESDAY 07 DECEMBER 2021 AT 10:00', '2021-12-07'],
  ])('parses %s', (input, expectedDate) => {
    const parsed = parseSouthAfricanTenderDate(input);
    expect(toLocalDateString(parsed)).toBe(expectedDate);
  });

  it('returns null for unusable values', () => {
    expect(parseSouthAfricanTenderDate('not a date')).toBeNull();
    expect(parseSouthAfricanTenderDate(null)).toBeNull();
  });
});

function toLocalDateString(date: Date | null | undefined) {
  if (!date) return null;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * DateFormat — project-wide date utility class.
 *
 * PrimeNG p-calendar stores JavaScript Date objects in reactive form controls.
 * Passing those objects directly to an HTTP payload causes JSON.stringify to
 * call .toISOString(), which converts to UTC and shifts the date by the local
 * UTC offset (e.g. UTC+6 turns 2024-01-01 00:00 local → 2023-12-31T18:00Z).
 *
 * Always use these helpers before sending dates to any API.
 */
export class DateFormat {

  /**
   * Converts a Date object or ISO string to "YYYY-MM-DD" using the device's
   * LOCAL timezone — no UTC offset shift.
   *
   * @example
   *   DateFormat.toApiDate(new Date('2024-01-01'))  // "2024-01-01"
   */
  // static toApiDate(value: Date | string | null | undefined): string {
  //   if (!value) return '';
  //   const d = value instanceof Date ? value : new Date(value);
  //   if (isNaN(d.getTime())) return '';
  //   const yyyy = d.getFullYear();
  //   const mm   = String(d.getMonth() + 1).padStart(2, '0');
  //   const dd   = String(d.getDate()).padStart(2, '0');
  //   return `${yyyy}-${mm}-${dd}`;
  // }

  static toApiDate(value: Date | string | null | undefined): string {
  if (!value) return '';

  let d: Date;

  if (value instanceof Date) {
    d = value;
  } else if (typeof value === 'string') {
    if (value.includes('/')) {
      const parts = value.split('/').map((p) => p.trim());
      if (parts.length === 3) {
        const a = +parts[0];
        const b = +parts[1];
        const y = +parts[2];
        if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(y)) {
          return '';
        }
        // Disambiguate dd/MM/yyyy (e.g. API / Bangladesh) vs MM/dd/yyyy (Angular
        // DatePipe in generate-pi, generate-cpi, etc.)
        if (a > 12) {
          // 25/12/2026 — day is first
          d = new Date(y, b - 1, a);
        } else if (b > 12) {
          // 04/25/2026 — month is first (day 13–31)
          d = new Date(y, a - 1, b);
        } else {
          // Both 1–12: ambiguous; match DatePipe "MM/dd/yyyy" used on PI/LC forms
          d = new Date(y, a - 1, b);
        }
      } else {
        return '';
      }
    } else {
      // fallback for ISO string
      d = new Date(value);
    }
  } else {
    return '';
  }

  if (isNaN(d.getTime())) return '';

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}

  /**
   * Converts a Date object or ISO string to "DD-MMM-YYYY" for display
   * (e.g. "01-Jan-2024").
   */
  static toDisplayDate(value: Date | string | null | undefined): string {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';
    const months = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];
    const dd   = String(d.getDate()).padStart(2, '0');
    const mmm  = months[d.getMonth()];
    const yyyy = d.getFullYear();
    return `${dd}-${mmm}-${yyyy}`;
  }

  /**
   * Converts a Date object or ISO string to "DD/MM/YYYY" for display
   * (e.g. "01/01/2024").
   */
  static toSlashDate(value: Date | string | null | undefined): string {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';
    const dd   = String(d.getDate()).padStart(2, '0');
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
}

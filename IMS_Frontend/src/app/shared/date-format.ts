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
  static toApiDate(value: Date | string | null | undefined): string {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
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

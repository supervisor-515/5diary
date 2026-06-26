// Date helpers for the "horizontal = month/day, vertical = year" model.
// A page is identified by mmdd (year-independent). Navigation wraps Dec31 <-> Jan1.

const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const toMmdd = (month: number, day: number) => `${pad2(month)}-${pad2(day)}`;

export const parseMmdd = (mmdd: string): { month: number; day: number } => {
  const [m, d] = mmdd.split('-').map(Number);
  return { month: m, day: d };
};

export const todayMmdd = (): string => {
  const now = new Date();
  return toMmdd(now.getMonth() + 1, now.getDate());
};

export const currentYear = (): number => new Date().getFullYear();

export const isLeap = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

// Days in a month. For Feb, defaults to 29 so that 02-29 is a valid page.
export const daysInMonth = (month: number, year?: number): number => {
  if (month === 2) return year === undefined ? 29 : isLeap(year) ? 29 : 28;
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
};

// Ordered list of all 366 calendar pages (year-independent), Feb 29 included.
const buildPageList = (): string[] => {
  const list: string[] = [];
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= daysInMonth(m); d++) {
      list.push(toMmdd(m, d));
    }
  }
  return list;
};

const PAGES = buildPageList();

export const nextMmdd = (mmdd: string): string => {
  const i = PAGES.indexOf(mmdd);
  return PAGES[(i + 1) % PAGES.length];
};

export const prevMmdd = (mmdd: string): string => {
  const i = PAGES.indexOf(mmdd);
  return PAGES[(i - 1 + PAGES.length) % PAGES.length];
};

// "6월 25일"
export const formatMmddKo = (mmdd: string): string => {
  const { month, day } = parseMmdd(mmdd);
  return `${month}월 ${day}일`;
};

// Weekday label for a mmdd in a given year. Feb 29 in a non-leap year has no
// real weekday; return '' so callers can hide it.
export const weekdayKo = (mmdd: string, year: number): string => {
  const { month, day } = parseMmdd(mmdd);
  if (month === 2 && day === 29 && !isLeap(year)) return '';
  const dt = new Date(year, month - 1, day);
  return WEEKDAYS_KO[dt.getDay()];
};

// "2024년 6월 25일"
export const formatFullKo = (year: number, month: number, day: number): string =>
  `${year}년 ${month}월 ${day}일`;

export { WEEKDAYS_KO };

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const startOfWeek = (date: Date) => {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
};

export const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

export const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

export const datesBetween = (start: string, end: string) => {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const direction = startDate <= endDate ? 1 : -1;
  const dates: string[] = [];
  let current = startDate;

  while ((direction === 1 && current <= endDate) || (direction === -1 && current >= endDate)) {
    dates.push(formatDate(current));
    current = addDays(current, direction);
  }

  return direction === 1 ? dates : dates.reverse();
};

export const shortDate = (date: string) =>
  new Intl.DateTimeFormat('en-GB', { month: 'short', day: '2-digit' }).format(new Date(`${date}T00:00:00`));

export const monthLabel = (date: string) =>
  new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(new Date(`${date}T00:00:00`));

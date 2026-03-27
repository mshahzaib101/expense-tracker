function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function formatLocalDateInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getLocalToday() {
  return formatLocalDateInput(new Date());
}

export function getLocalRelativeDate(daysOffset: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return formatLocalDateInput(date);
}

export function toLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function formatLocalRangeDate(date: Date) {
  return formatLocalDateInput(date);
}

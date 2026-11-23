const dateTimeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export const formatDateTime = (isoString) => dateTimeFormat.format(new Date(isoString));

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const plural = (count, unit) => `${count} ${unit}${count === 1 ? '' : 's'}`;

// "Due in 3 days", "Due in 5 hours" or "Overdue by 2 days".
export const getDueLabel = (isoString) => {
  const diff = new Date(isoString) - new Date();
  const abs = Math.abs(diff);

  let amount;
  if (abs >= DAY) amount = plural(Math.floor(abs / DAY), 'day');
  else if (abs >= HOUR) amount = plural(Math.floor(abs / HOUR), 'hour');
  else amount = plural(Math.max(1, Math.floor(abs / MINUTE)), 'minute');

  return diff < 0 ? `Overdue by ${amount}` : `Due in ${amount}`;
};

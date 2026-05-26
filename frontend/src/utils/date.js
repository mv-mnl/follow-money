const TZ = 'America/El_Salvador';

export function todaySV() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ });
}

export function nowSV() {
  return new Date().toLocaleString('es-SV', {
    timeZone: TZ,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

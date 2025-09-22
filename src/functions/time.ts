export function millisToDuration(gameLengthMillis: number): string {
  const seconds = gameLengthMillis / 1000;
  const totalSeconds = Math.floor(seconds);
  const fractional = seconds - totalSeconds;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = (totalSeconds % 60) + fractional;

  let duration = 'PT';
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;
  if (secs > 0 || duration === 'PT') duration += `${secs.toFixed(3)}S`;

  return duration;
}

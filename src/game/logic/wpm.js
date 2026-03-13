export function computeWpm({
  totalChars,
  startMs,
  nowMs,
  charsPerWord = 5,
  cap = 250,
  minElapsedMinutes = 0.01,
}) {
  if (startMs == null) return 0;
  const elapsedMinutes = (nowMs - startMs) / 60000;
  if (elapsedMinutes <= minElapsedMinutes) return 0;

  const words = totalChars / charsPerWord;
  return Math.min(Math.round(words / elapsedMinutes), cap);
}


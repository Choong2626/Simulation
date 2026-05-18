export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function roundTo(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function normalizeScore(value: number): number {
  return roundTo(clamp(value, 0, 100), 1);
}

export function normalizeWithin(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

export function getScoreStatus(score: number): "Critical" | "Weak" | "Moderate" | "Good" | "Strong" {
  if (score <= 30) return "Critical";
  if (score <= 50) return "Weak";
  if (score <= 70) return "Moderate";
  if (score <= 85) return "Good";
  return "Strong";
}

export function getRiskStatus(score: number): "Low" | "Moderate" | "High" | "Critical" {
  if (score <= 30) return "Low";
  if (score <= 60) return "Moderate";
  if (score <= 80) return "High";
  return "Critical";
}

export function getPressureStatus(score: number): "Low" | "Moderate" | "High" | "Critical" {
  if (score <= 30) return "Low";
  if (score <= 60) return "Moderate";
  if (score <= 80) return "High";
  return "Critical";
}


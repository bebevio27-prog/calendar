import clsx from 'clsx'

export function cn(...inputs) {
  return clsx(inputs)
}

export const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
]

export function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

export const DAYS_OF_WEEK = [
  { label: 'Domenica', value: 0 },
  { label: 'Lunedì', value: 1 },
  { label: 'Martedì', value: 2 },
  { label: 'Mercoledì', value: 3 },
  { label: 'Giovedì', value: 4 },
  { label: 'Venerdì', value: 5 },
  { label: 'Sabato', value: 6 },
]

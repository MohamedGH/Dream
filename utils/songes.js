export const TAGS = [
  { id: 'lucide', label: 'Lucide' },
  { id: 'recurrent', label: 'Récurrent' },
  { id: 'cauchemar', label: 'Cauchemar' },
  { id: 'premonitoire', label: 'Prémonitoire' },
]

export const PHASES = [
  { id: 1, label: 'Fragments flous', glyph: '🌑' },
  { id: 2, label: 'Souvenir partiel', glyph: '🌓' },
  { id: 3, label: 'Souvenir net', glyph: '🌔' },
  { id: 4, label: 'Vivace, intact', glyph: '🌕' },
]

export const SOCIALS = [
  { id: 'google', label: 'Google' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'apple', label: 'Apple' },
  { id: 'twitter', label: 'X' },
  { id: 'github', label: 'GitHub' },
  { id: 'microsoft', label: 'Microsoft' },
  { id: 'yahoo', label: 'Yahoo' },
]

export function timeAgo(ts) {
  if (!ts) return "à l'instant"
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return "à l'instant"
  const m = Math.floor(s / 60)
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h} h`
  const d = Math.floor(h / 24)
  return `il y a ${d} j`
}

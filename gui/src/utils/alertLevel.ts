export function alertLevel(text: string | undefined | null): 'high' | 'medium' | 'low' {
  if (!text) return 'low'
  const lower = text.toLowerCase()
  if (lower.includes('critical') || lower.includes('immediate') || lower.includes('danger') || lower.includes('no hard hat'))
    return 'high'
  if (lower.includes('blocked') || lower.includes('congestion') || lower.includes('overlap'))
    return 'medium'
  return 'low'
}

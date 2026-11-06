export const shorten = (s: string, a = 8, b = 6) =>
  s && s.length > a + b + 3 ? `${s.slice(0, a)}…${s.slice(-b)}` : s || ''

export const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

export const fmtDateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export const fmtUsd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export const cn = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(' ')

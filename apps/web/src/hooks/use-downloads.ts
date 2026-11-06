// Download the first <canvas> inside the given container as PNG.
export function downloadQr(container: HTMLElement | null, name: string) {
  const canvas = container?.querySelector('canvas')
  if (!canvas) return
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = `${name}.png`
  a.click()
}

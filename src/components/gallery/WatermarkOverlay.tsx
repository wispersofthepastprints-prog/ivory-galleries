'use client'

export function WatermarkOverlay({ text = 'PREVIEW' }: { text?: string }) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='160'>
    <text x='20' y='90' font-family='sans-serif' font-size='20' font-weight='bold'
      fill='rgba(255,255,255,0.32)' transform='rotate(-30 20 90)'>${text}</text>
  </svg>`
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, backgroundRepeat: 'repeat' }}
    />
  )
}

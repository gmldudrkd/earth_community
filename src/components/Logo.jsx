export default function Logo({ size = 'md', showSubtitle = false }) {
  const sizes = {
    sm: { main: 'text-3xl', sub: 'text-[10px]', gap: 'gap-0' },
    md: { main: 'text-4xl', sub: 'text-xs', gap: 'gap-0.5' },
    lg: { main: 'text-5xl', sub: 'text-sm', gap: 'gap-1' },
  }
  const s = sizes[size] || sizes.md

  return (
    <div className={`flex flex-col ${s.gap}`}>
      <span
        className={`${s.main} font-bold leading-tight`}
        style={{ fontFamily: "'Caveat', cursive", color: '#6BBF7B' }}
      >
        OMG Table
      </span>
      {showSubtitle && (
        <span className={`${s.sub} tracking-wide`} style={{ color: '#9AD1A6' }}>
          One Meal Green Table
        </span>
      )}
    </div>
  )
}

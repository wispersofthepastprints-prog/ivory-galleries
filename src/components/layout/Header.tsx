interface HeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <div className="flex items-end justify-between mb-8 pb-6 border-b border-stone/10">
      <div>
        <h1 className="text-3xl font-bold text-obsidian">{title}</h1>
        {subtitle && <p className="text-fog mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

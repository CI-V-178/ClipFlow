import { NavLink } from 'react-router-dom'

type NavItem = {
  to: string
  label: string
  end?: boolean
}

const navItems: NavItem[] = [
  { to: '/', label: 'ホーム', end: true },
  { to: '/projects', label: 'プロジェクト' }
]

function Sidebar(): React.JSX.Element {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-app-border bg-app-surface">
      <div className="px-5 py-6">
        <h1 className="text-xl font-semibold tracking-tight text-app-text">ClipFlow</h1>
        <p className="mt-1 text-xs text-app-muted">AI 制作補助ツール</p>
      </div>
      <nav className="flex flex-col gap-1 px-3 pb-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'block rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-app-elevated text-app-text'
                  : 'text-app-muted hover:bg-app-elevated/60 hover:text-app-text'
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar

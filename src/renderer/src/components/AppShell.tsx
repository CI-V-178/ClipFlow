import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import StatusBar from './StatusBar'

function AppShell(): React.JSX.Element {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-app-bg px-10 py-8">
          <Outlet />
        </main>
      </div>
      <StatusBar />
    </div>
  )
}

export default AppShell

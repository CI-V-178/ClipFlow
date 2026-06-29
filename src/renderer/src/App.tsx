import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import Home from './routes/Home'
import Projects from './routes/Projects'

function App(): React.JSX.Element {
  // Electron は file:// で起動するため BrowserRouter ではなく HashRouter を使う
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App

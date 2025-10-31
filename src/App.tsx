import { HashRouter, Route, Routes } from 'react-router'
import HomePage from './pages/Home'
import AIArchitectDemo from './pages/AIArchitectDemo'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ai-architect" element={<AIArchitectDemo />} />
      </Routes>
    </HashRouter>
  )
}
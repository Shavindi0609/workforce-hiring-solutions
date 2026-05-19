import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SettingsPage from './Candidate/Setting/Settings'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SettingsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  )
}

export default App
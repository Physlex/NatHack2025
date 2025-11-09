import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/home'
import './App.css'
import { GlobalProvider } from './contexts/GlobalContext'
import Dashboard from './pages/dashboard'
import Recording from './pages/recording'

function App() {
  return (
    <GlobalProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recording/:id" element={<Recording />} />
        </Routes>
      </Router>
    </GlobalProvider>
  )
}

export default App

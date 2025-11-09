import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/home'
import './App.css'
import { GlobalProvider } from './contexts/GlobalContext'
import Dashboard from './pages/dashboard'
import Recording from './pages/recording/[id]'
import Recordings from './pages/recording'
import Layout from './components/Layout'
import NotFound from './pages/NotFound'

function App() {
  return (
    <GlobalProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recording" element={<Recordings />} />
            <Route path="/recording/:id" element={<Recording />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </GlobalProvider>
  )
}

export default App

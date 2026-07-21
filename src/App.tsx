import { Route, Routes } from 'react-router-dom'
import { Start } from './pages/Start/Start'
import { Register } from './pages/Register/Register'
import { Login } from './pages/Login/Login'
import { Dashboard } from './pages/Dashboard/Dashboard'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Dashboard />} />
    </Routes>
  )
}

export default App

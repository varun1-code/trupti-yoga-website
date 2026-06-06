import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ClassPage from './pages/ClassPage'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Payment from './pages/Payment'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/class/:time" element={<ClassPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  )
}

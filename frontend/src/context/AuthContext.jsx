import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { connectSocket, disconnectSocket } from '../services/socket'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('dispatch_token')
    const cached = localStorage.getItem('dispatch_user')
    if (token && cached) {
      try {
        setUser(JSON.parse(cached))
        connectSocket(token)
      } catch {}
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('dispatch_token', data.token)
    localStorage.setItem('dispatch_user', JSON.stringify(data.user))
    setUser(data.user)
    connectSocket(data.token)
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    localStorage.setItem('dispatch_token', data.token)
    localStorage.setItem('dispatch_user', JSON.stringify(data.user))
    setUser(data.user)
    connectSocket(data.token)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('dispatch_token')
    localStorage.removeItem('dispatch_user')
    setUser(null)
    disconnectSocket()
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
      localStorage.setItem('dispatch_user', JSON.stringify(data.user))
    } catch {}
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('blogsphere_user')
    return saved ? JSON.parse(saved) : null
  })
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem('blogsphere_tokens')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyUser = async () => {
      if (tokens?.access) {
        try {
          const res = await authApi.getMe()
          setUser(res.data)
          localStorage.setItem('blogsphere_user', JSON.stringify(res.data))
        } catch (err) {
          // Handled by refresh interceptor or cleanup
        }
      }
      setLoading(false)
    }

    verifyUser()

    const handleForceLogout = () => {
      setUser(null)
      setTokens(null)
    }
    window.addEventListener('auth-logout', handleForceLogout)
    return () => window.removeEventListener('auth-logout', handleForceLogout)
  }, [tokens?.access])

  const login = async (username, password) => {
    const res = await authApi.login({ username, password })
    const { access, refresh } = res.data
    const tokenObj = { access, refresh }
    setTokens(tokenObj)
    localStorage.setItem('blogsphere_tokens', JSON.stringify(tokenObj))

    // Fetch user profile
    const meRes = await authApi.getMe()
    setUser(meRes.data)
    localStorage.setItem('blogsphere_user', JSON.stringify(meRes.data))
    return meRes.data
  }

  const demoLogin = async (persona) => {
    const res = await authApi.demoLogin(persona)
    const { user: userData, tokens: tokenData } = res.data
    setUser(userData)
    setTokens(tokenData)
    localStorage.setItem('blogsphere_user', JSON.stringify(userData))
    localStorage.setItem('blogsphere_tokens', JSON.stringify(tokenData))
    return userData
  }

  const register = async (formData) => {
    const res = await authApi.register(formData)
    const { user: userData, tokens: tokenData } = res.data
    setUser(userData)
    setTokens(tokenData)
    localStorage.setItem('blogsphere_user', JSON.stringify(userData))
    localStorage.setItem('blogsphere_tokens', JSON.stringify(tokenData))
    return userData
  }

  const logout = () => {
    setUser(null)
    setTokens(null)
    localStorage.removeItem('blogsphere_user')
    localStorage.removeItem('blogsphere_tokens')
  }

  const updateProfile = async (formData) => {
    const res = await authApi.updateProfile(formData)
    setUser(res.data)
    localStorage.setItem('blogsphere_user', JSON.stringify(res.data))
    return res.data
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!user,
        loading,
        login,
        demoLogin,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('blogsphere_theme') || 'dark'
  })

  useEffect(() => {
    localStorage.setItem('blogsphere_theme', theme)
    if (theme === 'light') {
      document.body.classList.remove('dark-theme')
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
      document.body.classList.add('dark-theme')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}

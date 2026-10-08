import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Home from './pages/Home'
import Feed from './pages/Feed'
import BlogDetail from './pages/BlogDetail'
import CreateEditPost from './pages/CreateEditPost'
import AuthorDashboard from './pages/AuthorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'
import Bookmarks from './pages/Bookmarks'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/post/:slug" element={<BlogDetail />} />
                  <Route path="/create-post" element={<CreateEditPost />} />
                  <Route path="/edit-post/:slug" element={<CreateEditPost />} />
                  <Route path="/analytics" element={<AuthorDashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/author/:username" element={<Profile />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/bookmarks" element={<Bookmarks />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

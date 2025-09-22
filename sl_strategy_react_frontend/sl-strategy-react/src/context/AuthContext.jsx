import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthCtx = createContext(null)

export function AuthProvider({ children }){
  const [apiBase, setApiBase] = useState(localStorage.getItem('sl_api_base') || 'http://localhost:8000')
  const [token, setToken] = useState(localStorage.getItem('sl_token') || '')

  useEffect(()=>{ localStorage.setItem('sl_api_base', apiBase) }, [apiBase])
  useEffect(()=>{ if(token) localStorage.setItem('sl_token', token) }, [token])

  async function login(email){
    const body = new URLSearchParams()
    body.set('username', email.trim().toLowerCase())
    body.set('password', '') // ignored by backend
    const r = await fetch(apiBase + '/auth/login', { method:'POST', body })
    if(!r.ok) throw new Error('Login failed')
    const t = await r.json()
    setToken(t.access_token)
    localStorage.setItem('sl_token', t.access_token)
    return t
  }
  function authHeader(){ return token ? { 'Authorization': 'Bearer ' + token } : {} }

  const value = { apiBase, setApiBase, token, login, authHeader }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth(){ return useContext(AuthCtx) }

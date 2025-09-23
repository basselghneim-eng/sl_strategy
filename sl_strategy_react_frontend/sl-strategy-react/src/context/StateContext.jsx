import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'

const StateCtx = createContext(null)

export function StateProvider({ children }){
  const [state, setState] = useState(()=>{
    try { return JSON.parse(localStorage.getItem('sl_state_v1') || '{}') } catch { return {} }
  })
  const [strategyId, setStrategyId] = useState(()=>{
    try { return JSON.parse(localStorage.getItem('sl_strategy_id') || 'null') } catch { return null }
  })
  const { apiBase, authHeader } = useAuth()

  function persistLocal(next){
    setState(next)
    localStorage.setItem('sl_state_v1', JSON.stringify(next))
  }

  async function persistServer(next){
    try{
      const body = JSON.stringify({ name: next?.programme?.country || 'Untitled Strategy', data: next })
      if(!strategyId){
        const r = await fetch(apiBase + '/strategies', { method:'POST', headers:{ 'Content-Type':'application/json', ...authHeader() }, body })
        if(!r.ok) return
        const s = await r.json()
        setStrategyId(s.id)
        localStorage.setItem('sl_strategy_id', JSON.stringify(s.id))
      } else {
        await fetch(apiBase + '/strategies/' + strategyId, { method:'PUT', headers:{ 'Content-Type':'application/json', ...authHeader() }, body })
      }
    }catch(e){ /* ignore for offline */ }
  }

  useEffect(()=>{
    const h = setTimeout(()=>{ persistServer(state) }, 600)
    return ()=> clearTimeout(h)
  }, [state])

  const value = useMemo(()=>({ state, setState, persistLocal }), [state])
  return <StateCtx.Provider value={value}>{children}</StateCtx.Provider>
}

export function useAppState(){ return useContext(StateCtx) }

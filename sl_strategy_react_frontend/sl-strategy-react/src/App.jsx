import React, { useMemo, useState } from 'react'
import Stepper from './components/Stepper.jsx'
import Programme from './pages/Programme.jsx'
import Materials from './pages/Materials.jsx'
import Procurement from './pages/Procurement.jsx'
import MapPage from './pages/Map.jsx'
import Summary from './pages/Summary.jsx'
import { useAuth } from './context/AuthContext.jsx'

export default function App(){
  const steps = useMemo(()=>[
    { id:'programme', title:'Programme – Basics & Focal Points', el:<Programme/> },
    { id:'materials', title:'Programme – Materials', el:<Materials/> },
    { id:'procurement', title:'Procurement Inputs', el:<Procurement/> },
    { id:'map', title:'Map', el:<MapPage/> },
    { id:'summary', title:'Summary', el:<Summary/> },
  ], [])
  const [current, setCurrent] = useState(0)
  const { apiBase, setApiBase, login } = useAuth()

  const [email, setEmail] = useState(localStorage.getItem('sl_email') || '')

  async function doLogin(){
    if(!email){ alert('Enter an email'); return }
    try{
      await login(email)
      localStorage.setItem('sl_email', email)
      alert('Logged in')
    }catch(e){ alert('Login failed') }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">Supply & Logistics Strategy</div>
        <Stepper steps={steps} current={current} onGoto={setCurrent} />
        <div className="row" style={{marginTop:12}}>
          <input value={apiBase} onChange={e=>setApiBase(e.target.value)}
            style={{flex:1,padding:'8px 10px',border:'1px solid var(--line)',borderRadius:10}}/>
          <button className="btn ghost" onClick={()=>localStorage.setItem('sl_api_base', apiBase)}>Save</button>
        </div>
        <div className="row" style={{marginTop:8}}>
          <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)}
            style={{flex:1,padding:'8px 10px',border:'1px solid var(--line)',borderRadius:10}}/>
          <button className="btn ghost" onClick={doLogin}>Login</button>
        </div>
      </aside>

      <section className="card" style={{minHeight:360}}>
        {steps[current].el}
      </section>

      <div className="row" style={{gridColumn:'1 / span 2',justifyContent:'space-between',marginTop:16}}>
        <button className="btn ghost" onClick={()=>setCurrent(Math.max(0,current-1))} disabled={current===0}>⟵ Back</button>
        <button className="btn" onClick={()=>setCurrent(Math.min(steps.length-1,current+1))}>
          {current===steps.length-1? 'Finish' : 'Next ⟶'}
        </button>
      </div>
    </div>
  )
}

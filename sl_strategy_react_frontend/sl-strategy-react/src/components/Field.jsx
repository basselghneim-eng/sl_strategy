import React from 'react'

export function TextInput({ label, value, onChange, type='text', ...rest }){
  return (
    <div>
      <label style={{fontSize:12,color:'var(--muted)',display:'block',marginBottom:6}}>{label}</label>
      <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} {...rest}
        style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid var(--line)'}}/>
    </div>
  )
}

export function Select({ label, value, onChange, options, ...rest }){
  return (
    <div>
      <label style={{fontSize:12,color:'var(--muted)',display:'block',marginBottom:6}}>{label}</label>
      <select value={value||''} onChange={e=>onChange(e.target.value)} {...rest}
        style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid var(--line)'}}>
        <option value=""></option>
        {(options||[]).map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export function Chip({ children }){
  return <span className="chip">{children}</span>
}

import React from 'react'

export default function Stepper({ steps, current, onGoto }){
  return (
    <nav className="stepper">
      {steps.map((s, i)=>(
        <button key={s.id}
          className={'step' + (i===current ? ' active' : '') + (i<current ? ' done' : '')}
          onClick={()=>onGoto(i)}>{s.title}</button>
      ))}
    </nav>
  )
}

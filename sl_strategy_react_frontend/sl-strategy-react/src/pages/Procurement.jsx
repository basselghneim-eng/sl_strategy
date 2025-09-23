import React from 'react'
import { useAppState } from '../context/StateContext.jsx'
import { TextInput, Select } from '../components/Field.jsx'

const modalityOpts = ['Local','Regional','Offshore']
function getSourceOptions(mod){
  switch(mod){
    case 'Local': return ['Local LTA','Non LTA','Piggyback']
    case 'Regional': return ['Regional LTA','Non LTA','Piggyback']
    case 'Offshore': return ['Offshore LTA','Piggyback','WH Material','Global Sourcing']
    default: return ['Local LTA','Regional LTA','Offshore LTA','Non LTA','Piggyback','WH Material','Global Sourcing']
  }
}

export default function Procurement(){
  const { state, persistLocal } = useAppState()
  const rows = state.procurements || []

  function setRows(next){ persistLocal({ ...state, procurements: next }) }
  function setFieldAt(i, k, v){
    const next = [...rows]
    next[i] = { ...(next[i]||{}), [k]: v }
    if(k==='modality'){ const allowed=getSourceOptions(v); if(!allowed.includes(next[i].source)) next[i].source='' }
    setRows(next)
  }

  return (
    <div>
      <h2>Procurement Inputs</h2>
      <div className="card" style={{marginTop:12}}>
        {rows.map((row, i)=>(
          <div key={i} style={{border:'1px solid var(--line)',borderRadius:12,padding:12,marginBottom:10}}>
            <div className="grid">
              <TextInput label="Material Code" value={row.code||''} onChange={v=>setFieldAt(i,'code',v)} />
              <TextInput label="Description" value={row.desc||''} onChange={v=>setFieldAt(i,'desc',v)} />
              <Select label="Procurement Modality" value={row.modality||''} onChange={v=>setFieldAt(i,'modality',v)} options={modalityOpts} />
              <Select label="Material Source" value={row.source||''} onChange={v=>setFieldAt(i,'source',v)} options={getSourceOptions(row.modality)} />
              <Select label="Bottlenecks?" value={row.bn||''} onChange={v=>setFieldAt(i,'bn',v)} options={['Yes','No']} />
            </div>
          </div>
        ))}
        <button className="btn" onClick={()=> setRows([...(rows||[]), {}])}>Add Row</button>
      </div>
    </div>
  )
}

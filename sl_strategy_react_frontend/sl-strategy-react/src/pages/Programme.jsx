import React from 'react'
import { useAppState } from '../context/StateContext.jsx'
import { TextInput } from '../components/Field.jsx'

export default function Programme(){
  const { state, persistLocal } = useAppState()
  const p = state.programme || { country:'', eppMonths:'', sections:[] }

  function setField(k, v){
    let newValue = v;
    if (k === 'eppMonths') {
      // Convert to number and clamp to 12
      const num = Number(v);
      if (!isNaN(num)) {
        newValue = Math.min(num, 12);
      }
    }
    const next = { ...state, programme: { ...p, [k]: newValue } }
    persistLocal(next)
  }

  // Section Focal Points logic
  const sections = p.sections || [];
  function setSectionField(idx, k, v) {
    const updated = sections.map((row, i) => i === idx ? { ...row, [k]: v } : row);
    setField('sections', updated);
  }
  function addRow() {
    setField('sections', [...sections, { section: '', main: '', backup: '' }]);
  }
  function removeRow(idx) {
    setField('sections', sections.filter((_, i) => i !== idx));
  }
  function clearAll() {
    setField('sections', []);
  }

  return (
    <div>
      <h2>Programme – Basics & Focal Points</h2>
      <div className="grid">
        <TextInput label="Country" value={p.country} onChange={v=>setField('country', v)} />
        <TextInput label="EPP Scenario Validity Period (Months)" type="number" value={p.eppMonths} onChange={v=>setField('eppMonths', v)} max={12} />
      </div>
      <hr style={{margin:'24px 0'}} />
      <h2 style={{color:'#00bcd4'}}>Section assigned supply focal point</h2>
      {sections.length === 0 && (
        <div style={{color:'#888',marginBottom:16}}>No sections added yet.</div>
      )}
      {sections.map((row, idx) => (
        <div key={idx} style={{background:'#fafcff',borderRadius:20,padding:20,marginBottom:16,border:'1px solid #e0f7fa'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:12}}>
            <span style={{background:'#e0f7fa',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold',marginRight:12}}>
              #{idx+1}
            </span>
            <button type="button" onClick={()=>removeRow(idx)} style={{marginRight:12,background:'#e0f7fa',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold',color:'#00bcd4',cursor:'pointer'}}>Remove</button>
          </div>
          <div className="grid" style={{marginBottom:0}}>
            <TextInput label="Section" value={row.section} onChange={v=>setSectionField(idx, 'section', v)} />
            <TextInput label="Main Focal Point" value={row.main} onChange={v=>setSectionField(idx, 'main', v)} />
            <TextInput label="Backup Focal Point" value={row.backup} onChange={v=>setSectionField(idx, 'backup', v)} />
          </div>
        </div>
      ))}
      <div style={{display:'flex',gap:12,marginTop:8}}>
        <button type="button" onClick={addRow} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:10,padding:'10px 28px',fontWeight:'bold',fontSize:18,cursor:'pointer'}}>Add Row</button>
        <button type="button" onClick={clearAll} style={{background:'#f5f7fa',color:'#00bcd4',border:'none',borderRadius:10,padding:'10px 28px',fontWeight:'bold',fontSize:18,cursor:'pointer'}}>Clear All</button>
      </div>
    </div>
  )
}

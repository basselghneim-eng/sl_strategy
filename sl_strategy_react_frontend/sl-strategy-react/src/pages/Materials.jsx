import React, { useRef } from 'react'
import { useAppState } from '../context/StateContext.jsx'
import { TextInput, Select } from '../components/Field.jsx'

function parseCSV(text){
  const rows=[]; let i=0, cur='', inQ=false, row=[]
  while(i<text.length){
    const ch=text[i]
    if(ch=='"'){ if(inQ && text[i+1]=='"'){cur+='"'; i++;} else {inQ=!inQ;} }
    else if(ch===',' && !inQ){ row.push(cur); cur=''; }
    else if((ch==='\n' || ch==='\r') && !inQ){
      if(cur!=='' || row.length>0){ row.push(cur); rows.push(row); row=[]; cur=''; }
    } else { cur+=ch; }
    i++
  }
  if(cur!=='' || row.length>0){ row.push(cur); rows.push(row); }
  return rows
}

const riskOpts = ['Natural','Man-made','Public Health','Multiple']
const yesNoOpts = ['Yes','No']
const prepositionActionOpts = ['No fund available','Fund available','Other']

export default function Materials(){
  const { state, persistLocal } = useAppState()
  const materials = state.materials || []
  const fileRef = useRef(null)

  function setRows(rows){ persistLocal({ ...state, materials: rows }) }
  function setFieldAt(i, k, v){
    const rows = [...materials]
    rows[i] = { ...(rows[i]||{}), [k]: v }
    setRows(rows)
  }
  const num = v=>Number.isFinite(+v)? +v : 0
  const gapQty = row => Math.max(0, num(row.qtyNeed)-num(row.qtyPre))
  const wavesTotal = row => `Waves total: ${num(row.qtyNeed)} / Required: ${num(row.qtyNeed)} • Remaining: ${Math.max(0, num(row.qtyNeed)-num(row.qtyPre))}`

  function importCSV(text){
    const rows = parseCSV(text).filter(r=>r.some(c=>String(c).trim()!==''))
    if(rows.length===0) return
    const header = rows.shift().map(h=>String(h).trim().toLowerCase())
    const idx = (names)=>{ for(const n of names){ const j = header.indexOf(n.toLowerCase()); if(j>-1) return j; } return -1; }
    const iSection = idx(['section'])
    const iCode = idx(['material code','code'])
    const iDesc = idx(['description','item description'])
    const iUnit = idx(['unit price (usd)','unit price','unit price usd','unit price$'])
    const iNeed = idx(['quantity needed','qty needed','needed'])
    const iPre = idx(['prepositioned qty (unicef + partners)','prepositioned qty','prepositioned','prepositioned qty unicef + partners'])
    if([iSection,iCode,iDesc,iUnit,iNeed,iPre].some(i=>i===-1)){
      alert('CSV missing required headers.')
      return
    }
    const added = []
    rows.forEach(r=>{
      const obj = {
        section: r[iSection]?.trim()||'',
        code: r[iCode]?.trim()||'',
        desc: r[iDesc]?.trim()||'',
        unitPrice: num(r[iUnit]),
        qtyNeed: num(r[iNeed]),
        qtyPre: num(r[iPre]),
      }
      if(obj.code || obj.desc) added.push(obj)
    })
    setRows([...(materials||[]), ...added])
  }

  return (
    <div>
      <h2>Programme – Materials</h2>
      <div style={{color:'#888',marginBottom:4}}>
        “Gap (Qty)” auto-calculates: Needed – Prepositioned. When Material Code is provided, a Procurement line is auto-synced.
      </div>
      <div style={{color:'#888',fontSize:13,marginBottom:16}}>
        Bulk upload Materials (CSV recommended; for Excel, please export to CSV)
      </div>
      <div className="row" style={{marginBottom:12}}>
        <input type="file" accept=".csv" ref={fileRef} />
        <button className="btn" style={{marginLeft:8,background:'#00bcd4',color:'#fff'}} onClick={()=>{
          const f = fileRef.current?.files?.[0]
          if(!f){ alert('Choose a CSV file'); return }
          const fr = new FileReader()
          fr.onload = ()=> importCSV(fr.result)
          fr.readAsText(f)
        }}>Upload CSV</button>
      </div>

      {materials.map((row, i)=>(
        <div key={i} style={{background:'#fafcff',borderRadius:20,padding:20,marginBottom:16,border:'1px solid #e0f7fa'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:12}}>
            <span style={{background:'#e0f7fa',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold',marginRight:12}}>
              #{i+1}
            </span>
            <button type="button" onClick={()=>setRows(materials.filter((_,j)=>j!==i))} style={{marginRight:12,background:'#e0f7fa',border:'none',borderRadius:8,padding:'8px 16px',fontWeight:'bold',color:'#00bcd4',cursor:'pointer'}}>Remove</button>
          </div>
          <div className="grid" style={{marginBottom:0}}>
            <TextInput label="Programme Section" value={row.section||''} onChange={v=>setFieldAt(i,'section',v)} />
            <Select label="Risk" value={row.risk||''} onChange={v=>setFieldAt(i,'risk',v)} options={riskOpts} />
            <TextInput label="Material Code" value={row.code||''} onChange={v=>setFieldAt(i,'code',v)} />
            <TextInput label="Description" value={row.desc||''} onChange={v=>setFieldAt(i,'desc',v)} />
            <TextInput label="Unit Price (USD)" type="number" value={row.unitPrice||''} onChange={v=>setFieldAt(i,'unitPrice',v)} />
            <TextInput label="Quantity Needed" type="number" value={row.qtyNeed||''} onChange={v=>setFieldAt(i,'qtyNeed',v)} />
            <TextInput label="Targeted population" type="number" value={row.targetPop||''} onChange={v=>setFieldAt(i,'targetPop',v)} />
            <TextInput label="Consumption duration by week" type="number" value={row.consumptionWeek||''} onChange={v=>setFieldAt(i,'consumptionWeek',v)} />
            <TextInput label="1st wave required quantity" type="number" value={row.wave1||''} onChange={v=>setFieldAt(i,'wave1',v)} />
            <TextInput label="2nd wave required quantity" type="number" value={row.wave2||''} onChange={v=>setFieldAt(i,'wave2',v)} />
            <div><label style={{fontSize:12,color:'var(--muted)'}}>Waves total</label><div className="chip">{wavesTotal(row)}</div></div>
            <TextInput label="Prepositioned Qty (UNICEF + Partners)" type="number" value={row.qtyPre||''} onChange={v=>setFieldAt(i,'qtyPre',v)} />
            <div><label style={{fontSize:12,color:'var(--muted)'}}>Gap (Qty)</label><div className="chip">{gapQty(row)}</div></div>
            <Select label="Is full qty needed required for prepositioning" value={row.fullQtyNeeded||'No'} onChange={v=>setFieldAt(i,'fullQtyNeeded',v)} options={yesNoOpts} />
            <Select label="Preposition action" value={row.prepositionAction||'No fund available'} onChange={v=>setFieldAt(i,'prepositionAction',v)} options={prepositionActionOpts} />
          </div>
        </div>
      ))}
      <div style={{display:'flex',gap:12,marginTop:8}}>
        <button type="button" onClick={()=> setRows([...(materials||[]), {}])} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:10,padding:'10px 28px',fontWeight:'bold',fontSize:18,cursor:'pointer'}}>Add Row</button>
        <button type="button" onClick={()=> setRows([])} style={{background:'#f5f7fa',color:'#00bcd4',border:'none',borderRadius:10,padding:'10px 28px',fontWeight:'bold',fontSize:18,cursor:'pointer'}}>Clear All</button>
      </div>
    </div>
  )
}

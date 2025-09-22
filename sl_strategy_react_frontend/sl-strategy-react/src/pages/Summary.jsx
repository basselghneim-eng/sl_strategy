import React from 'react'
import { useAppState } from '../context/StateContext.jsx'

export default function Summary(){
  const { state } = useAppState()
  const materials = state.materials || []
  const procure = state.procurements || []
  const num = v=>Number.isFinite(+v)? +v : 0
  const totalGap = materials.reduce((a,r)=> a + Math.max(0, num(r.qtyNeed)-num(r.qtyPre)), 0)
  const totalValue = materials.reduce((a,r)=> a + Math.max(0, num(r.qtyNeed)-num(r.qtyPre))*num(r.unitPrice), 0)
  const withBn = procure.filter(r=> r.bn==='Yes').length

  const KPI = ({title, value})=>(
    <div className="box"><h3>{title}</h3><div>{value}</div></div>
  )

  return (
    <div>
      <h2>Summary</h2>
      <div className="kpi">
        <KPI title="Materials entered" value={materials.length||0} />
        <KPI title="Total Gap (Qty)" value={totalGap} />
        <KPI title="Total Gap Value (USD)" value={Math.round(totalValue)} />
        <KPI title="Procurement lines with Bottlenecks" value={withBn} />
      </div>
    </div>
  )
}

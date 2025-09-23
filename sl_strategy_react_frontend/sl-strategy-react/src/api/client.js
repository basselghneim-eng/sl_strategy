import { useAuth } from '../context/AuthContext.jsx'

export function useApi(){
  const { apiBase, authHeader } = useAuth()
  async function uploadMaterialsCSV(strategyId, file){
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch(`${apiBase}/strategies/${strategyId}/materials/upload_csv`, {
      method:'POST', headers: { ...authHeader() }, body: fd
    })
    if(!r.ok) throw new Error('CSV upload failed')
    return await r.json()
  }
  async function fetchSummary(strategyId){
    const r = await fetch(`${apiBase}/strategies/${strategyId}/summary`, { headers: { ...authHeader() } })
    if(!r.ok) throw new Error('Summary failed')
    return await r.json()
  }
  return { uploadMaterialsCSV, fetchSummary }
}

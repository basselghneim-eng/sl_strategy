import React, { useEffect, useRef } from 'react'
import { useAppState } from '../context/StateContext.jsx'
import { TextInput } from '../components/Field.jsx'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapPage(){
  const { state, persistLocal } = useAppState()
  const mapRef = useRef(null)
  const mapDiv = useRef(null)

  function setMapField(k, v){
    persistLocal({ ...state, map: { ...(state.map||{}), [k]: v } })
  }

  useEffect(()=>{
    if(mapRef.current || !mapDiv.current) return
    const map = L.map(mapDiv.current).setView([20,0], 2)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
    mapRef.current = map
  }, [])

  return (
    <div>
      <h2>Map – Borders, Warehouses, Airports & Seaports</h2>
      <div className="grid">
        <TextInput label="Country (centers map)" value={state.map?.country||''} onChange={v=>setMapField('country', v)} />
      </div>
      <div id="mapView" ref={mapDiv}></div>
    </div>
  )
}

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select
from typing import List
import csv, io

from ..db import engine, Strategy, User
from ..auth import get_current_user
from ..schemas import StrategyCreate, StrategyOut, StrategyUpdate

router = APIRouter(prefix="/strategies", tags=["strategies"])

def _ensure_owner(s: Strategy, u: User):
    if s.owner_id != u.id: raise HTTPException(status_code=403, detail="Not authorized")

@router.post("", response_model=StrategyOut)
def create_strategy(payload: StrategyCreate, user: User = Depends(get_current_user)):
    with Session(engine) as session:
        s = Strategy(owner_id=user.id, name=payload.name); s.set_data(payload.data or {})
        session.add(s); session.commit(); session.refresh(s)
        return StrategyOut(id=s.id, name=s.name, data=s.get_data())

@router.get("", response_model=List[StrategyOut])
def list_strategies(user: User = Depends(get_current_user)):
    with Session(engine) as session:
        rows = session.exec(select(Strategy).where(Strategy.owner_id==user.id).order_by(Strategy.updated_at.desc())).all()
        return [StrategyOut(id=r.id, name=r.name, data=r.get_data()) for r in rows]

@router.get("/{sid}", response_model=StrategyOut)
def get_strategy(sid: int, user: User = Depends(get_current_user)):
    with Session(engine) as session:
        s = session.get(Strategy, sid); 
        if not s: raise HTTPException(status_code=404, detail="Not found")
        _ensure_owner(s, user); return StrategyOut(id=s.id, name=s.name, data=s.get_data())

@router.put("/{sid}", response_model=StrategyOut)
def put_strategy(sid: int, payload: StrategyCreate, user: User = Depends(get_current_user)):
    with Session(engine) as session:
        s = session.get(Strategy, sid)
        if not s: raise HTTPException(status_code=404, detail="Not found")
        _ensure_owner(s, user)
        s.name = payload.name; s.set_data(payload.data or {})
        session.add(s); session.commit(); session.refresh(s)
        return StrategyOut(id=s.id, name=s.name, data=s.get_data())

@router.patch("/{sid}", response_model=StrategyOut)
def patch_strategy(sid: int, payload: StrategyUpdate, user: User = Depends(get_current_user)):
    with Session(engine) as session:
        s = session.get(Strategy, sid)
        if not s: raise HTTPException(status_code=404, detail="Not found")
        _ensure_owner(s, user)
        if payload.name is not None: s.name = payload.name
        if payload.data is not None: s.set_data(payload.data)
        session.add(s); session.commit(); session.refresh(s)
        return StrategyOut(id=s.id, name=s.name, data=s.get_data())

@router.delete("/{sid}")
def delete_strategy(sid: int, user: User = Depends(get_current_user)):
    with Session(engine) as session:
        s = session.get(Strategy, sid)
        if not s: return {"status":"ok"}
        _ensure_owner(s, user); session.delete(s); session.commit()
        return {"status":"ok"}

@router.post("/{sid}/materials/upload_csv", response_model=StrategyOut)
async def upload_materials_csv(sid: int, file: UploadFile = File(...), user: User = Depends(get_current_user)):
    content = await file.read()
    try: text = content.decode("utf-8-sig")
    except UnicodeDecodeError: text = content.decode("latin1")
    rows = [r for r in csv.reader(io.StringIO(text)) if any(c.strip() for c in r)]
    if not rows: raise HTTPException(status_code=400, detail="Empty CSV")
    header = [h.strip().lower() for h in rows.pop(0)]
    def idx(names):
        for n in names:
            try: return header.index(n.lower())
            except ValueError: pass
        return -1
    i_section = idx(["section"])
    i_code = idx(["material code","code"])
    i_desc = idx(["description","item description"])
    i_unit = idx(["unit price (usd)","unit price","unit price usd","unit price$"])
    i_need = idx(["quantity needed","qty needed","needed"])
    i_pre = idx(["prepositioned qty (unicef + partners)","prepositioned qty","prepositioned"])
    if min(i_section,i_code,i_desc,i_unit,i_need,i_pre) < 0:
        raise HTTPException(status_code=400, detail="CSV missing required headers")

    with Session(engine) as session:
        s = session.get(Strategy, sid)
        if not s: raise HTTPException(status_code=404, detail="Not found")
        _ensure_owner(s, user)
        data = s.get_data(); materials = data.get("materials") or []
        def num(v):
            try:
                v = str(v).strip().replace(" ", "").replace(",", "")
                return float(v) if v else 0.0
            except: return 0.0
        for r in rows:
            obj = {
                "section": (r[i_section] or "").strip(),
                "code": (r[i_code] or "").strip(),
                "desc": (r[i_desc] or "").strip(),
                "unitPrice": num(r[i_unit]),
                "qtyNeed": num(r[i_need]),
                "qtyPre": num(r[i_pre]),
            }
            obj["gapQty"] = max(0, (obj["qtyNeed"] or 0) - (obj["qtyPre"] or 0))
            if obj["code"] or obj["desc"]: materials.append(obj)
        data["materials"] = materials; s.set_data(data)
        session.add(s); session.commit(); session.refresh(s)
        return StrategyOut(id=s.id, name=s.name, data=s.get_data())

@router.get("/{sid}/summary")
def summary(sid: int, user: User = Depends(get_current_user)):
    from math import fsum
    with Session(engine) as session:
        s = session.get(Strategy, sid)
        if not s: raise HTTPException(status_code=404, detail="Not found")
        _ensure_owner(s, user)
        data = s.get_data()
        mats = data.get("materials") or []
        def num(v): 
            try: return float(v)
            except: return 0.0
        gap_qty = fsum(max(0.0, num(m.get("qtyNeed")) - num(m.get("qtyPre"))) for m in mats)
        gap_val = fsum(max(0.0, num(m.get("qtyNeed")) - num(m.get("qtyPre"))) * num(m.get("unitPrice")) for m in mats)
        with_bn = len([1 for p in (data.get("procurements") or []) if (p or {}).get("bn") == "Yes"])
        return {"materialsCount": len(mats), "totalGapQty": gap_qty, "totalGapValueUSD": round(gap_val,2), "procurementsWithBottlenecks": with_bn}

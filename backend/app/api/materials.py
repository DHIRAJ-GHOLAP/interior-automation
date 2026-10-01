from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Material
from ..schemas import MaterialCreate, MaterialOut

router = APIRouter(prefix="/api/materials", tags=["Materials"])

@router.get("", response_model=List[MaterialOut])
def get_materials(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Material)
    if category:
        query = query.filter(Material.category == category)
    return query.order_by(Material.category, Material.name).all()

@router.post("", response_model=MaterialOut)
def create_material(mat_in: MaterialCreate, db: Session = Depends(get_db)):
    valid_cols = {c.name for c in Material.__table__.columns}
    clean_data = {k: v for k, v in mat_in.dict().items() if k in valid_cols and k != 'id'}
    mat = Material(**clean_data)
    db.add(mat)
    db.commit()
    db.refresh(mat)
    return mat

@router.put("/{material_id}", response_model=MaterialOut)
def update_material(material_id: str, mat_in: MaterialCreate, db: Session = Depends(get_db)):
    mat = db.query(Material).filter(Material.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")
    valid_cols = {c.name for c in Material.__table__.columns}
    clean_data = {k: v for k, v in mat_in.dict().items() if k in valid_cols and k != 'id'}
    for key, val in clean_data.items():
        setattr(mat, key, val)
    db.commit()
    db.refresh(mat)
    return mat

@router.delete("/{material_id}")
def delete_material(material_id: str, db: Session = Depends(get_db)):
    mat = db.query(Material).filter(Material.id == material_id).first()
    if not mat:
        return {"message": "Material already deleted or does not exist", "id": material_id}
    from ..models import BOQItem
    db.query(BOQItem).filter(BOQItem.material_id == material_id).update({BOQItem.material_id: None})
    db.delete(mat)
    db.commit()
    return {"message": "Material deleted"}

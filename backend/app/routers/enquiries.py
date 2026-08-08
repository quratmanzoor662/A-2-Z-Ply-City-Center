from fastapi import APIRouter, Depends, HTTPException, status
from pymongo import ReturnDocument

from app.auth.deps import get_current_admin
from app.db import get_db
from app.schemas.catalog import EnquiryIn, EnquiryStatusIn
from app.utils import oid, serialize_doc, serialize_list, utcnow

router = APIRouter(tags=["enquiries"])


@router.post("/api/enquiries", status_code=status.HTTP_201_CREATED)
async def create_enquiry(body: EnquiryIn):
    doc = {
        **body.model_dump(),
        "status": "pending",
        "createdAt": utcnow(),
        "updatedAt": utcnow(),
    }
    result = await get_db().enquiries.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.get("/api/admin/enquiries")
async def list_enquiries(status_filter: str | None = None, _: dict = Depends(get_current_admin)):
    query: dict = {}
    if status_filter:
        query["status"] = status_filter
    docs = await get_db().enquiries.find(query).sort("createdAt", -1).to_list(500)
    return serialize_list(docs)


@router.patch("/api/admin/enquiries/{enquiry_id}")
async def update_enquiry_status(
    enquiry_id: str, body: EnquiryStatusIn, _: dict = Depends(get_current_admin)
):
    if body.status not in {"pending", "contacted", "completed"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    _id = oid(enquiry_id)
    if not _id:
        raise HTTPException(status_code=400, detail="Invalid id")
    result = await get_db().enquiries.find_one_and_update(
        {"_id": _id},
        {"$set": {"status": body.status, "updatedAt": utcnow()}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return serialize_doc(result)

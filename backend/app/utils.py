import re
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9\s-]", "", value)
    value = re.sub(r"[\s_-]+", "-", value)
    return value.strip("-")


def oid(value: str | ObjectId | None) -> ObjectId | None:
    if value is None:
        return None
    if isinstance(value, ObjectId):
        return value
    if ObjectId.is_valid(value):
        return ObjectId(value)
    return None


def serialize_doc(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    if doc is None:
        return None
    result: dict[str, Any] = {}
    for key, value in doc.items():
        if key == "_id":
            result["id"] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, list):
            result[key] = [serialize_value(item) for item in value]
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)  # type: ignore[assignment]
        else:
            result[key] = value
    return result


def serialize_value(value: Any) -> Any:
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, list):
        return [serialize_value(item) for item in value]
    if isinstance(value, dict):
        return serialize_doc(value)
    return value


def serialize_list(docs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [serialize_doc(doc) for doc in docs if doc]  # type: ignore[misc]


def compute_discount(mrp: float, selling_price: float) -> float:
    if mrp <= 0:
        return 0.0
    return round(max(0.0, ((mrp - selling_price) / mrp) * 100), 2)


def denormalize_product_fields(data: dict[str, Any]) -> dict[str, Any]:
    variants = data.get("variants") or []
    colors = sorted({v.get("color") for v in variants if v.get("color")})
    prices = [float(v.get("sellingPrice", 0) or 0) for v in variants if v.get("sellingPrice") is not None]
    if not prices and data.get("sellingPrice") is not None:
        prices = [float(data["sellingPrice"])]
    stocks = [int(v.get("stock", 0) or 0) for v in variants]
    in_stock = any(s > 0 for s in stocks) if stocks else bool(data.get("inStock", True))

    materials = data.get("materials") or []
    finishes = data.get("finishes") or []
    for spec in data.get("specifications") or []:
        key = (spec.get("key") or "").strip().lower()
        val = (spec.get("value") or "").strip()
        if not val:
            continue
        if key == "material" and val not in materials:
            materials.append(val)
        if key == "finish" and val not in finishes:
            finishes.append(val)

    mrp = float(data.get("mrp") or 0)
    selling = float(data.get("sellingPrice") or 0)
    data["colors"] = colors
    data["materials"] = materials
    data["finishes"] = finishes
    data["inStock"] = in_stock
    data["minPrice"] = min(prices) if prices else selling
    data["maxPrice"] = max(prices) if prices else selling
    data["discount"] = compute_discount(mrp, selling)
    return data

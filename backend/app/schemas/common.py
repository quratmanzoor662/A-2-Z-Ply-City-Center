from pydantic import BaseModel, Field


class ImageSchema(BaseModel):
    url: str
    publicId: str | None = None
    alt: str = ""
    sortOrder: int = 0


class SpecSchema(BaseModel):
    key: str
    value: str


class VariantSchema(BaseModel):
    id: str
    name: str
    color: str | None = None
    size: str | None = None
    sku: str | None = None
    mrp: float = 0
    sellingPrice: float = 0
    stock: int = 0
    images: list[ImageSchema] = Field(default_factory=list)


class MessageOut(BaseModel):
    message: str

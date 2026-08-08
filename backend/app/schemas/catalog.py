import re

from pydantic import BaseModel, Field, field_validator

from app.schemas.common import ImageSchema, SpecSchema, VariantSchema


class CategoryIn(BaseModel):
    name: str
    slug: str | None = None
    description: str = ""
    image: ImageSchema | None = None
    sortOrder: int = 0
    active: bool = True


class BrandIn(BaseModel):
    name: str
    slug: str | None = None
    description: str = ""
    logo: ImageSchema | None = None
    active: bool = True


class BannerIn(BaseModel):
    title: str = ""
    subtitle: str = ""
    buttonText: str = ""
    buttonLink: str = ""
    desktopImage: ImageSchema | None = None
    mobileImage: ImageSchema | None = None
    sortOrder: int = 0
    active: bool = True


class ProductIn(BaseModel):
    name: str
    slug: str | None = None
    sku: str
    categoryId: str
    brandId: str | None = None
    shortDescription: str = ""
    description: str = ""
    status: str = "active"
    isFeatured: bool = False
    isNewArrival: bool = False
    mrp: float = 0
    sellingPrice: float = 0
    images: list[ImageSchema] = Field(default_factory=list)
    variants: list[VariantSchema] = Field(default_factory=list)
    specifications: list[SpecSchema] = Field(default_factory=list)
    features: list[str] = Field(default_factory=list)
    materials: list[str] = Field(default_factory=list)
    finishes: list[str] = Field(default_factory=list)


class EnquiryIn(BaseModel):
    customerName: str = Field(min_length=2, max_length=60)
    phone: str
    productId: str
    productName: str
    variantId: str | None = None
    variantName: str | None = None

    @field_validator("customerName")
    @classmethod
    def validate_name(cls, value: str) -> str:
        name = value.strip()
        if not re.fullmatch(r"[a-zA-Z\s.'-]{2,60}", name):
            raise ValueError("Name can only contain letters and spaces")
        return name

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        digits = re.sub(r"\D", "", value or "")
        mobile = digits
        if mobile.startswith("91") and len(mobile) == 12:
            mobile = mobile[2:]
        elif mobile.startswith("0") and len(mobile) == 11:
            mobile = mobile[1:]
        if not re.fullmatch(r"[6-9]\d{9}", mobile):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return mobile


class EnquiryStatusIn(BaseModel):
    status: str


class SettingsIn(BaseModel):
    storeName: str = "A-2-Z Ply City Center"
    tagline: str = "Premium Plywood & Hardware Solutions"
    logoUrl: str = ""
    whatsappNumber: str = ""
    email: str = ""
    phone: str = ""
    address: str = ""
    mapsUrl: str = ""
    mapsEmbedUrl: str = ""
    openingHours: str = ""
    facebookUrl: str = ""
    instagramUrl: str = ""
    youtubeUrl: str = ""

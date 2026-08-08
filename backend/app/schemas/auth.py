from pydantic import BaseModel, EmailStr, Field


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=4)


class TokenOut(BaseModel):
    accessToken: str
    tokenType: str = "bearer"


class AdminOut(BaseModel):
    id: str
    email: EmailStr
    name: str

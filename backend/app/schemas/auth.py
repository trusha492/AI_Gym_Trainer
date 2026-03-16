from pydantic import BaseModel, EmailStr

class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str


class AdminRegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    admin_key: str | None = None


class LoginSchema(BaseModel):
    email: EmailStr
    password: str

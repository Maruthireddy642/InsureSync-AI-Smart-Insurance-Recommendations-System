from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: str = "customer"  # customer | provider | admin (admin creation should be gated in real deployments)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str
    user_id: int

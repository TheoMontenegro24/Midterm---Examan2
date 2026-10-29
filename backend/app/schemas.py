from pydantic import BaseModel, HttpUrl


class ShortenRequest(BaseModel):
    original_url: HttpUrl

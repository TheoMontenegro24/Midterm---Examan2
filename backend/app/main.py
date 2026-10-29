import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from . import config, db
from .schemas import ShortenRequest

app = FastAPI(title="URL Shortener")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def _get_or_404(short_code: str) -> dict:
    try:
        uuid.UUID(short_code)
    except ValueError:
        raise HTTPException(status_code=404, detail="Enlace no encontrado")
    item = db.get_link(short_code)
    if not item:
        raise HTTPException(status_code=404, detail="Enlace no encontrado")
    return item


@app.post("/shorten")
def shorten(body: ShortenRequest):
    short_code = str(uuid.uuid4())  # UUID generado en el backend
    item = db.save_link(short_code, str(body.original_url))
    return {
        "short_code": short_code,
        "original_url": item["original_url"],
        "short_url": f"{config.PUBLIC_BASE_URL}/{short_code}",
    }


@app.get("/urls/{short_code}")
def get_info(short_code: str):
    item = _get_or_404(short_code)
    return {
        "short_code": item["short_code"],
        "original_url": item["original_url"],
        "created_at": item["created_at"],
    }


@app.get("/{short_code}")
def redirect(short_code: str):
    item = _get_or_404(short_code)
    return RedirectResponse(url=item["original_url"], status_code=307)

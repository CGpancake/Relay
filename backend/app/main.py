from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers.people import router as people_router


def create_app() -> FastAPI:
    app = FastAPI(title="Relay API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(people_router)

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()

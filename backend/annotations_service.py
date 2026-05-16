import os
from typing import Any
from uuid import UUID, uuid4

import asyncpg
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

app = FastAPI(title="Relay Annotation Service")


class AnnotationCreate(BaseModel):
    project_id: str
    shot_id: str
    version_id: str
    frame_number: int
    user_id: str
    body: dict[str, Any]


class AnnotationPatch(BaseModel):
    body: dict[str, Any]


class AnnotationRow(AnnotationCreate):
    id: UUID
    created_at: str = Field(serialization_alias="created_at")
    updated_at: str = Field(serialization_alias="updated_at")


@app.on_event("startup")
async def startup() -> None:
    database_url = os.environ.get("DATABASE_URL")
    if database_url is None:
        raise RuntimeError("Set DATABASE_URL before starting the annotation service.")
    app.state.pool = await asyncpg.create_pool(database_url)


@app.on_event("shutdown")
async def shutdown() -> None:
    await app.state.pool.close()


@app.get("/annotations")
async def list_annotations(
    project_id: str = Query(...),
    shot_id: str = Query(...),
    version_id: str = Query(...),
    frame_number: int = Query(...),
) -> list[dict[str, Any]]:
    rows = await app.state.pool.fetch(
        """
        select id, project_id, shot_id, version_id, frame_number, user_id, body, created_at, updated_at
        from annotations
        where project_id = $1 and shot_id = $2 and version_id = $3 and frame_number = $4
        order by created_at asc
        """,
        project_id,
        shot_id,
        version_id,
        frame_number,
    )
    return [serialize_row(row) for row in rows]


@app.post("/annotations", status_code=201)
async def create_annotation(payload: AnnotationCreate) -> dict[str, Any]:
    row = await app.state.pool.fetchrow(
        """
        insert into annotations (id, project_id, shot_id, version_id, frame_number, user_id, body)
        values ($1, $2, $3, $4, $5, $6, $7)
        returning id, project_id, shot_id, version_id, frame_number, user_id, body, created_at, updated_at
        """,
        uuid4(),
        payload.project_id,
        payload.shot_id,
        payload.version_id,
        payload.frame_number,
        payload.user_id,
        payload.body,
    )
    return serialize_row(row)


@app.patch("/annotations/{annotation_id}")
async def update_annotation(annotation_id: UUID, payload: AnnotationPatch) -> dict[str, Any]:
    row = await app.state.pool.fetchrow(
        """
        update annotations
        set body = $2, updated_at = now()
        where id = $1
        returning id, project_id, shot_id, version_id, frame_number, user_id, body, created_at, updated_at
        """,
        annotation_id,
        payload.body,
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Annotation not found")
    return serialize_row(row)


@app.delete("/annotations/{annotation_id}", status_code=204)
async def delete_annotation(annotation_id: UUID) -> None:
    result = await app.state.pool.execute("delete from annotations where id = $1", annotation_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Annotation not found")


def serialize_row(row: asyncpg.Record) -> dict[str, Any]:
    return {
        "id": str(row["id"]),
        "project_id": row["project_id"],
        "shot_id": row["shot_id"],
        "version_id": row["version_id"],
        "frame_number": row["frame_number"],
        "user_id": row["user_id"],
        "body": row["body"],
        "created_at": row["created_at"].isoformat(),
        "updated_at": row["updated_at"].isoformat(),
    }

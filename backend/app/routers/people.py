from datetime import datetime, timezone
from uuid import uuid4
from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..db import get_session
from ..models import Person, PersonPermission
from ..schemas import DEFAULT_PERMISSIONS, PermissionsPatch, PersonCreate, PersonPatch, PersonRead, VIEW_IDS

router = APIRouter(prefix="/api/people", tags=["people"])


def _permissions_for(level: str, permissions: Optional[dict] = None) -> Dict[str, bool]:
    base = DEFAULT_PERMISSIONS.get(level, DEFAULT_PERMISSIONS["Artist"]).copy()
    if permissions:
        for view_id, enabled in permissions.items():
            if view_id in VIEW_IDS:
                base[view_id] = bool(enabled)
    return base


def _serialize(person: Person) -> PersonRead:
    permissions = {permission.view_id: permission.enabled for permission in person.permissions}
    return PersonRead(
        id=person.id,
        name=person.display_name,
        role=person.role_label,
        permissionLevel=person.permission_level,  # type: ignore[arg-type]
        discipline=person.discipline,
        email=person.email,
        phone=person.phone,
        engagementStatus=person.engagement_status,  # type: ignore[arg-type]
        notes=person.notes,
        isBot=person.is_bot,
        permissions=_permissions_for(person.permission_level, permissions),  # type: ignore[arg-type]
        createdAt=person.created_at,
        updatedAt=person.updated_at,
        archivedAt=person.archived_at,
    )


def _get_person(session: Session, person_id: str, include_archived: bool = False) -> Person:
    statement = select(Person).options(selectinload(Person.permissions)).where(Person.id == person_id)
    if not include_archived:
        statement = statement.where(Person.archived_at.is_(None))
    person = session.scalars(statement).first()
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    return person


def _set_permissions(person: Person, permissions: Dict[str, bool]) -> None:
    person.permissions.clear()
    for view_id in VIEW_IDS:
        person.permissions.append(PersonPermission(view_id=view_id, enabled=bool(permissions.get(view_id, False))))


@router.get("", response_model=list[PersonRead])
def list_people(
    include_archived: bool = Query(default=False),
    session: Session = Depends(get_session),
) -> list[PersonRead]:
    statement = select(Person).options(selectinload(Person.permissions)).order_by(Person.display_name.asc())
    if not include_archived:
        statement = statement.where(Person.archived_at.is_(None))
    return [_serialize(person) for person in session.scalars(statement).all()]


@router.get("/{person_id}", response_model=PersonRead)
def read_person(person_id: str, session: Session = Depends(get_session)) -> PersonRead:
    return _serialize(_get_person(session, person_id))


@router.post("", response_model=PersonRead, status_code=status.HTTP_201_CREATED)
def create_person(payload: PersonCreate, session: Session = Depends(get_session)) -> PersonRead:
    person_id = payload.id or str(uuid4())
    existing = session.get(Person, person_id)
    if existing is not None:
        raise HTTPException(status_code=409, detail="Person id already exists")

    person = Person(
        id=person_id,
        display_name=payload.name,
        role_label=payload.role,
        permission_level=payload.permissionLevel,
        discipline=payload.discipline,
        email=str(payload.email) if payload.email else None,
        phone=payload.phone,
        engagement_status=payload.engagementStatus,
        notes=payload.notes,
        is_bot=payload.isBot,
    )
    _set_permissions(person, _permissions_for(payload.permissionLevel, payload.permissions))
    session.add(person)
    session.commit()
    session.refresh(person)
    return _serialize(_get_person(session, person.id))


@router.patch("/{person_id}", response_model=PersonRead)
def update_person(person_id: str, payload: PersonPatch, session: Session = Depends(get_session)) -> PersonRead:
    person = _get_person(session, person_id)
    changes = payload.model_dump(exclude_unset=True)

    if "name" in changes:
        person.display_name = changes["name"]
    if "role" in changes:
        person.role_label = changes["role"]
    if "permissionLevel" in changes:
        person.permission_level = changes["permissionLevel"]
    if "discipline" in changes:
        person.discipline = changes["discipline"]
    if "email" in changes:
        person.email = str(changes["email"]) if changes["email"] else None
    if "phone" in changes:
        person.phone = changes["phone"]
    if "engagementStatus" in changes:
        person.engagement_status = changes["engagementStatus"]
    if "notes" in changes:
        person.notes = changes["notes"]
    if "isBot" in changes:
        person.is_bot = changes["isBot"]
    if "permissions" in changes:
        _set_permissions(person, _permissions_for(person.permission_level, changes["permissions"]))
    elif "permissionLevel" in changes:
        _set_permissions(person, _permissions_for(person.permission_level))

    person.updated_at = datetime.now(timezone.utc)
    session.commit()
    return _serialize(_get_person(session, person_id))


@router.patch("/{person_id}/permissions", response_model=PersonRead)
def update_permissions(person_id: str, payload: PermissionsPatch, session: Session = Depends(get_session)) -> PersonRead:
    person = _get_person(session, person_id)
    _set_permissions(person, _permissions_for(person.permission_level, payload.permissions))
    person.updated_at = datetime.now(timezone.utc)
    session.commit()
    return _serialize(_get_person(session, person_id))


@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
def archive_person(
    person_id: str,
    current_person_id: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
) -> Response:
    if current_person_id and current_person_id == person_id:
        raise HTTPException(status_code=409, detail="Cannot archive the current person")
    person = _get_person(session, person_id)
    person.archive()
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

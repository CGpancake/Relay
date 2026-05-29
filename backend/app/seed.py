from sqlalchemy.orm import Session

from .freelance_people import FREELANCE_PEOPLE
from .models import Person
from .routers.people import _permissions_for, _set_permissions

SEED_PEOPLE = [
    {
        "id": "person-admin",
        "name": "James Green",
        "role": "Admin",
        "permissionLevel": "Admin",
        "discipline": "Admin",
        "engagementStatus": "permanent",
    },
    {
        "id": "person-manager",
        "name": "Ben Hall",
        "role": "Manager",
        "permissionLevel": "Manager",
        "discipline": "Manager",
        "engagementStatus": "permanent",
    },
    {
        "id": "person-manager-b",
        "name": "Harry Hughes",
        "role": "Manager",
        "permissionLevel": "Manager",
        "discipline": "Manager",
        "engagementStatus": "permanent",
    },
    {
        "id": "person-artist-a",
        "name": "Tom Amrose",
        "role": "Artist",
        "permissionLevel": "Artist",
        "discipline": "Artist",
        "engagementStatus": "permanent",
    },
    {
        "id": "person-artist-b",
        "name": "Aryaan Arora",
        "role": "Artist",
        "permissionLevel": "Artist",
        "discipline": "Artist",
        "engagementStatus": "permanent",
    },
    {
        "id": "person-artist-c",
        "name": "Billy Towsend",
        "role": "Artist",
        "permissionLevel": "Artist",
        "discipline": "Artist",
        "engagementStatus": "permanent",
    },
]


def seed_people(session: Session) -> int:
    inserted = 0
    for record in [*SEED_PEOPLE, *FREELANCE_PEOPLE]:
        if session.get(Person, record["id"]) is not None:
            continue
        level = record.get("permissionLevel", "Artist")
        person = Person(
            id=record["id"],
            display_name=record["name"],
            role_label=record.get("role", "Artist"),
            permission_level=level,
            discipline=record.get("discipline", "Generalist"),
            email=record.get("email"),
            phone=record.get("phone"),
            engagement_status=record.get("engagementStatus", "unknown"),
            notes=record.get("notes"),
            is_bot=record.get("isBot", False),
        )
        _set_permissions(person, _permissions_for(level, record.get("permissions")))
        session.add(person)
        inserted += 1
    session.commit()
    return inserted

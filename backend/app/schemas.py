from datetime import datetime
from typing import Dict, Optional, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

PermissionLevel = Literal["Admin", "Manager", "Artist", "Client"]
EngagementStatus = Literal["permanent", "available_to_hire", "unavailable", "unknown"]
ViewId = Literal[
    "projects",
    "calendar",
    "tasks",
    "bidding",
    "finance-map",
    "archive",
    "documentation",
    "people",
    "settings",
]

VIEW_IDS: tuple[str, ...] = (
    "projects",
    "calendar",
    "tasks",
    "bidding",
    "finance-map",
    "archive",
    "documentation",
    "people",
    "settings",
)

DEFAULT_PERMISSIONS: dict[str, dict[str, bool]] = {
    "Admin": {view_id: True for view_id in VIEW_IDS},
    "Manager": {view_id: view_id != "settings" for view_id in VIEW_IDS},
    "Artist": {view_id: view_id in {"projects", "calendar", "tasks", "documentation", "people"} for view_id in VIEW_IDS},
    "Client": {view_id: view_id in {"projects", "tasks"} for view_id in VIEW_IDS},
}


class PersonBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    role: str = Field(default="Artist", min_length=1, max_length=120)
    permissionLevel: PermissionLevel = "Artist"
    discipline: str = Field(default="Generalist", min_length=1, max_length=120)
    email: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=80)
    engagementStatus: EngagementStatus = "unknown"
    notes: Optional[str] = None
    isBot: bool = False
    permissions: Optional[Dict[ViewId, bool]] = None

    @field_validator("name", "role", "discipline")
    @classmethod
    def strip_required(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("must not be blank")
        return stripped

    @field_validator("email", "phone")
    @classmethod
    def strip_optional_text(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() or None if value else None


class PersonCreate(PersonBase):
    id: Optional[str] = Field(default=None, max_length=64)


class PersonPatch(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    role: Optional[str] = Field(default=None, min_length=1, max_length=120)
    permissionLevel: Optional[PermissionLevel] = None
    discipline: Optional[str] = Field(default=None, min_length=1, max_length=120)
    email: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=80)
    engagementStatus: Optional[EngagementStatus] = None
    notes: Optional[str] = None
    isBot: Optional[bool] = None
    permissions: Optional[Dict[ViewId, bool]] = None


class PermissionsPatch(BaseModel):
    permissions: dict[ViewId, bool]


class PersonRead(PersonBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    createdAt: datetime
    updatedAt: datetime
    archivedAt: Optional[datetime] = None

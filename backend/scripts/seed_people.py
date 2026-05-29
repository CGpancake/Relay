from backend.app.db import Base, SessionLocal, engine
from backend.app.models import Person, PersonPermission  # noqa: F401
from backend.app.seed import seed_people


def main() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        inserted = seed_people(session)
    print(f"Seeded {inserted} people")


if __name__ == "__main__":
    main()

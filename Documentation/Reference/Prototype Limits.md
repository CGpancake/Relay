# Prototype Limits

Relay is currently a frontend-only prototype. It is built to make workflow decisions visible before backend and integration work begins.

## Not included yet

- Backend APIs.
- Database persistence.
- Authentication.
- Production authorization.
- Realtime collaboration.
- DCC integration.
- Production import or export.
- Durable notifications.

## Data reset

Most app data resets on page load. This keeps smoke tests and product review sessions deterministic. Theme and current prototype user persist so visual settings and permission gates can be tested across reloads.

## Documentation source

This human wiki is loaded from the `Documentation/` folder at build time. The concise `docs/` folder remains the agent and developer memory source.

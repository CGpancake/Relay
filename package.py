name = "relay"
version = "0.1.0"

description = "Relay Vite frontend build and deployment environment"

requires = [
    "node-20+",
]

tools = [
    "relay_install",
    "relay_build",
    "relay_preview",
    "relay_smoke",
]


def commands():
    env.RELAY_ROOT = "{root}"

    alias("relay_install", "cd $RELAY_ROOT && npm ci")
    alias("relay_build", "cd $RELAY_ROOT && npm run build")
    alias("relay_preview", "cd $RELAY_ROOT && npm run preview")
    alias("relay_smoke", "cd $RELAY_ROOT && npm run test:smoke")

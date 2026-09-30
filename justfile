# Directories
run_dir := absolute_path("./run")
target_dir := absolute_path("./backend/target")
js_build_dir := absolute_path("./backend/src/main/resources/static/js/bundle")
socket_file := absolute_path("./run/socket.sock")

# App
app_port := "8080"

# Frontend build
esbuild_script := absolute_path("./frontend/build/build.mjs")

default:
    #!/usr/bin/env bash
    set -euo pipefail
    just --list

# --- Server lifecycle ---

run: stop (frontend-build "production")
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Starting local server"
    overmind start -D -s '{{socket_file}}' -l spring_boot
    just ready
    echo "Local server started"

run-dev: stop (frontend-build "development")
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Starting local server and file watchers for development"
    overmind start -D -s '{{socket_file}}' --any-can-die -x spring_boot_debug
    just ready
    echo "Local server started"

# Suspends until a debugger attaches on :5005
debug: stop (frontend-build "production")
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Starting local server, listening for debugger on port 5005"
    overmind start -D -s '{{socket_file}}' -l spring_boot_debug
    echo "Local server started"

connect:
    #!/usr/bin/env bash
    set -euo pipefail
    overmind c -s '{{socket_file}}'

stop: _ensure-run-dir
    #!/usr/bin/env bash
    set -euo pipefail
    if [ ! -S '{{socket_file}}' ]; then
        echo "No socket file found. Nothing to stop."
        exit 0
    fi
    echo "Stopping local server"
    if overmind quit -s '{{socket_file}}' 2>/dev/null; then
        for _ in $(seq 1 50); do
            [ -S '{{socket_file}}' ] || break
            sleep 0.1
        done
        if [ -S '{{socket_file}}' ]; then
            echo "Server did not shut down in time; removing stale socket."
            rm -f '{{socket_file}}'
        else
            echo "Processes stopped."
        fi
    else
        echo "Socket was stale (left over from an unclean shutdown); removing it."
        rm -f '{{socket_file}}'
    fi

# --- Frontend ---

frontend-build mode="production": _ensure-run-dir
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Compiling frontend ({{mode}})"
    cd frontend/build && node '{{esbuild_script}}' '{{mode}}'
    echo "Compiled frontend"

# --- Quality ---

format:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Formatting backend"
    cd backend && ./mvnw spotless:apply

lint:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Linting frontend"
    cd frontend && npx eslint .
    echo "Linting backend"
    cd backend && ./mvnw spotbugs:check

typecheck:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Type-checking frontend"
    cd frontend && npx tsc --noEmit
    echo "Frontend type-checked"

# --- Housekeeping ---

_ensure-run-dir:
    #!/usr/bin/env bash
    set -euo pipefail
    mkdir -p '{{run_dir}}'

clean:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Cleaning target and run directories"
    rm -rf '{{target_dir}}'
    rm -rf '{{run_dir}}'
    rm -rf '{{js_build_dir}}'
    echo "Directories cleaned"

# ---- Agent utilities ----

# Non-interactive process list (no tty needed, unlike `connect`).
ps:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -S '{{socket_file}}' ]; then
        overmind status -s '{{socket_file}}'
    else
        echo "No socket file found. Server isn't running."
    fi

# Non-interactive log stream (no tty needed, unlike `connect`);
logs:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -S '{{socket_file}}' ]; then
        overmind echo -s '{{socket_file}}'
    else
        echo "No socket file found. Server isn't running."
    fi

# Blocks until the app is actually serving HTTP - `overmind start -D` returns as soon as it forks, not once Spring Boot finishes booting.
ready:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Waiting for server on :{{app_port}}"
    for _ in $(seq 1 60); do
        if curl -sf -o /dev/null "http://localhost:{{app_port}}/"; then
            exit 0
        fi
        sleep 1
    done
    echo "Server did not become ready within 60s - check 'just logs'." >&2
    exit 1

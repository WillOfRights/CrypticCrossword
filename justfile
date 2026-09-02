set shell := ["bash", "-uc"]

# Directories
run_dir := absolute_path("./run")
target_dir := absolute_path("./backend/target")
js_build_dir := absolute_path("./backend/src/main/resources/static/js/bundle")
socket_file := absolute_path("./run/socket.sock")

# Frontend build
esbuild_script := absolute_path("./frontend/build/build.mjs")

default:
    @just --list

# --- Server lifecycle ---

run: stop (frontend-build "production")
    @echo "Starting local server"
    overmind start -D -s {{socket_file}} -l spring_boot
    @echo "Local server started"

run-dev: stop (frontend-build "development")
    @echo "Starting local server and file watchers for development"
    overmind start -D -s {{socket_file}} --any-can-die -x spring_boot_debug
    @echo "Local server started"

debug: stop (frontend-build "production")
    @echo "Starting local server, listening for debugger on port 5005"
    overmind start -D -s {{socket_file}} -l spring_boot_debug
    @echo "Local server started"

connect:
    overmind c -s {{socket_file}}

stop: _ensure-run-dir
    #!/usr/bin/env bash
    if [ -S '{{socket_file}}' ]; then
        echo "Stopping local server"
        overmind quit -s {{socket_file}}
        while [ -S '{{socket_file}}' ]; do sleep 0.1; done
        echo "Processes stopped."
    else
        echo "No socket file found. Nothing to stop."
    fi

# --- Frontend ---

frontend-build mode="production": _ensure-run-dir
    @echo "Compiling frontend ({{mode}})"
    cd frontend/build && node '{{esbuild_script}}' {{mode}}
    @echo "Compiled frontend"

# --- Quality ---

format:
    @echo "Formatting backend"
    cd backend && ./mvnw spotless:apply

lint:
    @echo "Linting frontend"
    cd frontend && npx eslint .
    @echo "Linting backend"
    cd backend && ./mvnw spotbugs:check

# --- Housekeeping ---

_ensure-run-dir:
    @mkdir -p '{{run_dir}}'

clean:
    @echo "Cleaning target and run directories"
    rm -rf '{{target_dir}}'
    rm -rf '{{run_dir}}'
    rm -rf '{{js_build_dir}}'
    @echo "Directories cleaned"
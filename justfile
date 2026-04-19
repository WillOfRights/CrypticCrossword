# Directories
RUN_DIR:=absolute_path("./run")
TARGET_DIR:=absolute_path("./backend/target")
JS_BUILD_DIR:=absolute_path("./backend/src/main/resources/static/js/bundle")

# Run Files
SOCKET_FILE:=absolute_path("./run/socket.sock")

# Frontend build scripts
ESBUILD_SCRIPT:=absolute_path("./frontend/build/build.mjs")
ESWATCH_SCRIPT:=absolute_path("./frontend/build/watch.mjs")
LINT_FRONTEND:="cd frontend && npx eslint ."

# Spring and backend build scripts/goals
SPRING_RUN:="cd backend && ./mvnw spring-boot:run"
WATCH_BACKEND:="cd backend && watchexec -w src/main/resources/static/js/bundle --postpone -d 1s -e mustache,js,css './mvnw resources:resources'"
FORMAT_BACKEND:="cd backend && ./mvnw spotless:apply"
LINT_BACKEND:="cd backend && ./mvnw spotbugs:check"
DEBUG_SUFFIX_BACKEND:="-Dspring-boot.run.jvmArguments=-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=*:5005"

# Frontend build constants
PROD_FRONTEND_MODE:= "production"
DEV_FRONTEND_MODE:= "development"

run: stop (frontend-build "production")
  @echo "Starting local server"
  @overmind start -D -s {{SOCKET_FILE}} -l spring_boot
  @echo "Local server started"

run-dev: stop (frontend-build "development")
  @echo "Starting local server and file watchers for development"
  @overmind start -D -s {{SOCKET_FILE}} -x spring_boot_debug
  @echo "Local server started"

debug: stop (frontend-build "production")
  @echo "Starting local run and listening for debugger on port 5005"
  @overmind start -D -s {{SOCKET_FILE}} -l spring_boot_debug
  @echo "Local server started"

stop: validate-directories
  @if [ -S '{{SOCKET_FILE}}' ]; then \
    echo "Stopping local server"; \
    overmind quit -s {{SOCKET_FILE}}; \
    while [ -S '{{SOCKET_FILE}}' ]; do sleep 0.1; done; \
    echo "Processes stopped."; \
  else \
    echo "No socket file found. Nothing to stop."; \
  fi


frontend-build dev_mode=PROD_FRONTEND_MODE: validate-directories
  @echo "Compiling frontend"
  @if [ {{dev_mode}} = {{DEV_FRONTEND_MODE}} ]; then \
    cd frontend/build && node '{{ESBUILD_SCRIPT}}' {{DEV_FRONTEND_MODE}}; \
  else \
    cd frontend/build && node '{{ESBUILD_SCRIPT}}' {{PROD_FRONTEND_MODE}}; \
  fi
  @echo "Compiled frontend"

validate-directories:
  @mkdir -p '{{RUN_DIR}}'

format:
  @echo "Formatting backend"
  @{{FORMAT_BACKEND}}

lint:
  @echo "Linting frontend"
  @{{LINT_FRONTEND}}
  @{{LINT_BACKEND}}

clean:
  @echo "Cleaning target and run directories"
  @rm -rf '{{TARGET_DIR}}'
  @rm -rf '{{RUN_DIR}}'
  @rm -rf '{{JS_BUILD_DIR}}'
  @echo "Directories cleaned"

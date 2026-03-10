# Directories
RUN_DIR:=absolute_path("./run")
TARGET_DIR:=absolute_path("./backend/target")
JS_BUILD_DIR:=absolute_path("./backend/src/main/resources/static/js/bundle")

# Run Files
PID_FILE:=absolute_path("./run/pid")
LOG_FILE:=absolute_path("./run/servlet.log")

# OS that can be used for development
UNIX:="unix"
WIN:="win"

# Frontend build scripts
ESBUILD_SCRIPT:=absolute_path("./frontend/build/build.mjs")
ESWATCH_SCRIPT:=absolute_path("./frontend/build/watch.mjs")
LINT_FRONTEND:="cd frontend && npx eslint ."

# Spring and backend build scripts/goals
SPRING_RUN:="cd backend && ./mvnw spring-boot:run"
SPRING_RUN_WIN:="cd backend && ./mvnw.cmd spring-boot:run"
WATCH_BACKEND:="cd backend && watchexec -r --postpone -d 1000 -e html,js,css './mvnw resources:resources'"
FORMAT_BACKEND:="cd backend && ./mvnw spotless:apply"
LINT_BACKEND:="cd backend && ./mvnw spotbugs:check"
DEBUG_SUFFIX_BACKEND:="-Dspring-boot.run.jvmArguments=-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=*:5005"

# Frontend build constants
PROD_FRONTEND_MODE:= "production"
DEV_FRONTEND_MODE:= "development"

run os=UNIX: stop (frontend-build "production")
  @echo "Starting running spring boot"
  @if [ {{os}} = {{UNIX}} ]; then \
    {{SPRING_RUN}} >> '{{LOG_FILE}}' 2>&1 & echo $! >> '{{PID_FILE}}'; \
  elif [ {{os}} = {{WIN}} ]; then \
    {{SPRING_RUN_WIN}} >> '{{LOG_FILE}}' 2>&1 & echo $! >> '{{PID_FILE}}'; \
  else \
    echo "Operating system invalid!"; \
  fi
  @echo "Processes started. PIDs saved in {{PID_FILE}}."

run-dev os=UNIX: stop (frontend-build "development")
  @echo "Starting running spring boot and watching file changes"
  @if [ {{os}} = {{UNIX}} ]; then \
    {{SPRING_RUN}} >> '{{LOG_FILE}}' 2>&1 & echo $! >> '{{PID_FILE}}'; \
  elif [ {{os}} = {{WIN}} ]; then \
    {{SPRING_RUN_WIN}} >> '{{LOG_FILE}}' 2>&1 & echo $! >> '{{PID_FILE}}'; \
  else \
    echo "Operating system invalid!"; \
  fi
  @{{WATCH_BACKEND}} >> '{{LOG_FILE}}' 2>&1 & echo $! >> '{{PID_FILE}}'
  @echo "Processes started. PIDs saved in {{PID_FILE}}."

debug os=UNIX: stop (frontend-build "production")
  @echo "Starting running spring boot and listening for debugger on port 5005"
  @if [ {{os}} = {{UNIX}} ]; then \
    {{SPRING_RUN}} {{DEBUG_SUFFIX_BACKEND}} >> '{{LOG_FILE}}' 2>&1 & echo $! >> '{{PID_FILE}}'; \
  elif [ {{os}} = {{WIN}} ]; then \
    {{SPRING_RUN_WIN}} {{DEBUG_SUFFIX_BACKEND}} >> '{{LOG_FILE}}' 2>&1 & echo $! >> '{{PID_FILE}}'; \
  else \
    echo "Operating system invalid!"; \
  fi
  @echo "Processes started. PIDs saved in {{PID_FILE}}."


stop: validate-directories
  @if [ -f '{{PID_FILE}}' ]; then \
    echo "Stopping processes..."; \
    cat '{{PID_FILE}}' | xargs kill; \
    rm '{{PID_FILE}}'; \
    echo "Processes stopped."; \
  else \
    echo "No PID file found. Nothing to stop."; \
  fi \

frontend-build dev_mode=PROD_FRONTEND_MODE: validate-directories
  @echo "Compiling frontend"
  @if [ {{dev_mode}} = {{DEV_FRONTEND_MODE}} ]; then \
    echo "Compiling in dev mode and running watch script"; \
    cd frontend/build && node '{{ESBUILD_SCRIPT}}' {{DEV_FRONTEND_MODE}}; \
    node '{{ESWATCH_SCRIPT}}' {{DEV_FRONTEND_MODE}} >> '{{LOG_FILE}}' 2>&1 & echo $! >> '{{PID_FILE}}'; \
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

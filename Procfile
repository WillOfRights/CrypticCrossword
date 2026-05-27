spring_boot: cd backend && ./mvnw spring-boot:run
spring_boot_debug: cd backend && ./mvnw spring-boot:run -Dspring-boot.run.jvmArguments=-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=*:5005
watch_resources: cd backend && watchexec -w src/main/resources/static/js/bundle --postpone -d 1s -e mustache,js,css './mvnw resources:resources'
watch_backend_src: cd backend && watchexec -w src/main/kotlin --postpone -d 1s -e kt './mvnw compile'
watch_frontend: cd frontend/build && node watch.mjs development

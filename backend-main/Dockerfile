FROM openjdk:21-jdk-slim as builder

WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Download dependencies
RUN ./gradlew dependencies --no-daemon

# Copy source code
COPY src src

# Build application
RUN ./gradlew build --no-daemon -x test

FROM openjdk:21-jre-slim

WORKDIR /app

# Create non-root user
RUN groupadd -r spring && useradd -r -g spring spring

# Copy the built jar
COPY --from=builder /app/build/libs/*.jar app.jar

# Change ownership
RUN chown spring:spring app.jar

USER spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
#!/bin/bash

# ============================================
# KB 무드 금융 다이어리 로컬 개발 환경 시작 스크립트
# ============================================

set -e

echo "🚀 KB 무드 금융 다이어리 로컬 개발 환경 시작..."

# 환경변수 파일 확인 (.env 우선)
if [ -f .env ]; then
    echo "✅ .env 파일 사용"
    export $(cat .env | grep -v '^#' | grep -v '^$' | grep -E '^[A-Za-z_][A-Za-z0-9_]*=' | xargs)
elif [ -f .env.local ]; then
    echo "✅ .env.local 파일 사용 (대체)"
    export $(cat .env.local | grep -v '^#' | grep -v '^$' | grep -E '^[A-Za-z_][A-Za-z0-9_]*=' | xargs)
else
    echo "❌ 환경변수 파일이 없습니다."
    echo "📝 다음 명령어로 .env 파일을 생성해주세요:"
    echo "   cp .env.example .env"
    echo "   nano .env"
    exit 1
fi

echo "✅ 환경변수 로드 완료"

# 필수 환경변수 확인
required_vars=(
    "DB_PASSWORD"
    "JWT_SECRET"
    "OAUTH2_GOOGLE_CLIENT_ID"
    "OAUTH2_GOOGLE_CLIENT_SECRET"
    "OAUTH2_KAKAO_CLIENT_ID"
    "OAUTH2_KAKAO_CLIENT_SECRET"
)

echo "🔍 필수 환경변수 확인 중..."
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] || [ "${!var}" = "your_"* ]; then
        echo "❌ 환경변수 $var가 설정되지 않았거나 기본값입니다."
        echo "   .env 파일에서 실제 값으로 변경해주세요."
        exit 1
    fi
done

echo "✅ 필수 환경변수 확인 완료"

# JWT Secret 길이 확인
if [ ${#JWT_SECRET} -lt 32 ]; then
    echo "❌ JWT_SECRET은 최소 32자 이상이어야 합니다. (현재: ${#JWT_SECRET}자)"
    exit 1
fi

echo "✅ JWT Secret 길이 확인 완료"

# Docker 서비스 시작 (MariaDB, Redis)
echo "🐳 Docker 서비스 시작 중..."
if ! docker-compose ps | grep -q "mariadb.*Up"; then
    echo "   MariaDB 시작 중..."
    docker-compose up -d mariadb
fi

if ! docker-compose ps | grep -q "redis.*Up"; then
    echo "   Redis 시작 중..."
    docker-compose up -d redis
fi

# 서비스 헬스체크
echo "🏥 서비스 헬스체크 중..."
sleep 5

# MariaDB 연결 확인
echo "   MariaDB 연결 확인 중..."
for i in {1..10}; do
    if docker-compose exec -T mariadb mysql -u${DB_USER} -p${DB_PASSWORD} -e "SELECT 1" > /dev/null 2>&1; then
        echo "   ✅ MariaDB 연결 성공"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "   ❌ MariaDB 연결 실패"
        exit 1
    fi
    echo "   ⏳ MariaDB 연결 대기 중... ($i/10)"
    sleep 2
done

# Redis 연결 확인
echo "   Redis 연결 확인 중..."
if [ -n "$REDIS_PASSWORD" ]; then
    redis_cmd="redis-cli -h localhost -p ${REDIS_PORT} -a ${REDIS_PASSWORD} ping"
else
    redis_cmd="redis-cli -h localhost -p ${REDIS_PORT} ping"
fi

if docker-compose exec -T redis $redis_cmd > /dev/null 2>&1; then
    echo "   ✅ Redis 연결 성공"
else
    echo "   ❌ Redis 연결 실패"
    exit 1
fi

echo "✅ 모든 서비스 헬스체크 완료"

# Spring Boot 애플리케이션 시작
echo "🌱 Spring Boot 애플리케이션 시작 중..."
cd backend-main

# Gradle wrapper 실행 권한 확인
if [ ! -x ./gradlew ]; then
    chmod +x ./gradlew
fi

# 애플리케이션 시작
echo "   포트 ${SERVER_PORT}에서 백엔드 서버 시작..."
./gradlew bootRun --args='--spring.profiles.active=dev'

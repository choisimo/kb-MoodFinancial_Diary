#!/bin/bash

# ============================================
# 환경변수 설정 확인 스크립트
# ============================================

set -e

echo "🔍 환경변수 설정 확인 중..."

# 환경변수 파일 확인 (.env 우선)
if [ -f .env ]; then
    echo "✅ .env 파일 존재"
    export $(cat .env | grep -v '^#' | grep -v '^$' | grep -E '^[A-Za-z_][A-Za-z0-9_]*=' | xargs)
elif [ -f .env.local ]; then
    echo "✅ .env.local 파일 사용 (대체)"
    export $(cat .env.local | grep -v '^#' | grep -v '^$' | grep -E '^[A-Za-z_][A-Za-z0-9_]*=' | xargs)
else
    echo "❌ 환경변수 파일이 없습니다."
    echo "📝 .env.example을 복사하여 .env 파일을 생성하세요:"
    echo "   cp .env.example .env"
    exit 1
fi

# 필수 환경변수 목록
required_vars=(
    "ENV:환경 설정"
    "SPRING_PROFILES_ACTIVE:Spring 프로파일"
    "DB_HOST:데이터베이스 호스트"
    "DB_PORT:데이터베이스 포트"
    "DB_NAME:데이터베이스 이름"
    "DB_USER:데이터베이스 사용자"
    "DB_PASSWORD:데이터베이스 패스워드"
    "REDIS_HOST:Redis 호스트"
    "REDIS_PORT:Redis 포트"
    "REDIS_PASSWORD:Redis 패스워드"
    "JWT_SECRET:JWT 시크릿"
    "OAUTH2_GOOGLE_CLIENT_ID:Google OAuth 클라이언트 ID"
    "OAUTH2_GOOGLE_CLIENT_SECRET:Google OAuth 클라이언트 시크릿"
    "OAUTH2_KAKAO_CLIENT_ID:Kakao OAuth 클라이언트 ID"
    "OAUTH2_KAKAO_CLIENT_SECRET:Kakao OAuth 클라이언트 시크릿"
)

echo ""
echo "📋 필수 환경변수 확인:"
echo "================================"

all_good=true

for var_desc in "${required_vars[@]}"; do
    var_name=$(echo $var_desc | cut -d: -f1)
    var_description=$(echo $var_desc | cut -d: -f2)
    
    if [ -z "${!var_name}" ]; then
        echo "❌ $var_name ($var_description): 설정되지 않음"
        all_good=false
    elif [[ "${!var_name}" == your_* ]] || [[ "${!var_name}" == *_here ]]; then
        echo "⚠️  $var_name ($var_description): 기본값 (실제 값으로 변경 필요)"
        all_good=false
    else
        # 민감한 정보는 마스킹하여 표시
        if [[ $var_name == *"PASSWORD"* ]] || [[ $var_name == *"SECRET"* ]]; then
            masked_value=$(echo "${!var_name}" | sed 's/./*/g')
            echo "✅ $var_name ($var_description): $masked_value"
        else
            echo "✅ $var_name ($var_description): ${!var_name}"
        fi
    fi
done

echo ""
echo "🔐 보안 검사:"
echo "================================"

# JWT Secret 길이 확인
if [ -n "$JWT_SECRET" ] && [ ${#JWT_SECRET} -ge 32 ]; then
    echo "✅ JWT Secret 길이: ${#JWT_SECRET}자 (권장: 32자 이상)"
else
    echo "❌ JWT Secret 길이: ${#JWT_SECRET:-0}자 (최소 32자 필요)"
    all_good=false
fi

# OAuth 클라이언트 ID 형식 확인
if [[ $OAUTH2_GOOGLE_CLIENT_ID =~ ^[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$ ]]; then
    echo "✅ Google OAuth 클라이언트 ID 형식 올바름"
elif [[ $OAUTH2_GOOGLE_CLIENT_ID == your_* ]]; then
    echo "⚠️  Google OAuth 클라이언트 ID: 기본값 (실제 값으로 변경 필요)"
    all_good=false
else
    echo "❌ Google OAuth 클라이언트 ID 형식 확인 필요"
    all_good=false
fi

echo ""
echo "🌐 서비스 연결 확인:"
echo "================================"

# 데이터베이스 연결 확인
if command -v mysql &> /dev/null; then
    if mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USER} -p${DB_PASSWORD} -e "SELECT 1" &> /dev/null; then
        echo "✅ MariaDB 연결 성공"
    else
        echo "❌ MariaDB 연결 실패 (서비스가 실행 중인지 확인하세요)"
    fi
else
    echo "⚠️  MySQL 클라이언트가 설치되지 않아 DB 연결을 확인할 수 없습니다"
fi

# Redis 연결 확인
if command -v redis-cli &> /dev/null; then
    if [ -n "$REDIS_PASSWORD" ]; then
        if redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a ${REDIS_PASSWORD} ping &> /dev/null; then
            echo "✅ Redis 연결 성공"
        else
            echo "❌ Redis 연결 실패 (서비스가 실행 중인지 확인하세요)"
        fi
    else
        if redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} ping &> /dev/null; then
            echo "✅ Redis 연결 성공"
        else
            echo "❌ Redis 연결 실패 (서비스가 실행 중인지 확인하세요)"
        fi
    fi
else
    echo "⚠️  Redis CLI가 설치되지 않아 Redis 연결을 확인할 수 없습니다"
fi

echo ""
echo "📊 결과 요약:"
echo "================================"

if [ "$all_good" = true ]; then
    echo "🎉 모든 환경변수가 올바르게 설정되었습니다!"
    echo "   다음 명령어로 애플리케이션을 시작할 수 있습니다:"
    echo "   ./start-local.sh"
    exit 0
else
    echo "❌ 일부 환경변수에 문제가 있습니다."
    echo "   .env 파일을 확인하고 수정해주세요."
    exit 1
fi

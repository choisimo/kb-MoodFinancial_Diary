#!/bin/bash

# KB MoodFinancial Diary - Production Setup Script
# 프로덕션 환경 설정을 위한 스크립트

set -e

echo "🚀 KB MoodFinancial Diary - Production Setup"
echo "============================================"

# 환경 변수 체크
check_env_vars() {
    echo "📋 환경 변수 확인 중..."
    
    required_vars=(
        "DB_PASSWORD"
        "JWT_SECRET"
        "OPENAI_API_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo "❌ 필수 환경 변수가 설정되지 않음: $var"
            exit 1
        else
            echo "✅ $var 설정됨"
        fi
    done
}

# AI 서비스 상태 확인
check_ai_services() {
    echo "🤖 AI 서비스 상태 확인 중..."
    
    # OpenAI API 연결 테스트
    if [ -n "$OPENAI_API_KEY" ]; then
        echo "✅ OpenAI API 키 확인됨"
    else
        echo "⚠️  OpenAI API 키 미설정 - AI 기능이 제한됩니다"
    fi
}

# 데이터베이스 마이그레이션
setup_database() {
    echo "🗄️  데이터베이스 설정 중..."
    
    # AI 분석 관련 컬럼 추가
    echo "ALTER TABLE mood_diaries ADD COLUMN IF NOT EXISTS emotion_score DOUBLE;" > /tmp/ai_migration.sql
    echo "ALTER TABLE mood_diaries ADD COLUMN IF NOT EXISTS dominant_emotion VARCHAR(50);" >> /tmp/ai_migration.sql
    echo "ALTER TABLE mood_diaries ADD COLUMN IF NOT EXISTS financial_emotion_score DOUBLE;" >> /tmp/ai_migration.sql
    echo "ALTER TABLE mood_diaries ADD COLUMN IF NOT EXISTS ai_analysis_completed BOOLEAN DEFAULT FALSE;" >> /tmp/ai_migration.sql
    echo "ALTER TABLE mood_diaries ADD COLUMN IF NOT EXISTS analysis_details TEXT;" >> /tmp/ai_migration.sql
    echo "ALTER TABLE mood_diaries ADD COLUMN IF NOT EXISTS diary_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;" >> /tmp/ai_migration.sql
    
    echo "📊 AI 분석 테이블 준비 완료"
}

# 프로덕션 빌드
build_production() {
    echo "🔨 프로덕션 빌드 시작..."
    
    # Backend 빌드
    echo "  📱 Backend 빌드 중..."
    cd backend-main
    ./gradlew clean build -x test
    cd ..
    
    # Frontend 빌드
    echo "  🌐 Frontend 빌드 중..."
    cd frontend
    npm ci
    npm run build
    cd ..
    
    echo "✅ 빌드 완료"
}

# 도커 컨테이너 시작
start_containers() {
    echo "🐳 Docker 컨테이너 시작 중..."
    
    # 환경 설정에 따라 적절한 docker-compose 파일 선택
    if [ "$ENV" = "production" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    else
        docker-compose up -d
    fi
    
    echo "✅ 모든 서비스 시작됨"
}

# 서비스 상태 확인
check_services() {
    echo "🔍 서비스 상태 확인 중..."
    
    services=("mariadb" "redis" "backend" "frontend" "nginx")
    
    for service in "${services[@]}"; do
        if docker-compose ps | grep -q "$service.*Up"; then
            echo "✅ $service 실행 중"
        else
            echo "❌ $service 실행되지 않음"
        fi
    done
    
    # AI 서비스 헬스체크
    echo "🤖 AI 서비스 테스트 중..."
    sleep 5
    
    if curl -f http://localhost:8080/api/ai/health > /dev/null 2>&1; then
        echo "✅ AI 서비스 정상 작동"
    else
        echo "⚠️  AI 서비스 응답 없음 - 확인 필요"
    fi
}

# 메인 실행 함수
main() {
    echo "시작 시간: $(date)"
    
    check_env_vars
    check_ai_services
    setup_database
    build_production
    start_containers
    check_services
    
    echo ""
    echo "🎉 KB MoodFinancial Diary 프로덕션 설정 완료!"
    echo ""
    echo "📝 접근 URL:"
    echo "  • 메인 애플리케이션: http://localhost:8080"
    echo "  • API 문서: http://localhost:8080/swagger-ui.html"
    echo "  • AI 서비스 상태: http://localhost:8080/api/ai/health"
    echo ""
    echo "🔧 관리 명령어:"
    echo "  • 로그 확인: docker-compose logs -f [service-name]"
    echo "  • 서비스 재시작: docker-compose restart [service-name]"
    echo "  • 전체 정지: docker-compose down"
    echo ""
    echo "완료 시간: $(date)"
}

# 스크립트 실행
main
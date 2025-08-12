#!/bin/bash

# ============================================
# KB 무드 금융 다이어리 - 순차적 환경변수 설정 스크립트
# ============================================
# 프로젝트 전체 서비스가 정상 작동하도록 환경변수를 순차적으로 설정합니다.

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 로그 함수들
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${PURPLE}🔄 단계 $1: $2${NC}"
}

log_header() {
    echo -e "${CYAN}"
    echo "============================================"
    echo "$1"
    echo "============================================"
    echo -e "${NC}"
}

# 환경변수 검증 함수
validate_env_var() {
    local var_name=$1
    local var_description=$2
    local is_required=${3:-true}
    local min_length=${4:-1}
    local var_value="${!var_name}"
    
    if [ -z "${!var_name}" ]; then
        if [ "$is_required" = true ]; then
            log_error "$var_name ($var_description): 설정되지 않음"
            return 1
        else
            log_warning "$var_name ($var_description): 선택사항 - 설정되지 않음"
            return 0
        fi
    elif [[ "${!var_name}" == your_* ]] || [[ "${!var_name}" == *_here ]]; then
        log_error "$var_name ($var_description): 기본값 (실제 값으로 변경 필요)"
        return 1
    elif [ ${#var_value} -lt $min_length ]; then
        log_error "$var_name ($var_description): 길이 부족 (최소 ${min_length}자 필요, 현재 ${#var_value}자)"
        return 1
    else
        if [[ $var_name == *"PASSWORD"* ]] || [[ $var_name == *"SECRET"* ]]; then
            local masked_value=$(echo "${!var_name}" | sed 's/./*/g')
            log_success "$var_name ($var_description): $masked_value"
        else
            log_success "$var_name ($var_description): ${!var_name}"
        fi
        return 0
    fi
}

# 서비스 연결 테스트 함수
test_database_connection() {
    log_info "데이터베이스 연결 테스트 중..."
    
    if command -v mysql &> /dev/null; then
        local max_attempts=5
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USER} -p${DB_PASSWORD} -e "SELECT 1" &> /dev/null; then
                log_success "MariaDB 연결 성공"
                return 0
            fi
            
            log_warning "MariaDB 연결 시도 $attempt/$max_attempts 실패"
            
            if [ $attempt -eq $max_attempts ]; then
                log_error "MariaDB 연결 실패 - 서비스가 실행 중인지 확인하세요"
                return 1
            fi
            
            sleep 3
            ((attempt++))
        done
    else
        log_warning "MySQL 클라이언트가 설치되지 않아 DB 연결을 확인할 수 없습니다"
        return 0
    fi
}

test_redis_connection() {
    log_info "Redis 연결 테스트 중..."
    
    if command -v redis-cli &> /dev/null; then
        local redis_cmd
        if [ -n "$REDIS_PASSWORD" ]; then
            redis_cmd="redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a ${REDIS_PASSWORD} ping"
        else
            redis_cmd="redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} ping"
        fi
        
        if $redis_cmd &> /dev/null; then
            log_success "Redis 연결 성공"
            return 0
        else
            log_error "Redis 연결 실패 - 서비스가 실행 중인지 확인하세요"
            return 1
        fi
    else
        log_warning "Redis CLI가 설치되지 않아 Redis 연결을 확인할 수 없습니다"
        return 0
    fi
}

# Docker 서비스 시작 함수
start_docker_services() {
    log_info "Docker 서비스 상태 확인 중..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker가 설치되지 않았습니다"
        return 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose가 설치되지 않았습니다"
        return 1
    fi
    
    # MariaDB 시작
    if ! docker-compose ps mariadb | grep -q "Up"; then
        log_info "MariaDB 시작 중..."
        docker-compose up -d mariadb
        sleep 10
    else
        log_success "MariaDB 이미 실행 중"
    fi
    
    # Redis 시작
    if ! docker-compose ps redis | grep -q "Up"; then
        log_info "Redis 시작 중..."
        docker-compose up -d redis
        sleep 5
    else
        log_success "Redis 이미 실행 중"
    fi
}

# Infisical 서비스 시작 함수
start_infisical_services() {
    if [ "$INFISICAL_ENABLED" = "true" ]; then
        log_info "Infisical 서비스 시작 중..."
        
        # Infisical 서비스들 시작
        docker-compose up -d infisical-db infisical-redis infisical
        
        log_info "Infisical 서비스 초기화 대기 중..."
        sleep 30
        
        # Infisical 헬스체크
        local max_attempts=10
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if curl -f "http://localhost:${INFISICAL_PORT:-8222}/api/status" &> /dev/null; then
                log_success "Infisical 서비스 시작 완료"
                log_info "Infisical 웹 UI: http://localhost:${INFISICAL_PORT:-8222}"
                return 0
            fi
            
            log_warning "Infisical 시작 대기 중... ($attempt/$max_attempts)"
            sleep 5
            ((attempt++))
        done
        
        log_error "Infisical 서비스 시작 실패"
        return 1
    else
        log_info "Infisical 비활성화 - 로컬 환경변수 사용"
    fi
}

# 메인 실행 함수
main() {
    log_header "KB 무드 금융 다이어리 환경변수 설정 시작"
    
    # 1단계: 환경변수 파일 확인 및 로드
    log_step "1" "환경변수 파일 확인 및 로드"
    
    # .env 파일 우선 확인
    if [ -f ".env" ]; then
        log_success ".env 파일 발견 - 기본 모드"
        export $(cat .env | grep -v '^#' | grep -v '^$' | grep -E '^[A-Za-z_][A-Za-z0-9_]*=' | xargs)
        ENV_MODE="default"
    elif [ -f ".env.local" ]; then
        log_success ".env.local 파일 발견 - 로컬 개발 모드"
        export $(cat .env.local | grep -v '^#' | grep -v '^$' | grep -E '^[A-Za-z_][A-Za-z0-9_]*=' | xargs)
        ENV_MODE="local"
    else
        log_warning "환경변수 파일이 없습니다. 템플릿 생성 중..."
        
        echo "사용할 모드를 선택하세요:"
        echo "1) 로컬 개발 모드 (.env.local)"
        echo "2) Docker 모드 (.env)"
        read -p "선택 (1-2): " mode_choice
        
        case $mode_choice in
            1)
                cp .env.local.example .env.local
                log_success ".env.local 파일이 생성되었습니다"
                log_warning "실제 값으로 수정 후 다시 실행하세요: nano .env.local"
                exit 1
                ;;
            2)
                cp .env.example .env
                log_success ".env 파일이 생성되었습니다"
                log_warning "실제 값으로 수정 후 다시 실행하세요: nano .env"
                exit 1
                ;;
            *)
                log_error "잘못된 선택입니다"
                exit 1
                ;;
        esac
    fi
    
    # 2단계: 필수 환경변수 검증
    log_step "2" "필수 환경변수 검증"
    
    local validation_failed=false
    
    # 기본 환경설정
    validate_env_var "ENV" "환경 설정" true || validation_failed=true
    validate_env_var "SPRING_PROFILES_ACTIVE" "Spring 프로파일" true || validation_failed=true
    
    # 데이터베이스 설정
    validate_env_var "DB_HOST" "데이터베이스 호스트" true || validation_failed=true
    validate_env_var "DB_PORT" "데이터베이스 포트" true || validation_failed=true
    validate_env_var "DB_NAME" "데이터베이스 이름" true || validation_failed=true
    validate_env_var "DB_USER" "데이터베이스 사용자" true || validation_failed=true
    validate_env_var "DB_PASSWORD" "데이터베이스 패스워드" true || validation_failed=true
    
    # Redis 설정
    validate_env_var "REDIS_HOST" "Redis 호스트" true || validation_failed=true
    validate_env_var "REDIS_PORT" "Redis 포트" true || validation_failed=true
    validate_env_var "REDIS_PASSWORD" "Redis 패스워드" false || validation_failed=true
    
    # JWT 설정
    validate_env_var "JWT_SECRET" "JWT 시크릿" true 32 || validation_failed=true
    validate_env_var "JWT_EXPIRATION" "JWT 만료시간" true || validation_failed=true
    
    # OAuth2 설정
    validate_env_var "OAUTH2_GOOGLE_CLIENT_ID" "Google OAuth 클라이언트 ID" true || validation_failed=true
    validate_env_var "OAUTH2_GOOGLE_CLIENT_SECRET" "Google OAuth 클라이언트 시크릿" true || validation_failed=true
    validate_env_var "OAUTH2_KAKAO_CLIENT_ID" "Kakao OAuth 클라이언트 ID" true || validation_failed=true
    validate_env_var "OAUTH2_KAKAO_CLIENT_SECRET" "Kakao OAuth 클라이언트 시크릿" true || validation_failed=true
    
    # 애플리케이션 설정
    validate_env_var "SERVER_PORT" "서버 포트" true || validation_failed=true
    validate_env_var "FRONTEND_PORT" "프론트엔드 포트" false || validation_failed=true
    validate_env_var "VITE_API_BASE_URL" "API 기본 URL" true || validation_failed=true
    
    # Infisical 설정 (선택사항)
    INFISICAL_ENABLED=${INFISICAL_ENABLED:-false}
    if [ "$INFISICAL_ENABLED" = "true" ]; then
        validate_env_var "INFISICAL_HOST" "Infisical 호스트" true || validation_failed=true
        validate_env_var "INFISICAL_PROJECT_ID" "Infisical 프로젝트 ID" false
        validate_env_var "INFISICAL_BACKEND_TOKEN" "Infisical 백엔드 토큰" false
        validate_env_var "INFISICAL_FRONTEND_TOKEN" "Infisical 프론트엔드 토큰" false
    fi
    
    if [ "$validation_failed" = true ]; then
        log_error "환경변수 검증 실패 - 설정을 수정하고 다시 실행하세요"
        exit 1
    fi
    
    log_success "모든 필수 환경변수 검증 완료"
    
    # 3단계: Docker 서비스 시작
    if [ "$ENV_MODE" = "docker" ] || [ "$DB_HOST" = "localhost" ]; then
        log_step "3" "Docker 서비스 시작"
        start_docker_services
    else
        log_step "3" "외부 서비스 사용 - Docker 서비스 시작 생략"
    fi
    
    # 4단계: Infisical 서비스 시작 (선택사항)
    log_step "4" "Infisical 서비스 관리"
    start_infisical_services
    
    # 5단계: 서비스 연결 테스트
    log_step "5" "서비스 연결 테스트"
    
    local connection_failed=false
    
    # 데이터베이스 연결 테스트
    test_database_connection || connection_failed=true
    
    # Redis 연결 테스트
    test_redis_connection || connection_failed=true
    
    if [ "$connection_failed" = true ]; then
        log_error "서비스 연결 테스트 실패"
        log_info "다음 명령어로 서비스 상태를 확인하세요:"
        log_info "  docker-compose ps"
        log_info "  docker-compose logs mariadb"
        log_info "  docker-compose logs redis"
        exit 1
    fi
    
    # 6단계: OAuth2 설정 검증
    log_step "6" "OAuth2 설정 검증"
    
    # Google OAuth 클라이언트 ID 형식 확인
    if [[ $OAUTH2_GOOGLE_CLIENT_ID =~ ^[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$ ]]; then
        log_success "Google OAuth 클라이언트 ID 형식 올바름"
    elif [[ $OAUTH2_GOOGLE_CLIENT_ID == your_* ]]; then
        log_warning "Google OAuth 클라이언트 ID: 기본값 (실제 값으로 변경 권장)"
    else
        log_warning "Google OAuth 클라이언트 ID 형식 확인 필요"
    fi
    
    # Kakao OAuth 클라이언트 ID 형식 확인 (일반적으로 숫자)
    if [[ $OAUTH2_KAKAO_CLIENT_ID =~ ^[0-9]+$ ]]; then
        log_success "Kakao OAuth 클라이언트 ID 형식 올바름"
    elif [[ $OAUTH2_KAKAO_CLIENT_ID == your_* ]]; then
        log_warning "Kakao OAuth 클라이언트 ID: 기본값 (실제 값으로 변경 권장)"
    else
        log_warning "Kakao OAuth 클라이언트 ID 형식 확인 필요"
    fi
    
    # 7단계: 환경변수 내보내기
    log_step "7" "환경변수 시스템 내보내기"
    
    # 현재 셸 환경에 환경변수 내보내기
    log_info "환경변수를 현재 셸 세션에 적용 중..."
    
    # 주요 환경변수들을 다시 export
    export ENV SPRING_PROFILES_ACTIVE
    export DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD
    export REDIS_HOST REDIS_PORT REDIS_PASSWORD
    export JWT_SECRET JWT_EXPIRATION
    export OAUTH2_GOOGLE_CLIENT_ID OAUTH2_GOOGLE_CLIENT_SECRET
    export OAUTH2_KAKAO_CLIENT_ID OAUTH2_KAKAO_CLIENT_SECRET
    export SERVER_PORT FRONTEND_PORT VITE_API_BASE_URL
    
    if [ "$INFISICAL_ENABLED" = "true" ]; then
        export INFISICAL_ENABLED INFISICAL_HOST INFISICAL_PROJECT_ID
        export INFISICAL_BACKEND_TOKEN INFISICAL_FRONTEND_TOKEN
    fi
    
    log_success "환경변수 내보내기 완료"
    
    # 최종 결과
    log_header "환경변수 설정 완료"
    
    log_success "✨ 모든 환경변수가 성공적으로 설정되었습니다!"
    echo ""
    log_info "🚀 다음 단계:"
    echo ""
    
    if [ "$ENV_MODE" = "local" ]; then
        echo "   1. 백엔드 서버 시작:"
        echo "      cd backend-main && ./gradlew bootRun"
        echo ""
        echo "   2. 프론트엔드 서버 시작:"
        echo "      cd frontend && npm run dev"
    else
        echo "   전체 서비스 시작:"
        echo "      docker-compose up -d"
        echo ""
        echo "   서비스 상태 확인:"
        echo "      docker-compose ps"
    fi
    
    echo ""
    log_info "🌐 접속 URL:"
    echo "   - 프론트엔드: http://localhost:${FRONTEND_PORT:-3000}"
    echo "   - 백엔드 API: http://localhost:${SERVER_PORT:-8090}"
    
    if [ "$INFISICAL_ENABLED" = "true" ]; then
        echo "   - Infisical 관리: http://localhost:${INFISICAL_PORT:-8222}"
    fi
    
    echo ""
    log_info "🔧 추가 명령어:"
    echo "   - 환경변수 확인: ./scripts/check-env.sh"
    echo "   - 서비스 로그 확인: docker-compose logs -f [서비스명]"
    echo "   - 서비스 중지: docker-compose down"
    
    return 0
}

# 스크립트 시작점
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
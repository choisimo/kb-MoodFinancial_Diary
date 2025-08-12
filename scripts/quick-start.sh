#!/bin/bash

# ============================================
# KB 무드 금융 다이어리 - 빠른 시작 스크립트
# ============================================
# 환경설정부터 서비스 시작까지 원클릭으로 실행

set -e

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

# 메인 메뉴 함수
show_menu() {
    echo -e "${GREEN}"
    echo "============================================"
    echo "    KB 무드 금융 다이어리 - 빠른 시작"
    echo "============================================"
    echo -e "${NC}"
    echo "1) 🔧 환경변수 설정 및 검증"
    echo "2) 🐳 Docker 서비스 시작"
    echo "3) 🚀 전체 애플리케이션 시작"
    echo "4) 🏥 서비스 상태 확인"
    echo "5) 📋 환경변수 확인"
    echo "6) 🛑 모든 서비스 중지"
    echo "7) 📚 로그 확인"
    echo "8) 🧹 환경 초기화"
    echo "0) 종료"
    echo ""
}

# 환경변수 설정 함수
setup_environment() {
    log_step "환경변수 설정 시작..."
    
    if [ -f "./setup-environment.sh" ]; then
        ./setup-environment.sh
    else
        log_warning "setup-environment.sh 파일을 찾을 수 없습니다"
        return 1
    fi
}

# Docker 서비스 시작 함수
start_docker_services() {
    log_step "Docker 서비스 시작..."
    
    # 필수 서비스만 시작 (DB, Redis)
    docker-compose up -d mariadb redis
    
    log_info "서비스 초기화 대기 중..."
    sleep 10
    
    # 상태 확인
    docker-compose ps mariadb redis
    log_success "Docker 서비스 시작 완료"
}

# 전체 애플리케이션 시작 함수
start_full_application() {
    log_step "전체 애플리케이션 시작..."
    
    # 환경변수 설정
    if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
        log_warning "환경변수 파일이 없습니다. 먼저 환경변수를 설정하세요."
        setup_environment
    fi
    
    # 전체 서비스 시작
    docker-compose up -d
    
    log_info "서비스 초기화 대기 중..."
    sleep 30
    
    # 상태 확인
    docker-compose ps
    
    log_success "전체 애플리케이션 시작 완료"
    log_info "접속 URL:"
    echo "  - 프론트엔드: http://localhost:3000"
    echo "  - 백엔드 API: http://localhost:8090"
    echo "  - Infisical: http://localhost:8222"
}

# 서비스 상태 확인 함수
check_service_status() {
    log_step "서비스 상태 확인 중..."
    
    echo ""
    echo "📊 Docker 컨테이너 상태:"
    docker-compose ps
    
    echo ""
    echo "🌐 서비스 헬스체크:"
    
    # 백엔드 헬스체크
    if curl -f http://localhost:8090/actuator/health &> /dev/null; then
        log_success "백엔드 서비스: 정상"
    else
        log_warning "백엔드 서비스: 응답 없음"
    fi
    
    # 프론트엔드 헬스체크
    if curl -f http://localhost:3000 &> /dev/null; then
        log_success "프론트엔드 서비스: 정상"
    else
        log_warning "프론트엔드 서비스: 응답 없음"
    fi
    
    # Infisical 헬스체크
    if curl -f http://localhost:8222/api/status &> /dev/null; then
        log_success "Infisical 서비스: 정상"
    else
        log_warning "Infisical 서비스: 응답 없음"
    fi
    
    # 데이터베이스 헬스체크
    if docker-compose exec -T mariadb mysqladmin ping &> /dev/null; then
        log_success "MariaDB: 정상"
    else
        log_warning "MariaDB: 응답 없음"
    fi
    
    # Redis 헬스체크
    if docker-compose exec -T redis redis-cli ping &> /dev/null; then
        log_success "Redis: 정상"
    else
        log_warning "Redis: 응답 없음"
    fi
}

# 환경변수 확인 함수
check_environment() {
    log_step "환경변수 확인..."
    
    if [ -f "./scripts/check-env.sh" ]; then
        ./scripts/check-env.sh
    else
        log_warning "check-env.sh 파일을 찾을 수 없습니다"
    fi
}

# 모든 서비스 중지 함수
stop_all_services() {
    log_step "모든 서비스 중지 중..."
    
    docker-compose down
    
    log_success "모든 서비스가 중지되었습니다"
}

# 로그 확인 함수
check_logs() {
    echo "확인할 서비스를 선택하세요:"
    echo "1) backend"
    echo "2) frontend" 
    echo "3) mariadb"
    echo "4) redis"
    echo "5) infisical"
    echo "6) 전체 로그"
    echo "0) 돌아가기"
    
    read -p "선택 (0-6): " log_choice
    
    case $log_choice in
        1) docker-compose logs -f backend ;;
        2) docker-compose logs -f frontend ;;
        3) docker-compose logs -f mariadb ;;
        4) docker-compose logs -f redis ;;
        5) docker-compose logs -f infisical ;;
        6) docker-compose logs -f ;;
        0) return ;;
        *) log_warning "잘못된 선택입니다" ;;
    esac
}

# 환경 초기화 함수
reset_environment() {
    log_warning "환경 초기화를 진행하시겠습니까?"
    log_warning "모든 Docker 컨테이너와 볼륨이 삭제됩니다!"
    read -p "계속하시겠습니까? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        log_step "환경 초기화 중..."
        
        # 모든 서비스 중지 및 삭제
        docker-compose down -v --remove-orphans
        
        # 이미지 제거 (선택)
        read -p "Docker 이미지도 삭제하시겠습니까? (y/N): " remove_images
        if [[ $remove_images =~ ^[Yy]$ ]]; then
            docker-compose down --rmi all
        fi
        
        # 환경변수 파일 백업 및 삭제 옵션
        read -p "환경변수 파일을 초기화하시겠습니까? (y/N): " reset_env
        if [[ $reset_env =~ ^[Yy]$ ]]; then
            if [ -f ".env.local" ]; then
                mv .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
                log_info ".env.local 파일을 백업했습니다"
            fi
            if [ -f ".env" ]; then
                mv .env .env.backup.$(date +%Y%m%d_%H%M%S)
                log_info ".env 파일을 백업했습니다"
            fi
        fi
        
        log_success "환경 초기화 완료"
    else
        log_info "환경 초기화를 취소했습니다"
    fi
}

# 메인 실행 루프
main() {
    while true; do
        show_menu
        read -p "선택하세요 (0-8): " choice
        
        case $choice in
            1)
                setup_environment
                ;;
            2)
                start_docker_services
                ;;
            3)
                start_full_application
                ;;
            4)
                check_service_status
                ;;
            5)
                check_environment
                ;;
            6)
                stop_all_services
                ;;
            7)
                check_logs
                ;;
            8)
                reset_environment
                ;;
            0)
                log_info "프로그램을 종료합니다"
                exit 0
                ;;
            *)
                log_warning "잘못된 선택입니다. 다시 선택해주세요."
                ;;
        esac
        
        echo ""
        read -p "계속하려면 Enter를 누르세요..."
        clear
    done
}

# 스크립트 시작
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    clear
    main "$@"
fi
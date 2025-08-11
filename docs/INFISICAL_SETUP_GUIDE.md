# KB 무드 금융 다이어리 - Infisical 환경변수 관리 완전 가이드

## 📋 현재 구현 상태

### ✅ 완전히 구현된 부분
- **백엔드 Infisical 통합**: `InfisicalConfig`, `InfisicalService`, `InfisicalPropertyConfiguration` 완료
- **프론트엔드 Infisical 클라이언트**: `infisical.ts`, `ConfigContext.tsx` 완료
- **Docker Compose 설정**: 모든 환경변수 Infisical 연동 준비 완료
- **통합 application.yml**: dev, docker, prod 프로파일 통합

### ⚠️ 제한사항
- **Infisical 자체 구동**: 초기 환경변수는 별도 관리 필요
- **빌드 타임 변수**: VITE_ 변수들은 빌드 시점에 번들에 포함됨
- **시스템 설정**: SPRING_PROFILES_ACTIVE, 포트 설정 등

## 🔧 단계별 설정 방법

### 1단계: Infisical 서버 구동

```bash
# 1. Infisical 서버용 환경변수 설정
cat > .env << 'EOF'
# Infisical 자체 구동을 위한 필수 환경변수
INFISICAL_ENCRYPTION_KEY=6c1fe4e407b8911c104518103505b218
INFISICAL_AUTH_SECRET=your-base64-encoded-auth-secret
INFISICAL_PROJECT_ID=your-project-id-here
INFISICAL_SERVICE_TOKEN=your-service-token-here
INFISICAL_SITE_URL=http://localhost:8222

# Docker Compose 기본 설정
DB_ROOT_PASSWORD=your-secure-root-password
SPRING_PROFILES_ACTIVE=docker
EOF

# 2. Infisical 서버 실행
cd infisical
docker-compose -f docker-compose.8222.yml up -d

# 3. 서버 시작 대기
sleep 15
echo "Infisical 서버가 http://localhost:8222 에서 실행 중입니다."
```

### 2단계: Infisical 웹 UI 설정

1. **브라우저에서 http://localhost:8222 접속**
2. **관리자 계정 생성**
3. **프로젝트 생성**: `kb-mood-diary`
4. **환경 설정**: `dev`, `staging`, `production`
5. **서비스 토큰 생성**: 각 환경별로 생성

### 3단계: 환경변수 등록

#### 보안 중요도 높음 (Secret 타입)
```bash
# 인증 관련
JWT_SECRET=kb-mood-diary-super-secure-jwt-secret-key-256-bits-long-2024
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-your-actual-google-oauth-client-secret
KAKAO_OAUTH_CLIENT_SECRET=your-actual-kakao-oauth-client-secret

# 데이터베이스
DATABASE_PASSWORD=kb_mood_diary_secure_password_2024!
DATABASE_USERNAME=kb_mood_user

# Redis
REDIS_PASSWORD=kb_redis_secure_password_2024!

# SMTP (Gmail App Password)
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-16-digit-app-password

# Infisical 서비스 토큰 (자체 참조용)
INFISICAL_SERVICE_TOKEN=your-actual-service-token
```

#### 보안 중요도 중간 (Config 타입)
```bash
# OAuth 클라이언트 ID
GOOGLE_OAUTH_CLIENT_ID=75762973181-your-actual-google-client-id.apps.googleusercontent.com
KAKAO_OAUTH_CLIENT_ID=your-actual-kakao-client-id

# 외부 API 키
VITE_KAKAO_MAP_KEY=your-actual-kakao-map-api-key
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key
VITE_PAYMENT_API_KEY=your-actual-payment-api-key
```

#### 설정값 (Config 타입)
```bash
# 데이터베이스 연결
DATABASE_URL=jdbc:mariadb://localhost:3306/kb_mood_diary?useUnicode=true&characterEncoding=utf8mb4&serverTimezone=Asia/Seoul
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kb_mood_diary
DB_USER=kb_mood_user

# Redis 연결
REDIS_HOST=localhost
REDIS_PORT=6379

# SMTP 설정
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# 애플리케이션 설정
FRONTEND_URL=http://localhost:8089
CORS_ALLOWED_ORIGINS=http://localhost:8089,http://localhost:3000,http://localhost:8087
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10MB

# 프론트엔드 설정
VITE_API_BASE_URL=http://localhost:8090
VITE_APP_TITLE=KB 감정 다이어리
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info

# Infisical 클라이언트 설정
VITE_INFISICAL_HOST=http://localhost:8222
VITE_INFISICAL_PROJECT_ID=your-project-id
VITE_INFISICAL_SERVICE_TOKEN=your-service-token
VITE_INFISICAL_ENVIRONMENT=dev
VITE_INFISICAL_ENABLED=true
```

### 4단계: 애플리케이션 실행

#### 개발 환경 (로컬)
```bash
# 환경변수 설정
export SPRING_PROFILES_ACTIVE=dev
export INFISICAL_ENABLED=true
export INFISICAL_PROJECT_ID=your-project-id
export INFISICAL_SERVICE_TOKEN=your-service-token
export INFISICAL_ENVIRONMENT=dev

# 백엔드 실행
cd backend-main
./gradlew bootRun

# 프론트엔드 실행 (새 터미널)
cd frontend
npm run dev
```

#### Docker 환경
```bash
# .env 파일 업데이트
echo "INFISICAL_ENABLED=true" >> .env
echo "INFISICAL_PROJECT_ID=your-project-id" >> .env
echo "INFISICAL_SERVICE_TOKEN=your-service-token" >> .env

# 전체 스택 실행
docker-compose up -d
```

## 📊 환경변수 관리 현황

### ✅ Infisical로 완전 관리 가능 (총 23개)

#### 보안 변수 (8개)
- JWT_SECRET
- DATABASE_PASSWORD, DATABASE_USERNAME
- REDIS_PASSWORD
- GOOGLE_OAUTH_CLIENT_SECRET, KAKAO_OAUTH_CLIENT_SECRET
- SMTP_USERNAME, SMTP_PASSWORD

#### 설정 변수 (15개)
- DATABASE_URL, DB_HOST, DB_PORT, DB_NAME, DB_USER
- REDIS_HOST, REDIS_PORT
- SMTP_HOST, SMTP_PORT
- FRONTEND_URL, CORS_ALLOWED_ORIGINS, UPLOAD_PATH
- GOOGLE_OAUTH_CLIENT_ID, KAKAO_OAUTH_CLIENT_ID
- 외부 API 키들 (VITE_KAKAO_MAP_KEY 등)

### ⚠️ 별도 관리 필요 (총 6개)

#### Infisical 자체 구동용 (4개)
- INFISICAL_ENCRYPTION_KEY
- INFISICAL_AUTH_SECRET
- INFISICAL_PROJECT_ID (초기)
- INFISICAL_SERVICE_TOKEN (초기)

#### 시스템 설정 (2개)
- SPRING_PROFILES_ACTIVE
- SERVER_PORT (선택적)

## 🔍 실제 파일 위치

### 필수 설정 파일
```
kb-MoodFinancial_Diary/
├── .env                                    # Docker Compose용 (Infisical 자체 구동)
├── backend-main/
│   └── src/main/resources/
│       └── application.yml                 # 통합 Spring Boot 설정
├── frontend/
│   ├── .env                               # 프론트엔드 빌드용
│   └── .env.example                       # 템플릿
├── docker-compose.yml                     # 전체 스택 구성
└── infisical/
    └── docker-compose.8222.yml           # Infisical 서버
```

### Infisical 통합 코드
```
backend-main/src/main/java/com/nodove/mood_diary/
├── config/
│   ├── InfisicalConfig.java              # Infisical 설정
│   └── InfisicalPropertyConfiguration.java # Bean 설정
└── service/
    └── InfisicalService.java             # Infisical API 클라이언트

frontend/src/
├── utils/
│   └── infisical.ts                      # 프론트엔드 클라이언트
└── contexts/
    └── ConfigContext.tsx                 # 설정 컨텍스트
```

## 🚀 빠른 시작

```bash
# 1. Infisical 설정 스크립트 실행
./scripts/infisical-setup.sh

# 2. 웹 UI에서 프로젝트 및 환경변수 설정
# http://localhost:8222

# 3. 서비스 토큰을 .env에 추가
echo "INFISICAL_SERVICE_TOKEN=your-token" >> .env

# 4. 애플리케이션 실행
docker-compose up -d
```

## 🔒 보안 권장사항

1. **서비스 토큰 관리**: 환경별로 다른 토큰 사용
2. **권한 최소화**: 필요한 환경변수만 접근 가능하도록 설정
3. **토큰 순환**: 정기적으로 서비스 토큰 갱신
4. **감사 로그**: Infisical의 감사 로그 모니터링
5. **백업**: Infisical 데이터 정기 백업

## 🎯 결론

**Infisical로 관리 가능**: 전체 29개 환경변수 중 23개 (79%)
**별도 관리 필요**: 6개 (21%) - 주로 Infisical 자체 구동 및 시스템 설정

대부분의 보안 중요 환경변수는 Infisical로 중앙 관리 가능하며, 
나머지는 시스템 레벨 설정으로 불가피하게 별도 관리가 필요합니다.

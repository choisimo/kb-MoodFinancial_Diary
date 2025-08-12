# 환경변수 관리 및 서비스 시작 가이드

## 📋 개요

KB 무드 금융 다이어리 프로젝트의 환경변수를 순차적으로 설정하고 모든 서비스가 정상 작동하도록 하는 통합 관리 스크립트입니다.

## 🚀 빠른 시작

### 1. 원클릭 시작 (권장)

```bash
./quick-start.sh
```

대화형 메뉴를 통해 다음 작업을 수행할 수 있습니다:
- 환경변수 설정 및 검증
- Docker 서비스 시작
- 전체 애플리케이션 시작
- 서비스 상태 확인
- 로그 확인
- 환경 초기화

### 2. 단계별 수동 실행

#### 단계 1: 환경변수 설정
```bash
./setup-environment.sh
```

#### 단계 2: 서비스 시작
```bash
# 로컬 개발 모드
cd backend-main && ./gradlew bootRun &
cd frontend && npm run dev

# 또는 Docker 모드
docker-compose up -d
```

## 📁 스크립트 파일 설명

### `setup-environment.sh` - 메인 환경변수 설정 스크립트

**기능:**
- 환경변수 파일 자동 감지 및 로드 (`.env.local` 또는 `.env`)
- 29개 필수 환경변수 검증
- Docker 서비스 자동 시작 및 헬스체크
- Infisical 서비스 관리
- OAuth2 설정 형식 검증
- 데이터베이스/Redis 연결 테스트

**7단계 실행 프로세스:**
1. 환경변수 파일 확인 및 로드
2. 필수 환경변수 검증
3. Docker 서비스 시작
4. Infisical 서비스 관리
5. 서비스 연결 테스트
6. OAuth2 설정 검증
7. 환경변수 시스템 내보내기

### `quick-start.sh` - 대화형 빠른 시작 스크립트

**기능:**
- 사용자 친화적인 메뉴 인터페이스
- 선택적 작업 실행
- 실시간 서비스 상태 모니터링
- 로그 확인 및 문제 해결
- 환경 초기화 옵션

**메뉴 옵션:**
1. 🔧 환경변수 설정 및 검증
2. 🐳 Docker 서비스 시작
3. 🚀 전체 애플리케이션 시작
4. 🏥 서비스 상태 확인
5. 📋 환경변수 확인
6. 🛑 모든 서비스 중지
7. 📚 로그 확인
8. 🧹 환경 초기화

## 🔧 환경변수 설정

### 필수 환경변수 (29개)

#### 기본 설정
```bash
ENV=development
SPRING_PROFILES_ACTIVE=dev
```

#### 데이터베이스 설정
```bash
DB_HOST=localhost
DB_PORT=3308
DB_NAME=kb_mood_diary
DB_USER=kb_user
DB_PASSWORD=your_secure_db_password_here
```

#### Redis 설정
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password_here
```

#### JWT 설정 (최소 32자)
```bash
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long_here
JWT_EXPIRATION=86400000
```

#### OAuth2 설정
```bash
# Google (Google Cloud Console에서 발급)
OAUTH2_GOOGLE_CLIENT_ID=your_google_client_id_here
OAUTH2_GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Kakao (Kakao Developers에서 발급)
OAUTH2_KAKAO_CLIENT_ID=your_kakao_client_id_here
OAUTH2_KAKAO_CLIENT_SECRET=your_kakao_client_secret_here
```

#### 애플리케이션 설정
```bash
SERVER_PORT=8090
FRONTEND_PORT=3000
VITE_API_BASE_URL=http://localhost:8090
VITE_APP_TITLE=KB 감정 다이어리
VITE_APP_VERSION=1.0.0
```

#### Infisical 설정 (선택사항)
```bash
INFISICAL_ENABLED=false
INFISICAL_HOST=http://localhost:8222
INFISICAL_PROJECT_ID=
INFISICAL_BACKEND_TOKEN=
INFISICAL_FRONTEND_TOKEN=
```

### 환경변수 파일 설정

#### 로컬 개발 모드
```bash
cp .env.local.example .env.local
nano .env.local  # 실제 값으로 수정
```

#### Docker 모드
```bash
cp .env.example .env
nano .env  # 실제 값으로 수정
```

## 🔍 검증 기능

### 환경변수 검증
- ✅ 필수 환경변수 존재 확인
- ✅ 기본값(`your_*`, `*_here`) 감지
- ✅ JWT Secret 길이 검증 (최소 32자)
- ✅ OAuth2 클라이언트 ID 형식 검증
- ✅ 민감 정보 마스킹 표시

### 서비스 연결 테스트
- ✅ MariaDB 연결 테스트 (재시도 로직 포함)
- ✅ Redis 연결 테스트 (비밀번호 지원)
- ✅ Infisical API 헬스체크
- ✅ 각 서비스별 헬스체크 엔드포인트 확인

### OAuth2 형식 검증
- ✅ Google: `숫자-문자열.apps.googleusercontent.com` 형식
- ✅ Kakao: 숫자 형식 확인

## 🐳 Docker 서비스 관리

### 자동 시작 서비스
- `mariadb`: 데이터베이스 (포트 3308)
- `redis`: 캐시 서버 (포트 6379)  
- `infisical`: 환경변수 관리 (포트 8222, 선택사항)

### 헬스체크 대기 시간
- MariaDB: 최대 10회 재시도 (20초)
- Redis: 즉시 연결 확인
- Infisical: 최대 10회 재시도 (50초)

### 전체 애플리케이션 스택
```bash
# 전체 서비스 시작
docker-compose up -d

# 포함 서비스:
# - infisical-db, infisical-redis, infisical
# - mariadb, redis  
# - backend, frontend
# - nginx (로드밸런서)
```

## 🚨 문제 해결

### 일반적인 문제들

#### 1. 환경변수 파일 없음
```bash
❌ .env.local 파일이 없습니다.
해결: cp .env.local.example .env.local
```

#### 2. JWT Secret 길이 부족
```bash
❌ JWT_SECRET은 최소 32자 이상이어야 합니다
해결: openssl rand -base64 32
```

#### 3. 데이터베이스 연결 실패
```bash
❌ MariaDB 연결 실패
해결: docker-compose up -d mariadb && sleep 10
```

#### 4. OAuth2 기본값 감지
```bash
⚠️ Google OAuth 클라이언트 ID: 기본값 (실제 값으로 변경 필요)
해결: Google Cloud Console에서 실제 클라이언트 ID 발급
```

### 로그 확인 명령어
```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend
docker-compose logs -f mariadb
docker-compose logs -f redis
```

### 환경 초기화
```bash
# quick-start.sh 메뉴에서 "8. 환경 초기화" 선택
# 또는 수동 실행:
docker-compose down -v --remove-orphans
```

## 🌐 접속 URL

서비스 시작 완료 후 접속 가능한 URL:

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8090  
- **Infisical 관리**: http://localhost:8222
- **Nginx 프록시**: http://localhost:8080

## 📊 상태 확인

### 서비스 상태 확인
```bash
docker-compose ps
```

### 헬스체크 엔드포인트
- Backend: http://localhost:8090/actuator/health
- Frontend: http://localhost:3000
- Infisical: http://localhost:8222/api/status

### 개별 서비스 연결 테스트
```bash
# 데이터베이스
mysql -h localhost -P 3308 -u kb_user -p

# Redis
redis-cli -h localhost -p 6379
```

## 🔄 기존 스크립트와의 연동

### 기존 스크립트 활용
- `scripts/check-env.sh`: 환경변수 검증
- `scripts/start-local.sh`: 로컬 서버 시작
- `scripts/infisical-setup.sh`: Infisical 설정

### 새로운 통합 워크플로우
```bash
# 1. 환경 설정 (신규)
./setup-environment.sh

# 2. 빠른 시작 (신규)  
./quick-start.sh

# 3. 기존 스크립트 (호환)
./scripts/check-env.sh
./scripts/start-local.sh
```

## 💡 권장 사용법

### 최초 설정 시
```bash
# 1. 빠른 시작 실행
./quick-start.sh

# 2. 메뉴에서 "1. 환경변수 설정 및 검증" 선택
# 3. 환경변수 파일 생성 후 실제 값으로 수정
# 4. 메뉴에서 "3. 전체 애플리케이션 시작" 선택
```

### 일상적인 개발 시
```bash
# 빠른 상태 확인
./quick-start.sh → "4. 서비스 상태 확인"

# 문제 발생 시 로그 확인
./quick-start.sh → "7. 로그 확인"

# 환경 초기화 (필요시)
./quick-start.sh → "8. 환경 초기화"
```

---

**주의사항:**
- 모든 환경변수는 실제 운영 값으로 반드시 변경해야 합니다
- `.env.local` 파일은 Git에 커밋되지 않으므로 안전합니다
- Infisical 사용 시 별도의 설정 가이드를 참조하세요
- 문제 발생 시 해당 서비스의 로그를 먼저 확인하세요
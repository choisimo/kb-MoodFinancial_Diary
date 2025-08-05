# Mood Financial Diary

감정과 금융을 연결하는 혁신적인 다이어리 애플리케이션입니다.

## 프로젝트 구조

```
├── backend-main/          # Spring Boot 백엔드
├── frontend/             # React 프론트엔드
├── docker/              # Docker 설정 파일들
├── docs/                # 프로젝트 문서
└── docker-compose.yml   # Docker Compose 설정
```

## 기술 스택

### 백엔드
- **Spring Boot 3.5.4** - Java 21
- **Spring Security** - JWT 인증
- **Spring Data JPA** - 데이터베이스 접근
- **MariaDB** - 주 데이터베이스
- **Redis** - 캐싱 및 세션 관리
- **Gradle** - 빌드 도구

### 프론트엔드
- **React 18** with TypeScript
- **Vite** - 개발 서버 및 빌드 도구
- **Tailwind CSS** - 스타일링
- **React Router** - 라우팅
- **React Hook Form** - 폼 관리
- **Zod** - 스키마 검증
- **Axios** - HTTP 클라이언트

### 인프라
- **Docker & Docker Compose** - 컨테이너화
- **Nginx** - 리버스 프록시 및 정적 파일 서빙

## 시작하기

### 환경 설정

1. 환경 변수 파일 생성:
```bash
cp .env.example .env
```

2. 필요한 환경 변수 수정:
```bash
# Database
DB_PASSWORD=your_secure_password
JWT_SECRET=your_super_secret_jwt_key

# Email (선택사항)
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_app_password
```

### Docker로 실행

전체 애플리케이션을 Docker Compose로 실행:

```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 중지
docker-compose down
```

접속 주소:
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080/api
- **Nginx 프록시**: http://localhost:80

### 개발 환경 실행

#### 백엔드 개발

```bash
cd backend-main

# 의존성 설치 및 빌드
./gradlew build

# 개발 모드 실행 (local 프로필)
./gradlew bootRun --args='--spring.profiles.active=dev'
```

#### 프론트엔드 개발

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

## API 문서

### 인증 API

#### 회원가입
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "사용자"
}
```

#### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 이메일 인증
```http
GET /api/auth/verify-email?token={verification_token}
```

### 사용자 설정 API

#### 설정 조회
```http
GET /api/user-settings
Authorization: Bearer {jwt_token}
```

#### 설정 업데이트
```http
PUT /api/user-settings
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "notificationEnabled": true,
  "dailyReminderTime": "21:00:00",
  "targetEntriesPerWeek": 5,
  "privacyMode": false
}
```

## 개발 가이드

### 브랜치 전략
- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치
- `hotfix/*`: 핫픽스 브랜치

### 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 formatting, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드 추가/수정
chore: 빌드 업무, 패키지 매니저 설정 등
```

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
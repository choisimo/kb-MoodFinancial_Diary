# KB 무드 금융 다이어리 백엔드

Spring Boot 기반의 무드 금융 다이어리 백엔드 API 서버입니다.

## 기술 스택

- **Java 21**
- **Spring Boot 3.5.4**
- **Spring Security** (JWT + OAuth2)
- **MariaDB** (데이터베이스)
- **Redis** (캐시 및 세션)
- **Gradle** (빌드 도구)

## 주요 기능

- 사용자 인증 (JWT 토큰 기반)
- OAuth2 소셜 로그인 (Google, Kakao)
- 무드 기반 금융 데이터 관리
- RESTful API 제공

## 환경 설정

### 1. 환경변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 실제 값으로 수정하세요:

```bash
cp .env.example .env
```

### 2. 필수 환경변수

```bash
# 데이터베이스
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kb_mood_diary
DB_USER=your_username
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT 시크릿 (256비트 이상)
JWT_SECRET=your-256-bit-secret-key

# OAuth2 설정
OAUTH2_GOOGLE_CLIENT_ID=your-google-client-id
OAUTH2_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. OAuth2 설정

#### Google OAuth2 설정
1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. OAuth 2.0 클라이언트 ID 생성
3. 승인된 리디렉션 URI 추가: `http://localhost:8090/login/oauth2/code/google`

#### Kakao OAuth2 설정
1. [Kakao Developers](https://developers.kakao.com/)에서 애플리케이션 생성
2. Redirect URI 설정: `http://localhost:8090/login/oauth2/code/kakao`

## 실행 방법

### 개발 환경 실행

```bash
# Gradle을 사용한 실행
./gradlew bootRun

# 또는 IDE에서 MoodDiaryApplication.java 실행
```

### Docker를 사용한 실행

```bash
# Docker Compose로 전체 스택 실행
docker-compose up -d

# 애플리케이션만 실행
docker-compose up app
```

## API 엔드포인트

### 인증 관련
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /oauth2/authorization/google` - Google 로그인
- `GET /oauth2/authorization/kakao` - Kakao 로그인

### 테스트 엔드포인트
- `GET /api/test/oauth2-registrations` - OAuth2 등록 상태 확인

## 개발 가이드

### 프로젝트 구조

```
src/main/java/com/nodove/MoodDiary/
├── config/          # 설정 클래스
├── controller/      # REST 컨트롤러
├── dto/            # 데이터 전송 객체
├── entity/         # JPA 엔티티
├── enums/          # 열거형
├── repository/     # 데이터 접근 계층
├── security/       # 보안 관련 클래스
├── service/        # 비즈니스 로직
└── MoodDiaryApplication.java
```

### 보안 고려사항

1. **민감정보 관리**
   - `.env` 파일은 Git에 커밋하지 않음
   - 프로덕션 환경에서는 환경변수 또는 시크릿 관리 도구 사용

2. **JWT 토큰**
   - 256비트 이상의 강력한 시크릿 키 사용
   - 토큰 만료 시간 적절히 설정

3. **OAuth2**
   - 클라이언트 시크릿은 절대 노출하지 않음
   - HTTPS 사용 권장 (프로덕션)

## 문제 해결

### 포트 충돌
```bash
# 8080 포트를 사용하는 프로세스 확인
lsof -ti:8080

# 프로세스 종료
kill -9 <PID>
```

### 데이터베이스 연결 오류
1. MariaDB 서버가 실행 중인지 확인
2. 데이터베이스 및 사용자 권한 확인
3. `.env` 파일의 DB 설정 확인

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

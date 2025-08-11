# KB 감정 다이어리 - Infisical 환경변수 관리

이 프로젝트는 Infisical을 사용하여 모든 환경변수와 시크릿을 중앙에서 안전하게 관리합니다.

## 🚀 빠른 시작

### 1. 리포지토리 클론 및 설정
```bash
git clone [repository-url]
cd kb-MoodFinancial_Diary
```

### 2. Infisical 초기 설정
```bash
# 자동 설정 스크립트 실행
./scripts/infisical-setup.sh
```

### 3. Infisical 웹 UI에서 프로젝트 설정
1. 브라우저에서 http://localhost:8222 접속
2. 계정 생성 또는 로그인
3. 새 프로젝트 생성 (예: `kb-mood-diary`)
4. 환경 설정 (dev, staging, production)
5. 서비스 토큰 생성

### 4. 환경변수 파일 업데이트
```bash
# .env 파일에서 다음 값들 업데이트
INFISICAL_PROJECT_ID=your_project_id_from_web_ui
INFISICAL_SERVICE_TOKEN=your_service_token_from_web_ui
VITE_INFISICAL_PROJECT_ID=your_project_id_from_web_ui
VITE_INFISICAL_SERVICE_TOKEN=your_service_token_from_web_ui
```

### 5. 시크릿 마이그레이션
```bash
# 기존 환경변수를 Infisical로 마이그레이션
./scripts/env-migration.sh
```

### 6. 애플리케이션 시작
```bash
# 전체 스택 시작
docker-compose up -d

# 또는 개별 서비스 시작
docker-compose up -d mariadb redis infisical
docker-compose up -d backend frontend
```

## 📋 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Infisical     │
│   (React/Vite)  │    │   (Spring Boot) │    │   Server        │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Config       │ │    │ │Infisical    │ │    │ │Secret       │ │
│ │Context      │◄──────┤ │Service      │◄──────┤ │Management   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 구성 요소

### Backend (Spring Boot)
- **InfisicalConfig**: Infisical 연결 설정
- **InfisicalService**: API 통신 서비스
- **InfisicalPropertyConfiguration**: 환경변수 빈 관리

### Frontend (React/Vite)
- **infisical.ts**: Infisical 클라이언트 유틸리티
- **ConfigContext**: 전역 설정 컨텍스트
- **useInfisicalConfig**: 설정 관리 훅

### Docker Services
- **infisical**: Infisical 메인 서버
- **infisical-db**: PostgreSQL 데이터베이스
- **infisical-redis**: Redis 캐시

## 🛠️ 환경별 설정

### Development 환경
```yaml
# application.yml에서
spring:
  profiles:
    active: dev

infisical:
  enabled: true
  environment: dev
```

### Docker 환경
```bash
# .env 파일에서
SPRING_PROFILES_ACTIVE=docker
INFISICAL_ENABLED=true
INFISICAL_ENVIRONMENT=production
```

### Production 환경
```yaml
# application.yml에서
spring:
  profiles:
    active: prod

infisical:
  enabled: true
  environment: production
```

## 🔐 관리되는 시크릿

### 데이터베이스 설정
- `DATABASE_URL`: 전체 데이터베이스 연결 URL
- `DATABASE_USERNAME`: 데이터베이스 사용자명
- `DATABASE_PASSWORD`: 데이터베이스 비밀번호
- `REDIS_HOST`: Redis 호스트
- `REDIS_PORT`: Redis 포트
- `REDIS_PASSWORD`: Redis 비밀번호

### 인증/보안
- `JWT_SECRET`: JWT 토큰 서명 키
- `ENCRYPTION_KEY`: 데이터 암호화 키
- `APP_SECRET`: 애플리케이션 시크릿
- `GOOGLE_OAUTH_CLIENT_ID`: Google OAuth 클라이언트 ID
- `GOOGLE_OAUTH_CLIENT_SECRET`: Google OAuth 클라이언트 시크릿
- `KAKAO_OAUTH_CLIENT_ID`: Kakao OAuth 클라이언트 ID
- `KAKAO_OAUTH_CLIENT_SECRET`: Kakao OAuth 클라이언트 시크릿

### 외부 API
- `KAKAO_MAP_KEY`: Kakao Map API 키
- `OPENAI_API_KEY`: OpenAI API 키
- `PAYMENT_API_KEY`: 결제 API 키

### SMTP 설정
- `SMTP_HOST`: SMTP 서버 호스트
- `SMTP_PORT`: SMTP 서버 포트
- `SMTP_USERNAME`: SMTP 사용자명
- `SMTP_PASSWORD`: SMTP 비밀번호

## 💻 사용 방법

### Backend에서 사용
```java
@Service
public class MyService {
    
    @Autowired
    private InfisicalService infisicalService;
    
    public void someMethod() {
        // 시크릿 가져오기
        String apiKey = infisicalService.getSecret("API_KEY", "default_value");
        
        // 모든 시크릿 가져오기
        Map<String, String> secrets = infisicalService.getAllSecrets();
    }
}
```

### Frontend에서 사용
```tsx
import { useInfisicalConfig } from '@/hooks/useInfisicalConfig';

function MyComponent() {
    const { kakaoMapKey, apiBaseUrl, getSecret } = useInfisicalConfig();
    
    // 설정 값 사용
    console.log('Kakao Map Key:', kakaoMapKey);
    console.log('API Base URL:', apiBaseUrl);
    
    // 커스텀 시크릿 가져오기
    const customSecret = getSecret('CUSTOM_SECRET', 'default_value');
    
    return <div>...</div>;
}
```

## 🔄 운영 및 관리

### 캐시 관리
```java
// Backend에서 캐시 초기화
@Autowired
private InfisicalService infisicalService;

public void clearCache() {
    infisicalService.clearCache();
}
```

```tsx
// Frontend에서 설정 새로고침
const { refreshSecrets } = useInfisicalConfig();

const handleRefresh = async () => {
    await refreshSecrets();
};
```

### 상태 확인
```bash
# Infisical 서비스 상태 확인
curl http://localhost:8222/api/status

# Docker 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs infisical
docker-compose logs backend
```

## 🚨 트러블슈팅

### 연결 문제
```bash
# Infisical 컨테이너 재시작
docker-compose restart infisical

# 네트워크 확인
docker network ls
docker network inspect kb-moodfinancial_diary_mood-diary-network
```

### 시크릿 동기화 문제
```bash
# 캐시 클리어 후 재시작
docker-compose restart backend frontend
```

### 로그 확인
```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f infisical
docker-compose logs -f backend
```

## 🔒 보안 고려사항

1. **서비스 토큰 보안**
   - 서비스 토큰은 환경변수로만 관리
   - 코드에 하드코딩 금지
   - 정기적인 토큰 갱신

2. **네트워크 보안**
   - 프로덕션에서는 HTTPS 사용
   - 방화벽 설정으로 Infisical 서버 접근 제한

3. **권한 관리**
   - 환경별 서로 다른 서비스 토큰 사용
   - 최소 권한 원칙 적용

## 📚 추가 자료

- [Infisical 공식 문서](https://infisical.com/docs)
- [Spring Boot 외부 설정](https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-external-config)
- [Vite 환경변수](https://vitejs.dev/guide/env-and-mode.html)

## 🤝 기여

이 설정에 대한 개선사항이나 버그 리포트는 Issues를 통해 제출해주세요.

---

이 문서는 프로젝트의 환경변수 관리가 개선됨에 따라 지속적으로 업데이트됩니다.
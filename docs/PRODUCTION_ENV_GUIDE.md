# .env.production 파일 Infisical 관리 가이드

## 📋 현재 상황 분석

### ✅ Infisical로 관리 가능한 환경변수
- **백엔드 런타임 변수**: 100% 관리 가능
- **프론트엔드 런타임 변수**: 80% 관리 가능 (Infisical 클라이언트 통해)
- **프론트엔드 빌드 타임 변수**: 제한적 (Docker 빌드 시점 문제)

### ⚠️ 제한사항
1. **Vite 빌드 프로세스**: `.env.production` 파일이 빌드 시점에 로드됨
2. **Docker 빌드**: Infisical 서버 의존성 문제
3. **순환 의존성**: Infisical 설정 자체가 환경변수 필요

## 🔧 권장 접근법

### 1단계: 최소한의 .env.production 유지
```bash
# .env.production (빌드 타임 필수 변수만)
VITE_INFISICAL_ENABLED=true
VITE_INFISICAL_HOST=https://infisical.yourdomain.com
VITE_INFISICAL_PROJECT_ID=your-production-project-id
VITE_INFISICAL_SERVICE_TOKEN=your-production-service-token
VITE_INFISICAL_ENVIRONMENT=production

# 빌드 타임 필수 설정
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 2단계: Infisical에서 관리할 변수들
```bash
# Infisical Production 환경에 등록
KAKAO_MAP_KEY=your-production-kakao-key
OPENAI_API_KEY=your-production-openai-key
PAYMENT_API_KEY=your-production-payment-key
GOOGLE_OAUTH_CLIENT_ID=your-production-google-id
KAKAO_OAUTH_CLIENT_ID=your-production-kakao-id

# 앱 설정
APP_TITLE=KB 감정 다이어리
APP_VERSION=1.0.0
DEBUG_MODE=false
LOG_LEVEL=warn
```

### 3단계: Docker 빌드 최적화
```dockerfile
# frontend/Dockerfile 개선
FROM node:18-alpine as builder

# 최소한의 빌드 타임 변수만 ARG로 받기
ARG VITE_INFISICAL_ENABLED=true
ARG VITE_INFISICAL_HOST
ARG VITE_INFISICAL_PROJECT_ID
ARG VITE_INFISICAL_SERVICE_TOKEN
ARG VITE_API_BASE_URL

# 나머지는 런타임에 Infisical에서 로드
ENV VITE_INFISICAL_ENABLED=$VITE_INFISICAL_ENABLED
ENV VITE_INFISICAL_HOST=$VITE_INFISICAL_HOST
ENV VITE_INFISICAL_PROJECT_ID=$VITE_INFISICAL_PROJECT_ID
ENV VITE_INFISICAL_SERVICE_TOKEN=$VITE_INFISICAL_SERVICE_TOKEN
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build:prod
```

## 📊 관리 비율

### 현재 .env.production (217줄)
- **Infisical로 이동 가능**: ~170줄 (78%)
- **빌드 타임 필수**: ~47줄 (22%)

### 권장 분할
```bash
# .env.production (유지) - 47줄
VITE_INFISICAL_*=...
VITE_API_BASE_URL=...
기타 빌드 타임 필수 변수들

# Infisical Production 환경 - 170줄
모든 API 키, 시크릿, 런타임 설정값들
```

## 🚀 실행 방법

### 개발 환경
```bash
# 1. .env.production 최소화
# 2. Infisical에 나머지 변수 등록
# 3. 빌드 테스트
npm run build:prod
```

### 프로덕션 배포
```bash
# Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# 또는 개별 빌드
docker build --build-arg VITE_INFISICAL_HOST=https://infisical.prod.com \
             --build-arg VITE_API_BASE_URL=https://api.prod.com \
             -t mood-diary-frontend .
```

## 🎯 결론

**.env.production을 Infisical로 관리**: **78% 가능**

- ✅ **런타임 변수**: 완전 관리 가능
- ⚠️ **빌드 타임 변수**: 최소한만 유지 필요
- 🔧 **하이브리드 접근**: 최적의 보안과 실용성 확보

대부분의 보안 중요 변수들은 Infisical로 중앙 관리하고, 
빌드 프로세스에 필수적인 최소한의 변수만 .env.production에 유지하는 것이 최선입니다.

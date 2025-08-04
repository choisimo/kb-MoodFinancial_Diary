# MoodFinance AI - Agile 문서 가이드

## 문서 디렉토리 구조

```
docs/
├── agile/                          # Agile 방법론 관련 문서
│   ├── product-management/         # 제품 관리 문서
│   │   └── product-vision.md      # 제품 비전 및 로드맵
│   ├── user-stories/              # 사용자 스토리 관련
│   │   └── epics-and-stories.md   # Epic 및 User Story 정의
│   ├── sprint-planning/           # 스프린트 계획 문서
│   │   ├── sprint-backlog.md      # 스프린트 백로그 및 계획
│   │   └── definition-of-done.md  # 완료 정의 및 수락 기준
│   └── team-processes/            # 팀 프로세스 문서
│       └── team-roles-responsibilities.md  # 팀 역할 및 책임
└── development/                    # 개발 관련 문서
    ├── tasks/                     # 작업 분해 문서
    │   └── detailed-task-breakdown.md  # 상세 작업 분해
    ├── architecture/              # 아키텍처 문서 (추후 확장)
    └── standards/                 # 개발 표준 문서
        └── development-workflow.md  # 개발 워크플로우 및 표준
```

## 문서별 주요 내용

### 1. 제품 비전 및 로드맵 (`product-vision.md`)
- **제품 비전**: 감정-소비 연결고리 분석을 통한 건강한 금융 습관 형성 지원
- **핵심 가치 제안**: 쉬운 기록, 깊은 이해, 나은 결정, 지속 가능한 성장
- **18주 개발 로드맵**: 3단계(MVP → 고도화 → 사용자 참여 강화)로 구성
- **성공 지표**: DAU 70%, 충동구매 감소율 20%, 사용자 만족도 4.5/5.0

### 2. Epic 및 User Story (`epics-and-stories.md`)
- **6개 주요 Epic**: 총 262 Story Points
  - Epic 1: 사용자 인증 및 기본 설정 (16 points)
  - Epic 2: 감정-소비 통합 다이어리 (47 points)
  - Epic 3: AI 패턴 분석 및 피드백 (42 points)
  - Epic 4: 이미지 분석 기능 (60 points)
  - Epic 5: 사전 예방 알림 및 개인화 코칭 (55 points)
  - Epic 6: 보상 시스템 및 개인 설정 (42 points)
- **22개 상세 User Story**: 각각 Acceptance Criteria 포함

### 3. 스프린트 백로그 및 계획 (`sprint-backlog.md`)
- **9개 스프린트**: 각 2주 단위, 35-40 Story Points per Sprint
- **우선순위 기반 백로그**: High/Medium/Low Priority로 분류
- **상세 스프린트 계획**: Sprint 1부터 구체적인 작업 분배
- **위험 관리**: 기술적/일정 위험에 대한 대응 방안

### 4. 완료 정의 및 수락 기준 (`definition-of-done.md`)
- **전체 프로젝트 DoD**: 코드 품질, 기능 요구사항, 문서화, 배포 준비
- **Epic별 상세 DoD**: 각 Epic의 특성에 맞는 세부 기준
- **Sprint별 특별 요구사항**: 단계별 추가 요구사항
- **품질 보증 체크리스트**: 코드 품질, UX, 보안, 성능 기준

### 5. 팀 역할 및 책임 (`team-roles-responsibilities.md`)
- **Developer A (Full-stack Lead)**: Spring Boot + React, 시스템 아키텍처, DevOps
- **Developer B (AI/Data Specialist)**: Python/FastAPI, AI 모델, 데이터 분석
- **협업 프로세스**: Daily Standup, Weekly Tech Review, Sprint Retrospective
- **의사결정 권한**: 각 개발자의 전문 영역별 결정권 명시

### 6. 상세 작업 분해 (`detailed-task-breakdown.md`)
- **Sprint 1-4 상세 작업**: 각 Task별 소요 시간, 담당자, 산출물 명시
- **일별 작업 계획**: 10일 스프린트 내 일별 상세 작업
- **협업 체크포인트**: API 인터페이스, 공통 데이터 모델 설계 포인트
- **Daily Standup 가이드**: 효율적인 일일 미팅 진행 방법

### 7. 개발 워크플로우 및 표준 (`development-workflow.md`)
- **Git 워크플로우**: 브랜치 전략, 커밋 메시지 규칙, PR 프로세스
- **코딩 표준**: Java/Spring Boot, React/JavaScript, Python/FastAPI
- **데이터베이스 표준**: 네이밍 규칙, 마이그레이션 관리
- **API 설계 표준**: REST API 구조, 응답 형식, 문서화
- **테스트 표준**: 단위/통합 테스트, 프론트엔드 테스트
- **보안 표준**: 인증/인가, 데이터 보안, 암호화
- **성능 최적화**: DB 최적화, 캐싱, 프론트엔드 최적화

## 시작하기

### 1. 프로젝트 초기 설정
1. `product-vision.md`를 읽고 프로젝트 목표와 비전 이해
2. `epics-and-stories.md`에서 전체 기능 요구사항 파악
3. `team-roles-responsibilities.md`로 역할과 책임 확인

### 2. 개발 준비
1. `development-workflow.md`의 Git 워크플로우 및 코딩 표준 숙지
2. `detailed-task-breakdown.md`에서 첫 번째 스프린트 작업 확인
3. 개발 환경 설정 (Docker, IDE, 도구 등)

### 3. 스프린트 진행
1. `sprint-backlog.md`의 스프린트 계획에 따라 작업 진행
2. `definition-of-done.md`의 완료 기준 확인하며 개발
3. Daily Standup 및 주간 리뷰 진행

## 프로젝트 주요 메트릭

### 개발 메트릭
- **전체 개발 기간**: 18주 (9 스프린트)
- **총 Story Points**: 262 points
- **평균 Sprint Velocity**: 29 points
- **팀 크기**: 2명 (Full-stack Lead + AI Specialist)

### 기술 스택 요약
- **Frontend**: React, Redux/Context API, Tailwind CSS
- **Backend**: Spring Boot, Spring Security, JPA/Hibernate
- **AI Server**: Python, FastAPI, TensorFlow/PyTorch
- **Database**: MariaDB (정형 데이터), MongoDB (비정형 데이터), Redis (캐싱)
- **Infrastructure**: Docker, Nginx, Kafka
- **AI Services**: Google Gemini API, 이미지 분석 AI API 또는 [OpenCV, OCR 라이브러리] - 양자택일로 선택 가능

### 주요 기능 우선순위
1. **MVP (Sprint 1-4)**: 인증, 일기 작성, 가계부 연동, 기본 분석
2. **고도화 (Sprint 5-7)**: 이미지 분석, 멀티 에이전트, 예방 시스템
3. **사용자 참여 (Sprint 8-9)**: 코칭, 보상 시스템, 개인 설정

## 문서 관리 및 업데이트

### 정기 업데이트 주기
- **매주 금요일**: 스프린트 리뷰 후 백로그 조정
- **매월 말**: 로드맵 및 우선순위 재검토
- **스프린트 종료 시**: Definition of Done 및 프로세스 개선

### 문서 버전 관리
- 모든 문서는 Git으로 버전 관리
- 주요 변경사항은 CHANGELOG.md에 기록
- 팀 합의 하에 문서 수정 및 보완


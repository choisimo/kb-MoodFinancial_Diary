# Sprint Planning & Product Backlog

## Sprint 계획 개요

### 스프린트 기본 정보
- **스프린트 길이**: 2주 (10 working days)
- **팀 구성**: 2명 개발자
- **개발 역량**: 팀당 스프린트 velocity 35-40 story points
- **전체 프로젝트 기간**: 18주 (9 스프린트)

### 팀 역할 분담
- **Developer A (Full-stack Lead)**: 백엔드 Spring Boot + 프론트엔드 React
- **Developer B (AI/Data Specialist)**: Python AI 서버 + 데이터 분석

---

## 전체 Product Backlog (우선순위 정렬)

### High Priority (Must Have - MVP)

#### Sprint 1 (Week 1-2) - 기반 인프라 구축
**목표**: 프로젝트 기반 환경 구축 및 기본 인증 시스템

| Story ID | Story | Assignee | Story Points | Priority |
|----------|-------|----------|--------------|-----------|
| US-001 | 회원가입 | Developer A | 5 | High |
| US-002 | 로그인/로그아웃 | Developer A | 3 | High |
| US-003 | 초기 설정 | Developer A | 8 | High |
| TECH-001 | 개발 환경 구축 (Docker, DB) | Developer A | 8 | High |
| TECH-002 | AI 서버 기본 구조 설정 | Developer B | 5 | High |
| TECH-003 | 기본 API 통신 구조 | Both | 8 | High |

**Sprint 1 Total**: 37 points

#### Sprint 2 (Week 3-4) - 일기 시스템 구축
**목표**: 기본 일기 작성 및 조회 기능 완성

| Story ID | Story | Assignee | Story Points | Priority |
|----------|-------|----------|--------------|-----------|
| US-004 | 일기 작성 (텍스트/감정) | Developer A | 8 | High |
| US-006 | 타임라인 뷰 (기본) | Developer A | 8 | High |
| US-007 | 일기 수정/삭제 | Developer A | 5 | High |
| TECH-004 | 음성 입력 STT 구현 | Developer B | 8 | High |
| TECH-005 | 이미지 업로드 시스템 | Developer B | 8 | High |

**Sprint 2 Total**: 37 points

#### Sprint 3 (Week 5-6) - 가계부 연동
**목표**: 오픈뱅킹 연동 및 자동 소비 내역 관리

| Story ID | Story | Assignee | Story Points | Priority |
|----------|-------|----------|--------------|-----------|
| US-005 | 가계부 자동 연동 | Developer A | 21 | High |
| TECH-006 | 소비 카테고리 분류 AI | Developer B | 13 | High |
| TECH-007 | 데이터 동기화 시스템 | Both | 3 | Medium |

**Sprint 3 Total**: 37 points

#### Sprint 4 (Week 7-8) - 기본 분석 기능
**목표**: 기초적인 패턴 분석 및 시각화

| Story ID | Story | Assignee | Story Points | Priority |
|----------|-------|----------|--------------|-----------|
| US-008 | 패턴 분석 (기본) | Developer B | 13 | High |
| US-010 | 인사이트 리포트 (기본) | Developer B | 8 | High |
| TECH-008 | 데이터 분석 파이프라인 | Developer B | 8 | High |
| TECH-009 | 차트 시각화 시스템 | Developer A | 8 | High |

**Sprint 4 Total**: 37 points

### Medium Priority (Should Have - 고도화)

#### Sprint 5 (Week 9-10) - 이미지 분석 1단계
**목표**: 기본 이미지 분석 기능 구현

| Story ID | Story | Assignee | Story Points | Priority |
|----------|-------|----------|--------------|-----------|
| US-011 | 이미지 자동 분류 | Developer B | 13 | Medium |
| US-012 | 표정 분석 | Developer B | 13 | Medium |
| TECH-010 | 이미지 전처리 파이프라인 | Developer B | 8 | Medium |
| TECH-011 | 분석 결과 UI 통합 | Developer A | 3 | Medium |

**Sprint 5 Total**: 37 points

#### Sprint 6 (Week 11-12) - 이미지 분석 2단계
**목표**: OCR 및 고급 이미지 분석

| Story ID | Story | Assignee | Story Points | Priority |
|----------|-------|----------|--------------|-----------|
| US-013 | 영수증 OCR | Developer B | 21 | Medium |
| US-014 | 객체/상황 분석 | Developer B | 13 | Medium |
| TECH-012 | OCR 정확도 개선 | Developer B | 3 | Medium |

**Sprint 6 Total**: 37 points

#### Sprint 7 (Week 13-14) - AI 고도화
**목표**: 멀티 에이전트 분석 및 예방 시스템

| Story ID | Story | Assignee | Story Points | Priority |
|----------|-------|----------|--------------|-----------|
| US-009 | 멀티 에이전트 피드백 | Developer B | 13 | Medium |
| US-015 | 위험 상황 감지 | Developer B | 21 | Medium |
| TECH-013 | Gemini API 통합 | Developer B | 3 | Medium |

**Sprint 7 Total**: 37 points

### Low Priority (Could Have - 추가 기능)

#### Sprint 8 (Week 15-16) - 예방 및 코칭
**목표**: 개인화 코칭 시스템 완성

| Story ID | Story | Assignee | Story Points | Priority |
|----------|-------|----------|--------------|-----------|
| US-016 | 예방 알림 | Developer A | 13 | Low |
| US-017 | 맞춤형 챌린지 | Developer B | 13 | Low |
| US-018 | 긍정 피드백 | Developer A | 8 | Low |
| TECH-014 | 실시간 알림 시스템 | Developer A | 3 | Low |

**Sprint 8 Total**: 37 points

#### Sprint 9 (Week 17-18) - 보상 시스템 및 마무리
**목표**: 보상 시스템 구현 및 전체 시스템 최적화

| Story ID | Story | Assignee | Story Points | Priority |
|----------|-------|----------|--------------|-----------|
| US-019 | 금융 건강 점수 | Developer B | 13 | Low |
| US-020 | 포인트 및 보상 | Developer A | 13 | Low |
| US-021 | 개인 설정 관리 | Developer A | 8 | Low |
| US-022 | 데이터 내보내기/삭제 | Developer A | 8 | Low |
| TECH-015 | 성능 최적화 | Both | 5 | Low |
| TECH-016 | 보안 강화 | Both | 3 | Low |

**Sprint 9 Total**: 50 points (마지막 스프린트로 약간 더 많은 작업)

---

## Sprint 별 상세 계획

### Sprint 1 상세 계획 (Week 1-2)

#### Sprint Goal
"사용자가 회원가입하고 로그인하여 기본 설정을 완료할 수 있는 시스템 구축"

#### Developer A 작업 (20 points)
1. **프로젝트 환경 구축**
   - Docker Compose 설정 (MariaDB, Redis, Nginx)
   - Spring Boot 기본 프로젝트 구조
   - React 기본 프로젝트 구조
   
2. **사용자 인증 시스템**
   - Spring Security 설정
   - JWT 토큰 기반 인증
   - 회원가입/로그인 API
   
3. **기본 UI 구성**
   - 로그인/회원가입 페이지
   - 기본 레이아웃 컴포넌트

#### Developer B 작업 (17 points)
1. **AI 서버 기반 구조**
   - FastAPI 기본 프로젝트 설정
   - MongoDB 연결 설정
   - 기본 AI 분석 모델 틀

2. **API 통신 구조**
   - Spring Boot <-> Python API 통신
   - Kafka 기본 설정
   - 에러 핸들링 기본 구조

#### Definition of Done (Sprint 1)
- [ ] 사용자가 이메일로 회원가입 가능
- [ ] 소셜 로그인 (Google, Kakao) 작동
- [ ] 로그인 후 기본 설정 페이지 접근 가능
- [ ] 모든 컨테이너가 Docker Compose로 정상 구동
- [ ] Spring Boot와 Python 서버 간 기본 API 통신 성공
- [ ] 코드 리뷰 완료 및 main 브랜치 머지

---

## Backlog Refinement 프로세스

### 주간 Backlog Grooming (매주 금요일)
1. **다음 스프린트 Story 상세화**
   - Acceptance Criteria 구체화
   - 기술적 Risk 식별
   - 의존성 확인

2. **Story Point Re-estimation**
   - 개발 진행에 따른 복잡도 재평가
   - Velocity 기반 조정

3. **우선순위 재검토**
   - 사용자 피드백 반영
   - 비즈니스 가치 재평가

### 스프린트 회고 및 계획 조정
**매 스프린트 종료 시**:
1. Velocity 측정 및 다음 스프린트 계획량 조정
2. 기술적 부채 식별 및 해결 계획
3. 팀 워킹 방식 개선 사항 도출

---

## Risk Mitigation

### 기술적 위험 관리
1. **AI 모델 성능**: 초기에는 간단한 모델로 시작, 점진적 개선
2. **오픈뱅킹 연동**: Sandbox 환경에서 충분한 테스트
3. **실시간 처리**: 비동기 처리와 캐싱으로 성능 확보

### 일정 위험 관리
1. **기능 범위 조정**: 우선순위 기반으로 필요시 기능 축소
2. **기술 스파이크**: 복잡한 기술은 별도 조사 시간 확보
3. **버퍼 시간**: 각 스프린트 마지막에 1-2일 버퍼 포함
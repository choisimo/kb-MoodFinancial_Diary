# Epics and User Stories

## Epic 1: 사용자 인증 및 기본 설정
**목표**: 안전하고 편리한 사용자 온보딩 경험 제공

### User Stories

#### US-001: 회원가입
**As a** 새로운 사용자
**I want to** 간편하게 회원가입을 할 수 있기를
**So that** 서비스를 이용할 수 있다

**Acceptance Criteria**:
- 이메일, 비밀번호로 회원가입 가능
- 소셜 로그인 (Google, Kakao) 지원
- 이메일 인증 필수
- 개인정보 처리방침 동의 필수

**Story Points**: 5

#### US-002: 로그인/로그아웃
**As a** 등록된 사용자
**I want to** 안전하게 로그인/로그아웃할 수 있기를
**So that** 내 개인 데이터에 접근할 수 있다

**Acceptance Criteria**:
- 이메일/비밀번호 로그인
- 소셜 로그인
- 자동 로그인 옵션
- 안전한 로그아웃

**Story Points**: 3

#### US-003: 초기 설정
**As a** 신규 사용자
**I want to** 개인 맞춤 설정을 할 수 있기를
**So that** 개인화된 서비스를 받을 수 있다

**Acceptance Criteria**:
- 닉네임 설정
- 금융 목표 설정
- 알림 설정
- 오픈뱅킹 연동 여부 선택

**Story Points**: 8

---

## Epic 2: 감정-소비 통합 다이어리
**목표**: 사용자가 쉽게 일상과 소비를 기록할 수 있는 환경 제공

### User Stories

#### US-004: 일기 작성
**As a** 사용자
**I want to** 다양한 방식으로 일기를 작성할 수 있기를
**So that** 그날의 감정과 사건을 기록할 수 있다

**Acceptance Criteria**:
- 텍스트 입력
- 음성 입력 (STT)
- 사진 첨부
- 5단계 감정 선택
- 임시저장 기능

**Story Points**: 13

#### US-005: 가계부 자동 연동
**As a** 사용자
**I want to** 내 소비 내역이 자동으로 기록되기를
**So that** 번거로운 수동 입력 없이 가계부를 관리할 수 있다

**Acceptance Criteria**:
- 오픈뱅킹 API 연동
- 자동 카테고리 분류
- 수동 수정 가능
- 연동 계좌 관리

**Story Points**: 21

#### US-006: 타임라인 뷰
**As a** 사용자
**I want to** 내 일기와 소비 내역을 시간순으로 볼 수 있기를
**So that** 특정 날짜의 상황을 쉽게 파악할 수 있다

**Acceptance Criteria**:
- 캘린더 뷰
- 리스트 뷰
- 날짜별 감정/소비 요약
- 상세 내역 조회

**Story Points**: 8

#### US-007: 일기/가계부 수정/삭제
**As a** 사용자
**I want to** 작성한 내용을 수정하거나 삭제할 수 있기를
**So that** 정확한 기록을 유지할 수 있다

**Acceptance Criteria**:
- 일기 수정/삭제
- 소비 내역 수정/삭제
- 변경 이력 관리
- 실수 방지를 위한 확인 단계

**Story Points**: 5

---

## Epic 3: AI 패턴 분석 및 피드백
**목표**: 사용자의 감정-소비 패턴을 분석하여 의미 있는 인사이트 제공

### User Stories

#### US-008: 패턴 분석
**As a** 사용자
**I want to** 내 감정과 소비의 연관성을 분석받기를
**So that** 나의 소비 패턴을 객관적으로 이해할 수 있다

**Acceptance Criteria**:
- 주간/월간 패턴 분석
- 감정-소비 상관관계 발견
- 통계적 유의성 확인
- 시각적 데이터 표현

**Story Points**: 21

#### US-009: 멀티 에이전트 피드백
**As a** 사용자
**I want to** 내 소비 패턴에 대한 다양한 관점의 해석을 받기를
**So that** 균형 잡힌 시각으로 자신을 이해할 수 있다

**Acceptance Criteria**:
- 3가지 페르소나 에이전트
- 각각 다른 관점의 조언
- 개인화된 메시지
- 건설적인 피드백

**Story Points**: 13

#### US-010: 인사이트 리포트
**As a** 사용자
**I want to** 정기적으로 종합 분석 리포트를 받기를
**So that** 내 진전 상황을 확인하고 목표를 조정할 수 있다

**Acceptance Criteria**:
- 주간/월간 리포트 생성
- 핵심 인사이트 요약
- 시각적 차트 제공
- 개선 제안 포함

**Story Points**: 8

---

## Epic 4: 이미지 분석 기능
**목표**: 이미지를 통한 편리한 기록과 심층적인 데이터 추출

### User Stories

#### US-011: 이미지 자동 분류
**As a** 사용자
**I want to** 업로드한 이미지가 자동으로 분류되기를
**So that** 적절한 처리 방식이 적용될 수 있다

**Acceptance Criteria**:
- 얼굴, 영수증, 사물, 풍경 구분
- 95% 이상 정확도
- 3초 이내 처리
- 오분류 시 수동 수정 가능

**Story Points**: 13

#### US-012: 표정 분석
**As a** 사용자
**I want to** 내 표정을 통해 감정이 자동으로 인식되기를
**So that** 감정 기록을 더 쉽게 할 수 있다

**Acceptance Criteria**:
- 7가지 기본 감정 인식
- 감정 확률값 제공
- 사용자 확인 후 저장
- 프라이버시 보호

**Story Points**: 13

#### US-013: 영수증 OCR
**As a** 사용자
**I want to** 영수증 사진으로 자동으로 가계부에 입력되기를
**So that** 수동 입력의 번거로움을 줄일 수 있다

**Acceptance Criteria**:
- 텍스트 추출 (OCR)
- 가맹점명, 금액, 날짜 파싱
- 자동 카테고리 분류
- 수동 수정 가능

**Story Points**: 21

#### US-014: 객체/상황 분석
**As a** 사용자
**I want to** 사진 속 객체와 상황이 분석되기를
**So that** 더 풍부한 컨텍스트 정보를 얻을 수 있다

**Acceptance Criteria**:
- 주요 객체 인식
- 상황/분위기 분석
- 해시태그 자동 생성
- 일기 내용과 연계

**Story Points**: 13

---

## Epic 5: 사전 예방 알림 및 개인화 코칭
**목표**: 충동구매를 예방하고 건강한 소비 습관 형성 지원

### User Stories

#### US-015: 위험 상황 감지
**As a** 사용자
**I want to** 충동구매 위험 상황이 감지되기를
**So that** 사전에 예방할 수 있다

**Acceptance Criteria**:
- 실시간 위험 패턴 감지
- 감정 상태 기반 예측
- 시간대별 위험도 분석
- 개인화된 임계값 설정

**Story Points**: 21

#### US-016: 예방 알림
**As a** 사용자
**I want to** 충동구매 직전에 알림을 받기를
**So that** 신중한 판단을 할 수 있다

**Acceptance Criteria**:
- 실시간 푸시 알림
- 구체적인 대안 제시
- 개인화된 메시지
- 알림 빈도 조절 가능

**Story Points**: 13

#### US-017: 맞춤형 챌린지
**As a** 사용자
**I want to** 나에게 맞는 챌린지를 받기를
**So that** 재미있게 습관을 개선할 수 있다

**Acceptance Criteria**:
- 개인 데이터 기반 챌린지 생성
- 성공 가능성 고려
- 단계별 난이도 조절
- 진행 상황 추적

**Story Points**: 13

#### US-018: 긍정 피드백
**As a** 사용자
**I want to** 좋은 행동에 대해 격려를 받기를
**So that** 지속적으로 동기를 유지할 수 있다

**Acceptance Criteria**:
- 성공 시 즉시 피드백
- 개인화된 격려 메시지
- 진전 상황 시각화
- 사용자 피드백 수집

**Story Points**: 8

---

## Epic 6: 보상 시스템 및 개인 설정
**목표**: 지속적 참여를 위한 동기 부여와 사용자 제어권 제공

### User Stories

#### US-019: 금융 건강 점수
**As a** 사용자
**I want to** 내 금융 건강 상태를 점수로 확인하기를
**So that** 개선 상황을 객관적으로 파악할 수 있다

**Acceptance Criteria**:
- 종합 점수 산정
- 항목별 세부 점수
- 월별 변화 추이
- 동일 연령대 비교

**Story Points**: 13

#### US-020: 포인트 및 보상
**As a** 사용자
**I want to** 좋은 습관에 대해 실질적인 보상을 받기를
**So that** 지속적으로 동기를 유지할 수 있다

**Acceptance Criteria**:
- 목표 달성 시 포인트 적립
- 다양한 보상 옵션
- 쿠폰 교환 기능
- 투명한 적립 기준

**Story Points**: 13

#### US-021: 개인 설정 관리
**As a** 사용자
**I want to** 내 개인 설정을 자유롭게 조절하기를
**So that** 내가 원하는 방식으로 서비스를 이용할 수 있다

**Acceptance Criteria**:
- 알림 설정 조절
- 개인정보 관리
- 연동 계좌 관리
- 서비스 해지 옵션

**Story Points**: 8

#### US-022: 데이터 내보내기/삭제
**As a** 사용자
**I want to** 내 데이터를 안전하게 관리하기를
**So that** 개인정보를 통제할 수 있다

**Acceptance Criteria**:
- 데이터 백업/내보내기
- 선택적 데이터 삭제
- 완전 탈퇴 시 전체 삭제
- 처리 과정 투명성

**Story Points**: 8

---

## Story Points 총합
- Epic 1 (인증/설정): 16 points
- Epic 2 (다이어리): 47 points  
- Epic 3 (AI 분석): 42 points
- Epic 4 (이미지 분석): 60 points
- Epic 5 (예방/코칭): 55 points
- Epic 6 (보상/설정): 42 points

**총 스토리 포인트**: 262 points
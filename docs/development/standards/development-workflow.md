# 개발 워크플로우 및 표준

## Git 워크플로우

### 브랜치 전략 (Git Flow 변형)

#### 주요 브랜치
- **main**: 프로덕션 릴리즈 브랜치 (항상 배포 가능한 상태)
- **develop**: 개발 통합 브랜치 (다음 릴리즈를 위한 기능들이 통합)
- **feature/***: 기능 개발 브랜치
- **hotfix/***: 긴급 수정 브랜치
- **release/***: 릴리즈 준비 브랜치

#### 브랜치 명명 규칙
```
feature/[epic-id]-[story-id]-[간단한-설명]
hotfix/[이슈번호]-[간단한-설명]
release/v[버전번호]

예시:
feature/EP1-US001-user-authentication
feature/EP2-US004-diary-crud
hotfix/BUG-001-login-security-fix
release/v1.0.0
```

### 커밋 메시지 규칙

#### 커밋 메시지 형식
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 분류
- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 수정
- **style**: 코드 포맷팅, 세미콜론 누락 등
- **refactor**: 코드 리팩토링
- **test**: 테스트 추가/수정
- **chore**: 빌드 과정 또는 보조 도구 수정

#### 예시
```
feat(auth): 소셜 로그인 기능 추가

Google OAuth 2.0과 Kakao 로그인 연동 구현
- AuthController에 소셜 로그인 엔드포인트 추가
- JWT 토큰 생성 로직 통합
- 사용자 정보 자동 생성 기능

Closes #US-001
```

### Pull Request 프로세스

#### PR 생성 전 체크리스트
- [ ] feature 브랜치가 최신 develop과 동기화
- [ ] 모든 테스트 통과
- [ ] 코드 lint 검사 통과
- [ ] 커밋 메시지 규칙 준수
- [ ] 관련 문서 업데이트

#### PR 템플릿
```markdown
## 변경 사항 요약
- 주요 변경 사항을 간략히 설명

## 관련 이슈
- Closes #US-XXX
- Fixes #BUG-XXX

## 테스트 계획
- [ ] 단위 테스트 추가
- [ ] 통합 테스트 확인
- [ ] 수동 테스트 완료

## 스크린샷 (UI 변경 시)
- Before/After 스크린샷 첨부

## 체크리스트
- [ ] 코드 리뷰 준비 완료
- [ ] 테스트 커버리지 확인
- [ ] 문서 업데이트 완료
```

#### 코드 리뷰 가이드라인
**리뷰어 책임**:
- 24시간 이내 초기 피드백 제공
- 기능 요구사항 충족 여부 확인
- 코드 품질 및 아키텍처 검토
- 보안 및 성능 이슈 점검

**PR 작성자 책임**:
- 충분한 설명과 컨텍스트 제공
- 피드백에 대한 적극적 대응
- 필요시 추가 설명 및 수정 사항 반영

---

## 코딩 표준

### Java/Spring Boot 코딩 표준

#### 패키지 구조
```
com.moodfinance
├── config/          # 설정 클래스
├── controller/       # REST 컨트롤러
├── service/         # 비즈니스 로직
├── repository/      # 데이터 액세스
├── entity/          # JPA 엔티티
├── dto/             # 데이터 전송 객체
├── exception/       # 예외 클래스
├── util/            # 유틸리티 클래스
└── security/        # 보안 관련 클래스
```

#### 네이밍 규칙
**클래스명**: PascalCase
```java
public class UserService { }
public class AuthController { }
public class DiaryRepository { }
```

**메서드명**: camelCase, 동사로 시작
```java
public User createUser() { }
public List<Diary> findDiariesByUserId() { }
public boolean isValidPassword() { }
```

**상수명**: UPPER_SNAKE_CASE
```java
public static final String DEFAULT_ROLE = "USER";
public static final int MAX_LOGIN_ATTEMPTS = 5;
```

#### 코드 스타일
**어노테이션 순서**:
```java
@RestController
@RequestMapping("/api/v1/users")
@Validated
@Slf4j
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<User> createUser(@Valid @RequestBody UserDto userDto) {
        // 구현
    }
}
```

**예외 처리**:
```java
@Service
@Transactional
public class UserService {
    
    public User createUser(UserDto userDto) {
        try {
            // 비즈니스 로직
            return userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new DuplicateUserException("이미 존재하는 사용자입니다.", e);
        }
    }
}
```

### React/JavaScript 코딩 표준

#### 파일 구조
```
src/
├── components/      # 재사용 가능한 컴포넌트
│   ├── common/     # 공통 컴포넌트
│   └── specific/   # 특정 기능 컴포넌트
├── pages/          # 페이지 컴포넌트
├── hooks/          # 커스텀 훅
├── services/       # API 서비스
├── utils/          # 유틸리티 함수
├── styles/         # 스타일 파일
└── constants/      # 상수 정의
```

#### 컴포넌트 네이밍
**파일명**: PascalCase
```
UserProfile.jsx
DiaryList.jsx
AuthForm.jsx
```

**함수형 컴포넌트 템플릿**:
```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './UserProfile.css';

const UserProfile = ({ userId, onUpdate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 컴포넌트 마운트 시 실행될 로직
  }, [userId]);

  const handleUpdate = (userData) => {
    // 이벤트 핸들러
    onUpdate(userData);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-profile">
      {/* JSX 내용 */}
    </div>
  );
};

UserProfile.propTypes = {
  userId: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default UserProfile;
```

#### 훅 사용 규칙
**커스텀 훅 예시**:
```jsx
// hooks/useAuth.js
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};
```

### Python/FastAPI 코딩 표준

#### 프로젝트 구조
```
app/
├── api/
│   ├── v1/         # API 버전별 라우터
│   └── deps.py     # 의존성 주입
├── core/
│   ├── config.py   # 설정
│   └── security.py # 보안 관련
├── models/         # 데이터 모델
├── services/       # 비즈니스 로직
├── utils/          # 유틸리티 함수
└── main.py         # 애플리케이션 진입점
```

#### 네이밍 규칙
**파일명/모듈명**: snake_case
```python
user_service.py
emotion_analyzer.py
image_processor.py
```

**클래스명**: PascalCase
```python
class EmotionAnalyzer:
    def __init__(self):
        pass

class ImageProcessor:
    def process_image(self, image_data):
        pass
```

**함수명/변수명**: snake_case
```python
def analyze_emotion(image_path):
    emotion_scores = {}
    return emotion_scores

def extract_text_from_receipt(image_data):
    extracted_text = ""
    return extracted_text
```

#### 타입 힌트 사용
```python
from typing import List, Dict, Optional
from pydantic import BaseModel

class UserEmotion(BaseModel):
    user_id: str
    emotion: str
    confidence: float
    timestamp: datetime

async def analyze_user_emotion(
    image_data: bytes,
    user_id: str
) -> Optional[UserEmotion]:
    # 구현
    pass

def get_emotion_history(
    user_id: str,
    limit: int = 10
) -> List[UserEmotion]:
    # 구현
    pass
```

---

## 데이터베이스 표준

### 네이밍 규칙

#### 테이블명
- snake_case 사용
- 복수형 사용
```sql
users
diaries
user_emotions
expense_categories
```

#### 컬럼명
- snake_case 사용
- 명확하고 의미있는 이름
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 인덱스명
```sql
-- 형식: idx_[테이블명]_[컬럼명]
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_diaries_user_id_created_at ON diaries(user_id, created_at);
```

#### 외래키명
```sql
-- 형식: fk_[테이블명]_[참조테이블명]
ALTER TABLE diaries 
ADD CONSTRAINT fk_diaries_users 
FOREIGN KEY (user_id) REFERENCES users(id);
```

### 마이그레이션 관리

#### 파일명 규칙
```
V[버전]__[설명].sql

예시:
V001__create_users_table.sql
V002__add_user_settings_table.sql
V003__add_emotion_index.sql
```

#### 마이그레이션 스크립트 템플릿
```sql
-- V001__create_users_table.sql
-- Description: 사용자 기본 테이블 생성
-- Author: Developer A
-- Date: 2025-08-05

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 기본 데이터 삽입 (필요시)
INSERT INTO users (email, password_hash, nickname) 
VALUES ('admin@moodfinance.com', '$2a$10$...', 'Admin');
```

---

## API 설계 표준

### REST API 설계 원칙

#### URL 구조
```
/api/v1/[리소스]/[식별자]/[하위리소스]

예시:
GET    /api/v1/users              # 사용자 목록 조회
POST   /api/v1/users              # 사용자 생성
GET    /api/v1/users/{id}         # 특정 사용자 조회
PUT    /api/v1/users/{id}         # 사용자 정보 수정
DELETE /api/v1/users/{id}         # 사용자 삭제

GET    /api/v1/users/{id}/diaries # 특정 사용자의 일기 목록
POST   /api/v1/diaries            # 일기 생성
```

#### HTTP 상태 코드 사용
```
200 OK          # 성공적인 GET, PUT
201 Created     # 성공적인 POST
204 No Content  # 성공적인 DELETE
400 Bad Request # 잘못된 요청
401 Unauthorized # 인증 실패
403 Forbidden   # 권한 없음
404 Not Found   # 리소스 없음
409 Conflict    # 중복 리소스
422 Unprocessable Entity # 유효성 검증 실패
500 Internal Server Error # 서버 오류
```

#### 응답 형식 표준화
```json
// 성공 응답
{
  "success": true,
  "data": {
    "id": 1,
    "name": "사용자명"
  },
  "message": "Success"
}

// 목록 응답
{
  "success": true,
  "data": [
    {"id": 1, "name": "항목1"},
    {"id": 2, "name": "항목2"}
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "message": "Success"
}

// 오류 응답
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "details": [
      {
        "field": "email",
        "message": "이메일 형식이 올바르지 않습니다."
      }
    ]
  }
}
```

### API 문서화

#### Swagger/OpenAPI 어노테이션
```java
@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User", description = "사용자 관리 API")
public class UserController {

    @PostMapping
    @Operation(summary = "사용자 생성", description = "새로운 사용자를 생성합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "사용자 생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "409", description = "이미 존재하는 이메일")
    })
    public ResponseEntity<UserResponse> createUser(
        @Valid @RequestBody 
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "사용자 생성 정보"
        ) 
        UserCreateRequest request
    ) {
        // 구현
    }
}
```

---

## 테스트 표준

### 테스트 구조

#### 단위 테스트
```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("이메일로 사용자 조회 - 성공")
    void findByEmail_Success() {
        // Given
        String email = "test@example.com";
        User expectedUser = User.builder()
            .email(email)
            .nickname("testuser")
            .build();
        
        when(userRepository.findByEmail(email))
            .thenReturn(Optional.of(expectedUser));

        // When
        User actualUser = userService.findByEmail(email);

        // Then
        assertThat(actualUser).isNotNull();
        assertThat(actualUser.getEmail()).isEqualTo(email);
        verify(userRepository).findByEmail(email);
    }

    @Test
    @DisplayName("존재하지 않는 이메일로 조회 - 예외 발생")
    void findByEmail_NotFound_ThrowsException() {
        // Given
        String email = "nonexistent@example.com";
        when(userRepository.findByEmail(email))
            .thenReturn(Optional.empty());

        // When & Then
        assertThrows(UserNotFoundException.class, 
            () -> userService.findByEmail(email));
    }
}
```

#### 통합 테스트
```java
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class UserControllerIntegrationTest {

    @Container
    static MariaDBContainer<?> mariaDB = new MariaDBContainer<>("mariadb:10.6")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    @DisplayName("사용자 생성 API 통합 테스트")
    void createUser_IntegrationTest() {
        // Given
        UserCreateRequest request = UserCreateRequest.builder()
            .email("test@example.com")
            .password("password123")
            .nickname("testuser")
            .build();

        // When
        ResponseEntity<UserResponse> response = restTemplate.postForEntity(
            "/api/v1/users", 
            request, 
            UserResponse.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getEmail()).isEqualTo("test@example.com");
    }
}
```

### 프론트엔드 테스트

#### 컴포넌트 테스트 (React Testing Library)
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  test('사용자 정보를 올바르게 표시한다', () => {
    // Given
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      nickname: 'testuser'
    };

    // When
    render(<UserProfile user={mockUser} />);

    // Then
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  test('수정 버튼 클릭 시 수정 모드로 전환된다', async () => {
    // Given
    const mockUser = { id: '1', email: 'test@example.com', nickname: 'testuser' };
    const mockOnUpdate = jest.fn();
    const user = userEvent.setup();

    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);

    // When
    const editButton = screen.getByRole('button', { name: '수정' });
    await user.click(editButton);

    // Then
    expect(screen.getByRole('textbox', { name: '닉네임' })).toBeInTheDocument();
  });
});
```

---

## 보안 표준

### 인증 및 인가

#### JWT 토큰 구조
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user123",
    "email": "user@example.com",
    "roles": ["USER"],
    "iat": 1640995200,
    "exp": 1641081600
  }
}
```

#### 보안 헤더 설정
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .headers(headers -> headers
                .frameOptions().deny()
                .contentTypeOptions()
                .and()
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                    .includeSubdomains(true)
                )
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        
        return http.build();
    }
}
```

### 데이터 보안

#### 암호화 표준
```java
@Component
public class PasswordEncoder {
    
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    
    public String encode(String rawPassword) {
        return encoder.encode(rawPassword);
    }
    
    public boolean matches(String rawPassword, String encodedPassword) {
        return encoder.matches(rawPassword, encodedPassword);
    }
}
```

#### 민감 데이터 처리
```java
@Entity
@Table(name = "users")
public class User {
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "password_hash")
    @JsonIgnore  // JSON 응답에서 제외
    private String passwordHash;
    
    @Column(name = "phone")
    @Convert(converter = PhoneNumberConverter.class)  // 암호화 컨버터
    private String phone;
}
```

---

## 성능 최적화 표준

### 데이터베이스 최적화

#### 쿼리 최적화
```java
@Repository
public class DiaryRepository {
    
    // N+1 문제 해결을 위한 Fetch Join
    @Query("SELECT d FROM Diary d JOIN FETCH d.user WHERE d.user.id = :userId")
    List<Diary> findDiariesWithUserByUserId(@Param("userId") Long userId);
    
    // 페이징과 정렬
    @Query("SELECT d FROM Diary d WHERE d.user.id = :userId ORDER BY d.createdAt DESC")
    Page<Diary> findDiariesByUserIdOrderByCreatedAtDesc(
        @Param("userId") Long userId, 
        Pageable pageable
    );
}
```

#### 캐싱 전략
```java
@Service
public class UserService {
    
    @Cacheable(value = "users", key = "#userId")
    public User findById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
    }
    
    @CacheEvict(value = "users", key = "#user.id")
    public User updateUser(User user) {
        return userRepository.save(user);
    }
}
```

### 프론트엔드 최적화

#### 컴포넌트 최적화
```jsx
import { memo, useMemo, useCallback } from 'react';

const DiaryList = memo(({ diaries, onDiaryClick }) => {
  const sortedDiaries = useMemo(() => 
    diaries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [diaries]
  );

  const handleClick = useCallback((diary) => {
    onDiaryClick(diary);
  }, [onDiaryClick]);

  return (
    <div>
      {sortedDiaries.map(diary => (
        <DiaryItem 
          key={diary.id} 
          diary={diary} 
          onClick={handleClick}
        />
      ))}
    </div>
  );
});
```

---

## 배포 및 운영 표준

### CI/CD 파이프라인

#### GitHub Actions 워크플로우
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
        
    - name: Run tests
      run: ./gradlew test
      
    - name: Run security scan
      run: ./gradlew dependencyCheckAnalyze

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Build Docker image
      run: docker build -t moodfinance:latest .
      
    - name: Deploy to staging
      run: |
        # 배포 스크립트 실행
```

### 모니터링 및 로깅

#### 로깅 표준
```java
@Slf4j
@RestController
public class UserController {
    
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody UserDto userDto) {
        log.info("사용자 생성 요청: email={}", userDto.getEmail());
        
        try {
            User user = userService.createUser(userDto);
            log.info("사용자 생성 완료: userId={}, email={}", 
                user.getId(), user.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (Exception e) {
            log.error("사용자 생성 실패: email={}, error={}", 
                userDto.getEmail(), e.getMessage(), e);
            throw e;
        }
    }
}
```


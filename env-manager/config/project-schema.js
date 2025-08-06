/**
 * KB 감정다이어리 프로젝트 환경변수 스키마
 * 프론트엔드-백엔드 간 일관성 보장을 위한 설정
 */

const PROJECT_SCHEMA = {
  projectName: 'kb-mood-financial-diary',
  projectRoot: process.env.PROJECT_ROOT || '/home/nodove/workspace/kb-MoodFinancial_Diary',
  
  // 환경변수 카테고리별 분류
  categories: {
    DATABASE: {
      description: '데이터베이스 설정',
      variables: [
        'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_ROOT_PASSWORD'
      ]
    },
    REDIS: {
      description: 'Redis 캐시 설정',
      variables: [
        'REDIS_HOST', 'REDIS_PORT', 'REDIS_PASSWORD'
      ]
    },
    AUTH: {
      description: '인증 및 JWT 설정',
      variables: [
        'JWT_SECRET'
      ]
    },
    OAUTH: {
      description: 'OAuth 소셜 로그인 설정',
      variables: [
        'OAUTH2_GOOGLE_CLIENT_ID', 'OAUTH2_GOOGLE_CLIENT_SECRET',
        'OAUTH2_KAKAO_CLIENT_ID', 'OAUTH2_KAKAO_CLIENT_SECRET',
        'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
        'KAKAO_CLIENT_ID', 'KAKAO_CLIENT_SECRET'
      ]
    },
    API: {
      description: 'API 및 외부 서비스',
      variables: [
        'VITE_KAKAO_MAP_KEY'
      ]
    },
    SERVER: {
      description: '서버 설정',
      variables: [
        'BACKEND_PORT', 'FRONTEND_PORT', 'NGINX_PORT', 'NGINX_SSL_PORT',
        'SPRING_PROFILES_ACTIVE', 'CORS_ALLOWED_ORIGINS'
      ]
    },
    URL: {
      description: 'URL 및 엔드포인트',
      variables: [
        'VITE_API_BASE_URL', 'REACT_APP_API_URL', 'FRONTEND_URL'
      ]
    },
    FILE: {
      description: '파일 업로드 설정',
      variables: [
        'UPLOAD_PATH', 'MAX_FILE_SIZE'
      ]
    },
    MAIL: {
      description: '이메일 설정',
      variables: [
        'MAIL_HOST', 'MAIL_PORT', 'MAIL_USERNAME', 'MAIL_PASSWORD'
      ]
    }
  },

  // 환경별 파일 구조
  environments: {
    development: {
      files: [
        {
          path: '.env.example',
          type: 'root',
          description: 'Docker compose 환경변수 템플릿'
        },
        {
          path: 'frontend/.env.example',
          type: 'frontend',
          description: '프론트엔드 환경변수 템플릿'
        },
        {
          path: 'backend-main/.env.example', 
          type: 'backend',
          description: '백엔드 환경변수 템플릿'
        }
      ]
    },
    production: {
      files: [
        {
          path: '.env',
          type: 'root',
          description: 'Docker compose 환경변수 (운영)'
        },
        {
          path: 'frontend/.env',
          type: 'frontend', 
          description: '프론트엔드 환경변수 (운영)'
        },
        {
          path: 'backend-main/.env',
          type: 'backend',
          description: '백엔드 환경변수 (운영)'
        }
      ]
    }
  },

  // 변수간 매핑 (일관성 체크용)
  variableMappings: {
    // API URL 매핑
    'VITE_API_BASE_URL': {
      relatedTo: ['REACT_APP_API_URL'],
      defaultValue: 'http://localhost:8090',
      validation: /^https?:\/\/.+/
    },
    'FRONTEND_URL': {
      relatedTo: ['CORS_ALLOWED_ORIGINS'],
      defaultValue: 'http://localhost:8084',
      validation: /^https?:\/\/.+/
    },
    
    // DB 설정 매핑
    'DB_HOST': {
      defaultValue: 'localhost',
      required: true
    },
    'DB_PORT': {
      defaultValue: '3306',
      validation: /^\d+$/
    },
    'DB_NAME': {
      alternativeNames: ['kb_mood_diary', 'mood_diary'],
      required: true
    },
    
    // Redis 설정 매핑
    'REDIS_HOST': {
      defaultValue: 'localhost'
    },
    'REDIS_PORT': {
      defaultValue: '6379',
      validation: /^\d+$/
    },
    
    // JWT 설정
    'JWT_SECRET': {
      required: true,
      validation: /.{32,}/,
      description: '최소 32자 이상의 비밀키'
    },
    
    // OAuth 설정
    'OAUTH2_KAKAO_CLIENT_ID': {
      relatedTo: ['KAKAO_CLIENT_ID'],
      required: false
    },
    'OAUTH2_KAKAO_CLIENT_SECRET': {
      relatedTo: ['KAKAO_CLIENT_SECRET'],
      required: false
    },
    'OAUTH2_GOOGLE_CLIENT_ID': {
      relatedTo: ['GOOGLE_CLIENT_ID'],
      required: false
    },
    'OAUTH2_GOOGLE_CLIENT_SECRET': {
      relatedTo: ['GOOGLE_CLIENT_SECRET'],
      required: false
    }
  },

  // 검증 규칙
  validationRules: {
    required: ['DB_HOST', 'DB_NAME', 'JWT_SECRET'],
    numeric: ['DB_PORT', 'REDIS_PORT', 'BACKEND_PORT', 'FRONTEND_PORT'],
    url: ['VITE_API_BASE_URL', 'REACT_APP_API_URL', 'FRONTEND_URL'],
    email: ['MAIL_USERNAME'],
    minLength: {
      'JWT_SECRET': 32,
      'DB_PASSWORD': 8
    }
  },

  // 기본값 설정
  defaults: {
    'DB_HOST': 'localhost',
    'DB_PORT': '3306',
    'REDIS_HOST': 'localhost', 
    'REDIS_PORT': '6379',
    'BACKEND_PORT': '8080',
    'FRONTEND_PORT': '3000',
    'NGINX_PORT': '80',
    'NGINX_SSL_PORT': '443',
    'VITE_API_BASE_URL': 'http://localhost:8090',
    'FRONTEND_URL': 'http://localhost:8084',
    'SPRING_PROFILES_ACTIVE': 'dev',
    'UPLOAD_PATH': './uploads',
    'MAX_FILE_SIZE': '10MB',
    'MAIL_HOST': 'smtp.gmail.com',
    'MAIL_PORT': '587'
  }
};

module.exports = PROJECT_SCHEMA;
import { useConfig } from '../contexts/ConfigContext';

export const useInfisicalConfig = () => {
  const { getSecret, secrets, isLoading, error, refreshSecrets } = useConfig();

  // API 관련 설정
  const getApiBaseUrl = () => getSecret('API_BASE_URL', 'http://localhost:8090');
  
  // Kakao Map API 키
  const getKakaoMapKey = () => getSecret('KAKAO_MAP_KEY', '');
  
  // OAuth 설정
  const getGoogleClientId = () => getSecret('GOOGLE_OAUTH_CLIENT_ID', '');
  const getKakaoClientId = () => getSecret('KAKAO_OAUTH_CLIENT_ID', '');
  
  // 기타 API 키들
  const getOpenAIApiKey = () => getSecret('OPENAI_API_KEY', '');
  const getPaymentApiKey = () => getSecret('PAYMENT_API_KEY', '');
  
  // 애플리케이션 설정
  const getAppTitle = () => getSecret('APP_TITLE', 'KB 감정 다이어리');
  const getAppVersion = () => getSecret('APP_VERSION', '1.0.0');
  
  // 개발/디버그 설정
  const isDebugMode = () => getSecret('DEBUG_MODE', 'false') === 'true';
  const getLogLevel = () => getSecret('LOG_LEVEL', 'info');

  return {
    // 설정 값들
    apiBaseUrl: getApiBaseUrl(),
    kakaoMapKey: getKakaoMapKey(),
    googleClientId: getGoogleClientId(),
    kakaoClientId: getKakaoClientId(),
    openAIApiKey: getOpenAIApiKey(),
    paymentApiKey: getPaymentApiKey(),
    appTitle: getAppTitle(),
    appVersion: getAppVersion(),
    debugMode: isDebugMode(),
    logLevel: getLogLevel(),
    
    // 헬퍼 함수들
    getSecret,
    
    // 상태 관리
    secrets,
    isLoading,
    error,
    refreshSecrets,
    
    // 유틸리티 함수들
    getters: {
      getApiBaseUrl,
      getKakaoMapKey,
      getGoogleClientId,
      getKakaoClientId,
      getOpenAIApiKey,
      getPaymentApiKey,
      getAppTitle,
      getAppVersion,
      isDebugMode,
      getLogLevel,
    }
  };
};

export default useInfisicalConfig;
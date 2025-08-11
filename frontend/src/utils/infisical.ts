import axios from 'axios';

export interface InfisicalSecret {
  [key: string]: string;
}

class InfisicalClient {
  private baseURL: string;
  private serviceToken: string;
  private projectId: string;
  private environment: string;
  private cache: Map<string, string> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시
  private isInfisicalEnabled: boolean;

  constructor() {
    this.baseURL = import.meta.env.VITE_INFISICAL_HOST || 'http://localhost:8222';
    this.serviceToken = import.meta.env.VITE_INFISICAL_SERVICE_TOKEN || '';
    this.projectId = import.meta.env.VITE_INFISICAL_PROJECT_ID || '';
    this.environment = import.meta.env.VITE_INFISICAL_ENVIRONMENT || 'dev';
    this.isInfisicalEnabled = import.meta.env.VITE_INFISICAL_ENABLED === 'true';
    
    if (!this.serviceToken || !this.projectId) {
      console.warn('Infisical not configured. Missing service token or project ID.');
      this.isInfisicalEnabled = false;
    }
  }

  private isEnabled(): boolean {
    return this.isInfisicalEnabled && Boolean(this.serviceToken && this.projectId);
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  async getSecret(secretKey: string, defaultValue?: string): Promise<string | null> {
    // 먼저 환경변수에서 확인 (로컬 개발시 우선순위)
    const envValue = import.meta.env[`VITE_${secretKey}`];
    if (envValue && envValue !== 'undefined') {
      return envValue;
    }

    if (!this.isEnabled()) {
      console.warn(`Infisical not enabled. Using default value for ${secretKey}`);
      return defaultValue || null;
    }

    // 캐시에서 확인
    if (this.cache.has(secretKey) && this.isCacheValid(secretKey)) {
      return this.cache.get(secretKey) || null;
    }

    try {
      const response = await axios.get(
        `${this.baseURL}/api/v3/secrets/${secretKey}`,
        {
          params: {
            workspaceId: this.projectId,
            environment: this.environment
          },
          headers: {
            'Authorization': `Bearer ${this.serviceToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const secretValue = response.data?.secret?.secretValue;
      
      if (secretValue) {
        // 캐시에 저장
        this.cache.set(secretKey, secretValue);
        this.cacheExpiry.set(secretKey, Date.now() + this.CACHE_DURATION);
        return secretValue;
      }

      console.warn(`Secret ${secretKey} not found in Infisical`);
      return defaultValue || null;
    } catch (error) {
      console.error(`Failed to fetch secret: ${secretKey}`, error);
      return defaultValue || null;
    }
  }

  async getAllSecrets(): Promise<InfisicalSecret> {
    if (!this.isEnabled()) {
      console.warn('Infisical not enabled. Returning empty secrets.');
      return this.getEnvironmentSecrets();
    }

    try {
      const response = await axios.get(
        `${this.baseURL}/api/v3/secrets`,
        {
          params: {
            workspaceId: this.projectId,
            environment: this.environment
          },
          headers: {
            'Authorization': `Bearer ${this.serviceToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const secrets: InfisicalSecret = {};
      const secretsArray = response.data?.secrets || [];

      secretsArray.forEach((secret: any) => {
        const key = secret.secretKey;
        const value = secret.secretValue;
        secrets[key] = value;
        
        // 캐시에도 저장
        this.cache.set(key, value);
        this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
      });

      // 환경변수와 병합 (환경변수가 우선순위)
      const envSecrets = this.getEnvironmentSecrets();
      return { ...secrets, ...envSecrets };
    } catch (error) {
      console.error('Failed to fetch all secrets', error);
      return this.getEnvironmentSecrets();
    }
  }

  private getEnvironmentSecrets(): InfisicalSecret {
    const secrets: InfisicalSecret = {};
    
    // VITE_ 프리픽스가 있는 환경변수들을 수집
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith('VITE_')) {
        const secretKey = key.replace('VITE_', '');
        const value = import.meta.env[key];
        if (value && value !== 'undefined') {
          secrets[secretKey] = value;
        }
      }
    });
    
    return secrets;
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    console.log('Infisical cache cleared');
  }

  async refreshSecret(secretKey: string): Promise<string | null> {
    this.cache.delete(secretKey);
    this.cacheExpiry.delete(secretKey);
    return await this.getSecret(secretKey);
  }

  // 환경변수를 Infisical 또는 기본값에서 가져오는 헬퍼 메서드
  async getEnvVar(key: string, defaultValue?: string): Promise<string> {
    // 먼저 브라우저 환경변수에서 확인
    const envValue = import.meta.env[`VITE_${key}`];
    if (envValue && envValue !== 'undefined') {
      return envValue;
    }

    // Infisical에서 시도
    const infisicalValue = await this.getSecret(key, defaultValue);
    return infisicalValue || defaultValue || '';
  }

  // 연결 상태 확인
  async healthCheck(): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      const response = await axios.get(
        `${this.baseURL}/api/status`,
        {
          timeout: 5000
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error('Infisical health check failed', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스 생성
const infisicalClient = new InfisicalClient();

export default infisicalClient;
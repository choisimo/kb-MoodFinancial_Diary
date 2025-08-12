import { InfisicalSDK } from '@infisical/sdk';

interface EnvironmentConfig {
  // API Configuration
  API_BASE_URL: string;
  AI_API_URL: string;
  
  // Authentication
  OAUTH_GOOGLE_CLIENT_ID: string;
  OAUTH_KAKAO_CLIENT_ID: string;
  
  // External Services
  KAKAO_MAP_KEY: string;
  
  // Application Settings
  APP_NAME: string;
  APP_VERSION: string;
  
  // Feature Flags
  ENABLE_ANALYTICS: boolean;
  ENABLE_DEBUG: boolean;
}

class EnvironmentManager {
  private static instance: EnvironmentManager;
  private config: EnvironmentConfig | null = null;
  private infisicalClient: InfisicalSDK | null = null;
  private initialized = false;
  
  private constructor() {}
  
  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }
  
  /**
   * Initialize the environment manager
   * This should be called once during application startup
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('🔧 Environment manager already initialized');
      return;
    }
    
    console.log('🚀 Initializing environment configuration...');
    
    try {
      // Initialize Infisical client if credentials are available
      await this.initializeInfisical();
      
      // Load configuration
      await this.loadConfiguration();
      
      // Validate configuration
      this.validateConfiguration();
      
      this.initialized = true;
      console.log('✅ Environment configuration initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize environment configuration:', error);
      
      // Fallback to process.env for local development
      console.warn('⚠️ Falling back to process.env configuration');
      this.loadFallbackConfiguration();
      this.initialized = true;
    }
  }
  
  /**
   * Initialize Infisical client
   */
  private async initializeInfisical(): Promise<void> {
    const clientId = process.env.REACT_APP_INFISICAL_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_INFISICAL_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.log('🔍 Infisical credentials not found, using local environment variables');
      return;
    }
    
    try {
      this.infisicalClient = new InfisicalSDK({
        clientId,
        clientSecret,
      });
      
      console.log('✅ Infisical client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Infisical client:', error);
      throw error;
    }
  }
  
  /**
   * Load configuration from Infisical or environment variables
   */
  private async loadConfiguration(): Promise<void> {
    if (this.infisicalClient) {
      await this.loadFromInfisical();
    } else {
      this.loadFallbackConfiguration();
    }
  }
  
  /**
   * Load configuration from Infisical
   */
  private async loadFromInfisical(): Promise<void> {
    if (!this.infisicalClient) {
      throw new Error('Infisical client not initialized');
    }
    
    const environment = process.env.NODE_ENV || 'development';
    const projectId = process.env.REACT_APP_INFISICAL_PROJECT_ID;
    
    if (!projectId) {
      throw new Error('REACT_APP_INFISICAL_PROJECT_ID not found');
    }
    
    try {
      console.log(`🔄 Loading secrets from Infisical for ${environment} environment...`);
      
      const secrets = await this.infisicalClient.listSecrets({
        environment,
        path: '/frontend',
        projectId,
      });
      
      // Convert secrets to configuration object
      const secretsMap: Record<string, string> = {};
      secrets.forEach(secret => {
        secretsMap[secret.secretKey] = secret.secretValue;
      });
      
      this.config = {
        API_BASE_URL: secretsMap.REACT_APP_API_BASE_URL || this.getDefaultApiUrl(environment),
        AI_API_URL: secretsMap.REACT_APP_AI_API_URL || this.getDefaultAiApiUrl(environment),
        OAUTH_GOOGLE_CLIENT_ID: secretsMap.OAUTH_GOOGLE_CLIENT_ID || '',
        OAUTH_KAKAO_CLIENT_ID: secretsMap.OAUTH_KAKAO_CLIENT_ID || '',
        KAKAO_MAP_KEY: secretsMap.VITE_KAKAO_MAP_KEY || '',
        APP_NAME: secretsMap.APP_NAME || 'MoodDiary',
        APP_VERSION: secretsMap.APP_VERSION || '1.0.0',
        ENABLE_ANALYTICS: this.parseBoolean(secretsMap.ENABLE_ANALYTICS, false),
        ENABLE_DEBUG: this.parseBoolean(secretsMap.ENABLE_DEBUG, environment === 'development'),
      };
      
      console.log(`✅ Loaded ${secrets.length} secrets from Infisical`);
      
    } catch (error) {
      console.error('❌ Failed to load secrets from Infisical:', error);
      throw error;
    }
  }
  
  /**
   * Load fallback configuration from process.env
   */
  private loadFallbackConfiguration(): void {
    const environment = process.env.NODE_ENV || 'development';
    
    this.config = {
      API_BASE_URL: process.env.REACT_APP_API_BASE_URL || this.getDefaultApiUrl(environment),
      AI_API_URL: process.env.REACT_APP_AI_API_URL || this.getDefaultAiApiUrl(environment),
      OAUTH_GOOGLE_CLIENT_ID: process.env.REACT_APP_OAUTH_GOOGLE_CLIENT_ID || '',
      OAUTH_KAKAO_CLIENT_ID: process.env.REACT_APP_OAUTH_KAKAO_CLIENT_ID || '',
      KAKAO_MAP_KEY: process.env.REACT_APP_KAKAO_MAP_KEY || '',
      APP_NAME: process.env.REACT_APP_NAME || 'MoodDiary',
      APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
      ENABLE_ANALYTICS: this.parseBoolean(process.env.REACT_APP_ENABLE_ANALYTICS, false),
      ENABLE_DEBUG: this.parseBoolean(process.env.REACT_APP_ENABLE_DEBUG, environment === 'development'),
    };
    
    console.log('📋 Loaded configuration from process.env');
  }
  
  /**
   * Get default API URL based on environment
   */
  private getDefaultApiUrl(environment: string): string {
    // Check if running in Docker environment
    const isDocker = window.location.hostname !== 'localhost' || window.location.port === '8080';
    
    switch (environment) {
      case 'production':
        return 'https://api.yourdomain.com';
      case 'staging':
        return 'https://staging-api.yourdomain.com';
      default:
        // In Docker environment, use nginx proxy (relative path)
        // In local development, use direct backend URL
        return isDocker ? '' : 'http://localhost:8090';
    }
  }
  
  /**
   * Get default AI API URL based on environment
   */
  private getDefaultAiApiUrl(environment: string): string {
    switch (environment) {
      case 'production':
        return 'https://ai.yourdomain.com';
      case 'staging':
        return 'https://staging-ai.yourdomain.com';
      default:
        return 'http://localhost:8085';
    }
  }
  
  /**
   * Parse boolean value from string
   */
  private parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
  }
  
  /**
   * Validate configuration
   */
  private validateConfiguration(): void {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    
    const requiredFields: (keyof EnvironmentConfig)[] = [
      'API_BASE_URL',
      'AI_API_URL',
      'APP_NAME',
    ];
    
    const missingFields = requiredFields.filter(field => !this.config![field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
    }
    
    console.log('✅ Configuration validation passed');
  }
  
  /**
   * Get configuration value
   */
  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    if (!this.initialized) {
      throw new Error('Environment manager not initialized. Call initialize() first.');
    }
    
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    
    const value = this.config[key];
    if (value === undefined || value === null || value === '') {
      console.warn(`⚠️ Configuration value for '${key}' is empty or undefined`);
    }
    
    return value;
  }
  
  /**
   * Get all configuration
   */
  public getAll(): EnvironmentConfig {
    if (!this.initialized) {
      throw new Error('Environment manager not initialized. Call initialize() first.');
    }
    
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    
    return { ...this.config };
  }
  
  /**
   * Check if environment manager is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Get current environment
   */
  public getEnvironment(): string {
    return process.env.NODE_ENV || 'development';
  }
  
  /**
   * Check if running in development mode
   */
  public isDevelopment(): boolean {
    return this.getEnvironment() === 'development';
  }
  
  /**
   * Check if running in production mode
   */
  public isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }
  
  /**
   * Refresh configuration (reload from Infisical)
   */
  public async refresh(): Promise<void> {
    console.log('🔄 Refreshing environment configuration...');
    this.initialized = false;
    this.config = null;
    await this.initialize();
  }
  
  /**
   * Get status information
   */
  public getStatus(): {
    initialized: boolean;
    environment: string;
    infisicalEnabled: boolean;
    configLoaded: boolean;
  } {
    return {
      initialized: this.initialized,
      environment: this.getEnvironment(),
      infisicalEnabled: this.infisicalClient !== null,
      configLoaded: this.config !== null,
    };
  }
}

// Export singleton instance
export const environmentManager = EnvironmentManager.getInstance();

// Export convenience functions
export const getConfig = <K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] => {
  return environmentManager.get(key);
};

export const getAllConfig = (): EnvironmentConfig => {
  return environmentManager.getAll();
};

export const isProduction = (): boolean => {
  return environmentManager.isProduction();
};

export const isDevelopment = (): boolean => {
  return environmentManager.isDevelopment();
};

export default environmentManager;

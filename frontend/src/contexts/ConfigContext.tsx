/**
 * Configuration Context (PRD Implementation)
 * 
 * React Context for managing environment configuration throughout the application.
 * Integrates with the new EnvironmentManager for centralized config management.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { environmentManager, getConfig, getAllConfig } from '../config/environment';

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

interface ConfigContextType {
  config: EnvironmentConfig | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  environment: string;
  
  // Methods
  refreshConfig: () => Promise<void>;
  getConfigValue: <K extends keyof EnvironmentConfig>(key: K) => EnvironmentConfig[K] | null;
  getStatus: () => any;
  
  // Convenience getters
  apiBaseUrl: string;
  aiApiUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<EnvironmentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<string>('development');

  const initializeConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔧 Initializing configuration context...');
      
      // Initialize environment manager
      await environmentManager.initialize();
      
      // Load configuration
      const loadedConfig = getAllConfig();
      setConfig(loadedConfig);
      
      // Set environment info
      setEnvironment(environmentManager.getEnvironment());
      setIsInitialized(true);
      
      console.log('✅ Configuration context initialized successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize configuration';
      setError(errorMessage);
      console.error('❌ Failed to initialize configuration:', err);
      
      // Set fallback configuration for development
      if (environmentManager.isDevelopment()) {
        console.warn('⚠️ Using fallback configuration for development');
        setConfig({
          API_BASE_URL: 'http://localhost:8090',
          AI_API_URL: 'http://localhost:8085',
          OAUTH_GOOGLE_CLIENT_ID: '',
          OAUTH_KAKAO_CLIENT_ID: '',
          KAKAO_MAP_KEY: '',
          APP_NAME: 'MoodDiary',
          APP_VERSION: '1.0.0',
          ENABLE_ANALYTICS: false,
          ENABLE_DEBUG: true,
        });
        setIsInitialized(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeConfig();
  }, []);

  const refreshConfig = async () => {
    console.log('🔄 Refreshing configuration...');
    await environmentManager.refresh();
    await initializeConfig();
  };

  const getConfigValue = <K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] | null => {
    if (!config) {
      console.warn(`⚠️ Configuration not loaded, cannot get value for '${key}'`);
      return null;
    }
    
    const value = config[key];
    if (value === undefined || value === null || value === '') {
      console.warn(`⚠️ Configuration value for '${key}' is empty or undefined`);
    }
    
    return value;
  };

  const getStatus = () => {
    return {
      ...environmentManager.getStatus(),
      contextInitialized: isInitialized,
      configLoaded: config !== null,
      hasError: error !== null,
      error,
    };
  };

  // Convenience getters
  const apiBaseUrl = config?.API_BASE_URL || 'http://localhost:8090';
  const aiApiUrl = config?.AI_API_URL || 'http://localhost:8085';
  const isProduction = environment === 'production';
  const isDevelopment = environment === 'development';

  const contextValue: ConfigContextType = {
    config,
    isLoading,
    isInitialized,
    error,
    environment,
    
    // Methods
    refreshConfig,
    getConfigValue,
    getStatus,
    
    // Convenience getters
    apiBaseUrl,
    aiApiUrl,
    isProduction,
    isDevelopment,
  };

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

/**
 * Hook to use configuration context
 */
export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

/**
 * Hook to get a specific configuration value
 */
export const useConfigValue = <K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] | null => {
  const { getConfigValue } = useConfig();
  return getConfigValue(key);
};

/**
 * Hook to get API base URL
 */
export const useApiBaseUrl = (): string => {
  const { apiBaseUrl } = useConfig();
  return apiBaseUrl;
};

/**
 * Hook to get AI API URL
 */
export const useAiApiUrl = (): string => {
  const { aiApiUrl } = useConfig();
  return aiApiUrl;
};

/**
 * Hook to check if running in production
 */
export const useIsProduction = (): boolean => {
  const { isProduction } = useConfig();
  return isProduction;
};

/**
 * Hook to check if running in development
 */
export const useIsDevelopment = (): boolean => {
  const { isDevelopment } = useConfig();
  return isDevelopment;
};

export default ConfigContext;
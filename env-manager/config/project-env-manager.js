const fs = require('fs-extra');
const path = require('path');
const PROJECT_SCHEMA = require('./project-schema');

/**
 * KB 감정다이어리 프로젝트 환경변수 동기화 관리자
 */
class ProjectEnvManager {
  constructor() {
    this.projectRoot = PROJECT_SCHEMA.projectRoot;
    this.schema = PROJECT_SCHEMA;
  }

  /**
   * 프로젝트의 모든 환경변수 파일 경로 반환
   */
  getProjectEnvFiles() {
    const files = [];
    
    Object.values(this.schema.environments).forEach(env => {
      env.files.forEach(file => {
        const fullPath = path.join(this.projectRoot, file.path);
        files.push({
          ...file,
          fullPath,
          exists: fs.existsSync(fullPath)
        });
      });
    });

    return files;
  }

  /**
   * 환경변수 파일 읽기 및 파싱
   */
  async readEnvFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return { variables: {}, rawContent: '' };
      }

      const content = await fs.readFile(filePath, 'utf8');
      return this.parseEnvContent(content);
    } catch (error) {
      throw new Error(`Failed to read ${filePath}: ${error.message}`);
    }
  }

  /**
   * 환경변수 내용 파싱
   */
  parseEnvContent(content) {
    const variables = {};
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmedLine.substring(0, equalIndex).trim();
          const value = trimmedLine.substring(equalIndex + 1).trim();
          variables[key] = {
            value: value.replace(/^["']|["']$/g, ''),
            lineNumber: index + 1,
            originalLine: line
          };
        }
      }
    });
    
    return { variables, rawContent: content };
  }

  /**
   * 모든 프로젝트 환경변수 상태 조회
   */
  async getProjectEnvStatus() {
    const files = this.getProjectEnvFiles();
    const envData = {};

    for (const file of files) {
      try {
        const data = await this.readEnvFile(file.fullPath);
        envData[file.type] = {
          ...file,
          ...data,
          variableCount: Object.keys(data.variables).length
        };
      } catch (error) {
        envData[file.type] = {
          ...file,
          error: error.message,
          variables: {},
          variableCount: 0
        };
      }
    }

    return envData;
  }

  /**
   * 환경변수 일관성 검증
   */
  validateConsistency(envData) {
    const issues = [];
    const mappings = this.schema.variableMappings;

    // 필수 변수 체크
    this.schema.validationRules.required.forEach(key => {
      const found = Object.values(envData).some(env => 
        env.variables && env.variables[key]
      );
      if (!found) {
        issues.push({
          type: 'missing_required',
          variable: key,
          message: `필수 환경변수 '${key}'가 없습니다.`
        });
      }
    });

    // 변수 매핑 일관성 체크
    Object.entries(mappings).forEach(([key, config]) => {
      if (config.relatedTo) {
        const mainVar = this.findVariableInEnvData(envData, key);
        
        config.relatedTo.forEach(relatedKey => {
          const relatedVar = this.findVariableInEnvData(envData, relatedKey);
          
          if (mainVar && relatedVar && mainVar.value !== relatedVar.value) {
            issues.push({
              type: 'inconsistent_mapping',
              variables: [key, relatedKey],
              values: [mainVar.value, relatedVar.value],
              message: `'${key}'와 '${relatedKey}' 값이 일치하지 않습니다.`
            });
          }
        });
      }

      // 검증 규칙 체크
      if (config.validation) {
        const variable = this.findVariableInEnvData(envData, key);
        if (variable && !config.validation.test(variable.value)) {
          issues.push({
            type: 'validation_failed',
            variable: key,
            value: variable.value,
            message: `'${key}' 값이 유효하지 않습니다.`
          });
        }
      }
    });

    // 숫자 타입 검증
    this.schema.validationRules.numeric.forEach(key => {
      const variable = this.findVariableInEnvData(envData, key);
      if (variable && !/^\d+$/.test(variable.value)) {
        issues.push({
          type: 'invalid_numeric',
          variable: key,
          value: variable.value,
          message: `'${key}'는 숫자여야 합니다.`
        });
      }
    });

    // URL 검증
    this.schema.validationRules.url.forEach(key => {
      const variable = this.findVariableInEnvData(envData, key);
      if (variable && !/^https?:\/\/.+/.test(variable.value)) {
        issues.push({
          type: 'invalid_url',
          variable: key,
          value: variable.value,
          message: `'${key}'는 유효한 URL이어야 합니다.`
        });
      }
    });

    return issues;
  }

  /**
   * 환경변수 데이터에서 특정 변수 찾기
   */
  findVariableInEnvData(envData, key) {
    for (const env of Object.values(envData)) {
      if (env.variables && env.variables[key]) {
        return env.variables[key];
      }
    }
    return null;
  }

  /**
   * 환경변수 동기화 제안 생성
   */
  generateSyncSuggestions(envData) {
    const suggestions = [];
    const mappings = this.schema.variableMappings;

    Object.entries(mappings).forEach(([key, config]) => {
      if (config.relatedTo) {
        const mainVar = this.findVariableInEnvData(envData, key);
        
        if (mainVar) {
          config.relatedTo.forEach(relatedKey => {
            const relatedVar = this.findVariableInEnvData(envData, relatedKey);
            
            if (!relatedVar) {
              suggestions.push({
                type: 'add_missing',
                sourceVariable: key,
                targetVariable: relatedKey,
                value: mainVar.value,
                message: `'${key}' 값을 '${relatedKey}'에 복사하는 것을 제안합니다.`
              });
            } else if (mainVar.value !== relatedVar.value) {
              suggestions.push({
                type: 'sync_values',
                sourceVariable: key,
                targetVariable: relatedKey,
                sourceValue: mainVar.value,
                targetValue: relatedVar.value,
                message: `'${key}' 값으로 '${relatedKey}'를 동기화하는 것을 제안합니다.`
              });
            }
          });
        }
      }

      // 기본값 제안
      if (config.defaultValue) {
        const variable = this.findVariableInEnvData(envData, key);
        if (!variable) {
          suggestions.push({
            type: 'add_default',
            variable: key,
            defaultValue: config.defaultValue,
            message: `'${key}'에 기본값 '${config.defaultValue}'를 설정하는 것을 제안합니다.`
          });
        }
      }
    });

    return suggestions;
  }

  /**
   * 환경변수 동기화 실행
   */
  async applySyncSuggestions(suggestions) {
    const results = [];
    const envData = await this.getProjectEnvStatus();

    for (const suggestion of suggestions) {
      try {
        switch (suggestion.type) {
          case 'add_missing':
          case 'sync_values':
            await this.syncVariable(
              envData,
              suggestion.targetVariable || suggestion.variable,
              suggestion.value || suggestion.sourceValue || suggestion.defaultValue
            );
            results.push({
              success: true,
              suggestion,
              message: '동기화 완료'
            });
            break;

          case 'add_default':
            await this.syncVariable(
              envData,
              suggestion.variable,
              suggestion.defaultValue
            );
            results.push({
              success: true,
              suggestion,
              message: '기본값 추가 완료'
            });
            break;
        }
      } catch (error) {
        results.push({
          success: false,
          suggestion,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * 특정 변수를 환경 파일에 동기화
   */
  async syncVariable(envData, variableName, value) {
    // 변수가 어느 환경 파일에 속해야 하는지 결정
    const targetFiles = this.determineTargetFiles(variableName);

    for (const fileType of targetFiles) {
      const envFile = envData[fileType];
      if (envFile && envFile.exists) {
        // 변수 업데이트
        if (!envFile.variables) {
          envFile.variables = {};
        }
        
        envFile.variables[variableName] = {
          value: value,
          lineNumber: Object.keys(envFile.variables).length + 1,
          originalLine: `${variableName}=${value}`
        };

        // 파일에 쓰기
        await this.writeEnvFile(envFile.fullPath, envFile.variables);
      }
    }
  }

  /**
   * 변수명을 기반으로 어느 파일에 속해야 하는지 결정
   */
  determineTargetFiles(variableName) {
    // VITE_ 접두사는 프론트엔드
    if (variableName.startsWith('VITE_') || variableName.startsWith('REACT_APP_')) {
      return ['frontend'];
    }

    // OAUTH2_ 접두사는 주로 백엔드
    if (variableName.startsWith('OAUTH2_')) {
      return ['backend'];
    }

    // DB, REDIS 관련은 백엔드와 루트
    if (variableName.startsWith('DB_') || variableName.startsWith('REDIS_')) {
      return ['backend', 'root'];
    }

    // 포트 관련은 루트
    if (variableName.includes('_PORT')) {
      return ['root'];
    }

    // 기본적으로 모든 파일
    return ['root', 'frontend', 'backend'];
  }

  /**
   * 환경변수 파일 쓰기
   */
  async writeEnvFile(filePath, variables) {
    let content = '';
    
    Object.entries(variables).forEach(([key, data]) => {
      const value = data && data.value !== undefined ? data.value : '';
      const needsQuotes = value.includes(' ') || value.includes('\n') || value.includes('\t');
      content += `${key}=${needsQuotes ? `"${value}"` : value}\n`;
    });

    await fs.writeFile(filePath, content, 'utf8');
  }

  /**
   * 프로젝트 환경변수 요약 리포트 생성
   */
  async generateReport() {
    const envData = await this.getProjectEnvStatus();
    const issues = this.validateConsistency(envData);
    const suggestions = this.generateSyncSuggestions(envData);

    return {
      summary: {
        totalFiles: Object.keys(envData).length,
        totalVariables: Object.values(envData).reduce((sum, env) => sum + env.variableCount, 0),
        issuesCount: issues.length,
        suggestionsCount: suggestions.length
      },
      files: envData,
      issues,
      suggestions,
      categories: this.categorizeVariables(envData)
    };
  }

  /**
   * 변수를 카테고리별로 분류
   */
  categorizeVariables(envData) {
    const categorized = {};
    
    Object.entries(this.schema.categories).forEach(([category, config]) => {
      categorized[category] = {
        description: config.description,
        variables: [],
        coverage: 0
      };

      config.variables.forEach(varName => {
        const found = this.findVariableInEnvData(envData, varName);
        categorized[category].variables.push({
          name: varName,
          value: found ? found.value : null,
          configured: !!found
        });
      });

      categorized[category].coverage = 
        categorized[category].variables.filter(v => v.configured).length / 
        categorized[category].variables.length;
    });

    return categorized;
  }
}

module.exports = ProjectEnvManager;
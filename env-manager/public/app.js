console.log('🚀 app.js 파일이 로드되었습니다');

class AIService {
    constructor() {
        this.apiKeys = this.loadAPIKeys();
        this.chatHistory = this.loadChatHistory();
        this.preferredModel = localStorage.getItem('ai_preferred_model') || 'openai/gpt-4o';
    }

    loadAPIKeys() {
        return {
            openai: localStorage.getItem('ai_openai_key') || '',
            gemini: localStorage.getItem('ai_gemini_key') || '',
            openrouter: localStorage.getItem('ai_openrouter_key') || ''
        };
    }

    saveAPIKeys(keys) {
        this.apiKeys = keys;
        if (keys.openai) localStorage.setItem('ai_openai_key', keys.openai);
        if (keys.gemini) localStorage.setItem('ai_gemini_key', keys.gemini);
        if (keys.openrouter) localStorage.setItem('ai_openrouter_key', keys.openrouter);
    }

    clearAPIKeys() {
        localStorage.removeItem('ai_openai_key');
        localStorage.removeItem('ai_gemini_key');
        localStorage.removeItem('ai_openrouter_key');
        localStorage.removeItem('ai_preferred_model');
        this.apiKeys = { openai: '', gemini: '', openrouter: '' };
    }

    loadChatHistory() {
        const history = localStorage.getItem('ai_chat_history');
        return history ? JSON.parse(history) : [];
    }

    saveChatHistory() {
        localStorage.setItem('ai_chat_history', JSON.stringify(this.chatHistory));
    }

    clearChatHistory() {
        this.chatHistory = [];
        localStorage.removeItem('ai_chat_history');
    }

    getAvailableModels() {
        const models = [];
        if (this.apiKeys.openai) {
            models.push({ value: 'openai/gpt-4o', label: 'GPT-4o' });
            models.push({ value: 'openai/gpt-4-turbo', label: 'GPT-4 Turbo' });
            models.push({ value: 'openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo' });
            models.push({ value: 'openai/gpt-4', label: 'GPT-4' });
        }
        if (this.apiKeys.gemini) {
            models.push({ value: 'gemini/gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash' });
            models.push({ value: 'gemini/gemini-1.5-pro', label: 'Gemini 1.5 Pro' });
            models.push({ value: 'gemini/gemini-1.5-flash', label: 'Gemini 1.5 Flash' });
            models.push({ value: 'gemini/gemini-pro', label: 'Gemini Pro' });
        }
        if (this.apiKeys.openrouter) {
            models.push({ value: 'openrouter/anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' });
            models.push({ value: 'openrouter/meta-llama/llama-3.1-405b-instruct', label: 'Llama 3.1 405B' });
            models.push({ value: 'openrouter/mistralai/mistral-large', label: 'Mistral Large' });
            models.push({ value: 'openrouter/google/gemini-pro-1.5', label: 'Gemini Pro 1.5 (OpenRouter)' });
        }
        return models;
    }

    async sendMessage(message, model = this.preferredModel) {
        const [provider, ...modelParts] = model.split('/');
        const modelName = modelParts.join('/');
        
        try {
            // 환경변수 컨텍스트 추가
            const enhancedMessage = await this.enhanceMessageWithContext(message);
            
            switch (provider) {
                case 'openai':
                    return await this.sendOpenAIMessage(enhancedMessage, modelName);
                case 'gemini':
                    return await this.sendGeminiMessage(enhancedMessage, modelName);
                case 'openrouter':
                    return await this.sendOpenRouterMessage(enhancedMessage, modelName);
                default:
                    throw new Error('지원되지 않는 AI 모델입니다.');
            }
        } catch (error) {
            throw new Error(`AI API 오류: ${error.message}`);
        }
    }

    async enhanceMessageWithContext(message) {
        // 현재 환경변수 정보 가져오기
        const currentEnvData = await this.getCurrentEnvironmentData();
        
        // 환경변수 수정 요청 감지
        const modificationRequest = this.detectModificationRequest(message);
        
        let contextualMessage = message;
        
        if (modificationRequest.isModification) {
            contextualMessage = `
환경변수 수정 요청: ${message}

현재 환경변수 상태:
${currentEnvData.summary}

수정 가능한 작업:
- 환경변수 값 변경
- 새로운 환경변수 추가
- 기존 환경변수 제거
- 환경변수 그룹별 관리

응답 시 다음 형식으로 수정 명령을 포함해주세요:
[ENV_MODIFY]
{
  "action": "update|add|remove",
  "variables": {
    "VARIABLE_NAME": "new_value"
  }
}
[/ENV_MODIFY]

사용자 요청: ${message}`;
        } else {
            contextualMessage = `
현재 프로젝트의 환경변수 상태:
${currentEnvData.summary}

사용자 질문: ${message}

위 환경변수들과 관련된 구체적이고 실용적인 답변을 제공해주세요. 일반적인 설명보다는 현재 프로젝트에 특화된 조언을 우선해주세요.`;
        }
        
        return contextualMessage;
    }

    async getCurrentEnvironmentData() {
        try {
            // 현재 선택된 파일의 환경변수 정보 가져오기
            if (!envManager.currentFileId) {
                return {
                    summary: "현재 선택된 환경변수 파일이 없습니다.",
                    variables: {}
                };
            }

            const variables = envManager.currentVariables;
            const variableCount = Object.keys(variables).length;
            
            let summary = `파일: ${envManager.envFiles.find(f => f.id === envManager.currentFileId)?.name || '알 수 없음'}\n`;
            summary += `총 환경변수 개수: ${variableCount}개\n\n`;
            
            if (variableCount > 0) {
                summary += "환경변수 목록:\n";
                Object.entries(variables).forEach(([key, data]) => {
                    const value = data.value || '';
                    const maskedValue = this.maskSensitiveValue(key, value);
                    summary += `- ${key}=${maskedValue}\n`;
                });
            }
            
            return {
                summary,
                variables
            };
        } catch (error) {
            return {
                summary: "환경변수 정보를 가져오는데 실패했습니다.",
                variables: {}
            };
        }
    }

    maskSensitiveValue(key, value) {
        const sensitiveKeys = ['KEY', 'SECRET', 'TOKEN', 'PASSWORD', 'PASS', 'AUTH', 'CREDENTIAL'];
        const isSensitive = sensitiveKeys.some(sensitive => key.toUpperCase().includes(sensitive));
        
        if (isSensitive && value.length > 4) {
            return value.substring(0, 4) + '*'.repeat(Math.min(value.length - 4, 8));
        }
        return value;
    }

    detectModificationRequest(message) {
        const modificationKeywords = [
            '수정', '변경', '업데이트', '설정', '추가', '삭제', '제거',
            '바꿔', '바꾸', '적용', '설치', '구성', '초기화',
            'modify', 'change', 'update', 'set', 'add', 'remove', 'delete',
            'configure', 'install', 'setup', 'reset', 'apply'
        ];
        
        const isModification = modificationKeywords.some(keyword => 
            message.toLowerCase().includes(keyword)
        );
        
        return {
            isModification,
            keywords: modificationKeywords.filter(keyword => 
                message.toLowerCase().includes(keyword)
            )
        };
    }

    async sendOpenAIMessage(message, model) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKeys.openai}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: '당신은 환경변수 관리 전문가입니다. 사용자의 환경변수 관련 질문에 도움을 주고, 보안 모범 사례를 제안하며, 설정 파일을 개선하는 방법을 알려주세요.'
                    },
                    ...this.chatHistory.slice(-10),
                    { role: 'user', content: message }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API 오류: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async sendGeminiMessage(message, model) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKeys.gemini}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `당신은 환경변수 관리 전문 AI 도우미입니다.

주요 역할:
1. 현재 프로젝트의 환경변수에 특화된 답변 제공
2. 환경변수 값 수정, 추가, 제거 지원
3. 보안 모범 사례 제안

환경변수 수정 명령 형식:
[ENV_MODIFY]
{
  "action": "update|add|remove",
  "variables": {
    "VARIABLE_NAME": "new_value"
  }
}
[/ENV_MODIFY]

사용자 요청: ${message}`
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.7
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Google Gemini API 오류: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    async sendOpenRouterMessage(message, model) {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKeys.openrouter}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Environment Variables Manager'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: '당신은 환경변수 관리 전문가입니다. 사용자의 환경변수 관련 질문에 도움을 주고, 보안 모범 사례를 제안하며, 설정 파일을 개선하는 방법을 알려주세요.'
                    },
                    ...this.chatHistory.slice(-10),
                    { role: 'user', content: message }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API 오류: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    addToChatHistory(role, content) {
        this.chatHistory.push({ role, content });
        if (this.chatHistory.length > 20) {
            this.chatHistory = this.chatHistory.slice(-20);
        }
        this.saveChatHistory();
    }
}

/**
 * 환경변수 수정 명령 처리 함수
 */
async function processEnvironmentModification(response) {
    const result = {
        hasModifications: false,
        summary: '',
        errors: []
    };
    
    try {
        // [ENV_MODIFY] 블록 찾기
        const modifyRegex = /\[ENV_MODIFY\]([\s\S]*?)\[\/ENV_MODIFY\]/g;
        const matches = [...response.matchAll(modifyRegex)];
        
        if (matches.length === 0) {
            return result;
        }
        
        // 현재 선택된 파일이 있는지 확인
        if (!envManager.currentFileId) {
            result.errors.push('환경변수를 수정하려면 먼저 파일을 선택해주세요.');
            result.summary = '❌ ' + result.errors.join('\n');
            return result;
        }
        
        result.hasModifications = true;
        const modifications = [];
        
        for (const match of matches) {
            try {
                const jsonStr = match[1].trim();
                const modifyCommand = JSON.parse(jsonStr);
                
                const { action, variables } = modifyCommand;
                
                if (!action || !variables) {
                    result.errors.push('잘못된 수정 명령 형식입니다.');
                    continue;
                }
                
                switch (action.toLowerCase()) {
                    case 'update':
                    case 'add':
                        for (const [key, value] of Object.entries(variables)) {
                            const isNew = !envManager.currentVariables[key];
                            
                            if (isNew) {
                                envManager.currentVariables[key] = {
                                    value: value,
                                    lineNumber: Object.keys(envManager.currentVariables).length + 1,
                                    originalLine: `${key}=${value}`
                                };
                                modifications.push(`➕ 새로운 환경변수 추가: ${key}=${value}`);
                            } else {
                                const oldValue = envManager.currentVariables[key].value;
                                envManager.currentVariables[key].value = value;
                                envManager.currentVariables[key].originalLine = `${key}=${value}`;
                                modifications.push(`🔄 환경변수 수정: ${key}=${oldValue} → ${value}`);
                            }
                        }
                        break;
                        
                    case 'remove':
                    case 'delete':
                        for (const key of Object.keys(variables)) {
                            if (envManager.currentVariables[key]) {
                                delete envManager.currentVariables[key];
                                modifications.push(`❌ 환경변수 제거: ${key}`);
                            } else {
                                result.errors.push(`환경변수 '${key}'를 찾을 수 없습니다.`);
                            }
                        }
                        break;
                        
                    default:
                        result.errors.push(`지원되지 않는 작업: ${action}`);
                }
                
            } catch (parseError) {
                result.errors.push(`JSON 파싱 오류: ${parseError.message}`);
            }
        }
        
        // UI 업데이트
        if (modifications.length > 0) {
            envManager.renderVariables();
            
            // 자동 저장 옵션 제공
            const autoSave = confirm('환경변수가 수정되었습니다. 자동으로 저장하시겠습니까?');
            if (autoSave) {
                try {
                    await envManager.saveCurrentFile();
                    modifications.push('✅ 파일이 자동으로 저장되었습니다.');
                } catch (saveError) {
                    result.errors.push(`자동 저장 실패: ${saveError.message}`);
                }
            }
        }
        
        // 결과 요약 생성
        let summary = '';
        if (modifications.length > 0) {
            summary += modifications.join('\n');
        }
        if (result.errors.length > 0) {
            if (summary) summary += '\n\n';
            summary += '⚠️ **오류:**\n' + result.errors.join('\n');
        }
        
        result.summary = summary;
        
    } catch (error) {
        result.errors.push(`수정 처리 오류: ${error.message}`);
        result.summary = '❌ ' + result.errors.join('\n');
    }
    
    return result;
}

class EnvManager {
    constructor() {
        this.currentFileId = null;
        this.currentVariables = {};
        this.envFiles = [];
        this.aiService = new AIService();
        this.init();
    }

    async init() {
        await this.loadEnvFiles();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            this.handleFileUpload(files);
        });

        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFileUpload(files);
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    async loadEnvFiles() {
        try {
            const response = await fetch('/api/env-files');
            const result = await response.json();
            
            if (result.success) {
                this.envFiles = result.files;
                this.renderFileList();
            }
        } catch (error) {
            this.showStatus('파일 목록을 불러오는데 실패했습니다: ' + error.message, 'error');
        }
    }

    renderFileList() {
        const fileList = document.getElementById('fileList');
        
        if (this.envFiles.length === 0) {
            fileList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 20px;">등록된 파일이 없습니다</div>';
            return;
        }

        fileList.innerHTML = this.envFiles.map(file => `
            <div class="file-item ${file.id === this.currentFileId ? 'active' : ''}">
                <div class="file-content" onclick="envManager.selectFile('${file.id}')">
                    <div class="file-name" title="${file.name}">${file.name}</div>
                    <div class="file-path" title="${file.relativePath || file.path}">${file.relativePath || file.path}</div>
                </div>
                <div class="file-actions">
                    <button class="btn btn-sm btn-terminal" onclick="event.stopPropagation(); openDirectoryShell('${file.id}')" title="이 파일의 디렉토리에서 터미널 열기">
                        🖥️
                    </button>
                </div>
            </div>
        `).join('');
    }

    async selectFile(fileId) {
        try {
            this.currentFileId = fileId;
            this.renderFileList();
            
            document.getElementById('welcomeScreen').style.display = 'none';
            document.getElementById('envEditor').classList.add('active');
            
            const response = await fetch(`/api/env-files/${fileId}`);
            const result = await response.json();
            
            if (result.success) {
                this.currentVariables = result.data.variables;
                this.renderVariables();
                
                const file = this.envFiles.find(f => f.id === fileId);
                document.getElementById('editorTitle').textContent = `📝 ${file.name} 편집`;
                
                // FAB 상태 업데이트
                if (window.updateFABState) {
                    window.updateFABState();
                }
            }
        } catch (error) {
            this.showStatus('파일을 불러오는데 실패했습니다: ' + error.message, 'error');
        }
    }

    renderVariables() {
        const container = document.getElementById('variablesContainer');
        
        if (Object.keys(this.currentVariables).length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 40px;">환경변수가 없습니다. 새로운 변수를 추가해보세요.</div>';
            return;
        }

        container.innerHTML = Object.entries(this.currentVariables).map(([key, data]) => `
            <div class="variable-item">
                <div class="variable-header">
                    <div class="variable-key">${key}</div>
                    <div class="variable-actions">
                        <button class="btn btn-sm btn-danger" onclick="envManager.removeVariable('${key}')">삭제</button>
                    </div>
                </div>
                <textarea class="variable-value" 
                          onchange="envManager.updateVariable('${key}', this.value)"
                          placeholder="환경변수 값을 입력하세요...">${data.value || ''}</textarea>
            </div>
        `).join('');
    }

    updateVariable(key, value) {
        if (this.currentVariables[key]) {
            this.currentVariables[key].value = value;
        }
    }

    removeVariable(key) {
        if (confirm(`'${key}' 환경변수를 삭제하시겠습니까?`)) {
            delete this.currentVariables[key];
            this.renderVariables();
        }
    }

    addNewVariable() {
        const key = prompt('새 환경변수 이름을 입력하세요:');
        if (key && key.trim()) {
            const cleanKey = key.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
            if (this.currentVariables[cleanKey]) {
                alert('이미 존재하는 환경변수입니다.');
                return;
            }
            
            this.currentVariables[cleanKey] = {
                value: '',
                lineNumber: Object.keys(this.currentVariables).length + 1
            };
            this.renderVariables();
        }
    }

    async saveCurrentFile() {
        if (!this.currentFileId) return;

        return await safeExecuteWithRetry(async () => {
            const response = await fetch(`/api/env-files/${this.currentFileId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    variables: this.currentVariables
                })
            });

            if (!response.ok) {
                throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            if (result.success) {
                if (result.warning) {
                    if (result.warning.includes('EACCES') || result.warning.includes('permission denied')) {
                        const currentFile = this.envFiles.find(f => f.id === this.currentFileId);
                        const filePath = currentFile ? currentFile.path : 'Unknown file';
                        
                        this.showPermissionError('backup', filePath);
                    } else {
                        this.showStatus('⚠️ 파일은 저장되었지만 백업 생성에 실패했습니다', 'warning');
                    }
                } else {
                    this.showStatus('✅ 파일이 성공적으로 저장되었습니다!', 'success');
                }
                
                return result;
            } else {
                if (result.error && (result.error.includes('EACCES') || result.error.includes('permission denied'))) {
                    const currentFile = this.envFiles.find(f => f.id === this.currentFileId);
                    const filePath = currentFile ? currentFile.path : 'Unknown file';
                    
                    this.showPermissionError('save', filePath);
                }
                throw new Error(result.error || '저장 실패');
            }
        }, 3, 1000, { action: 'saveCurrentFile', fileId: this.currentFileId });
    }

    async createBackup() {
        if (!this.currentFileId) return;

        return await safeExecuteWithRetry(async () => {
            const response = await fetch(`/api/env-files/${this.currentFileId}/backup`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`백업 요청 실패: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            if (result.success) {
                this.showStatus(`✅ 백업이 생성되었습니다: ${result.backupPath}`, 'success');
                return result;
            } else {
                throw new Error(result.error || '백업 생성 실패');
            }
        }, 2, 1500, { action: 'createBackup', fileId: this.currentFileId });
    }

    async downloadAllStates() {
        if (!this.currentFileId) return;

        try {
            const file = this.envFiles.find(f => f.id === this.currentFileId);
            if (!file) {
                throw new Error('파일 정보를 찾을 수 없습니다');
            }
            
            // 안전한 기본 파일명 생성
            let baseName = sanitizeFileName(file.name);
            if (baseName.endsWith('.env')) {
                baseName = baseName.slice(0, -4);
            }
            
            const zip = new JSZip();
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
            
            // 원본 파일
            zip.file(`${baseName}.env`, this.generateEnvContent(this.currentVariables));
            
            // 프로덕션 환경용 파일
            const productionVars = Object.fromEntries(
                Object.entries(this.currentVariables).filter(([key, data]) => 
                    !key.includes('DEV') && !key.includes('TEST') && !key.includes('LOCAL')
                )
            );
            zip.file(`${baseName}.production.env`, this.generateEnvContent(productionVars));
            
            // 개발 환경용 파일 (민감한 정보 마스킹)
            const developmentVars = Object.fromEntries(
                Object.entries(this.currentVariables).map(([key, data]) => [
                    key, { ...data, value: key.includes('PASSWORD') || key.includes('SECRET') || key.includes('KEY') ? 'dev_placeholder' : data.value }
                ])
            );
            zip.file(`${baseName}.development.env`, this.generateEnvContent(developmentVars));
            
            // 템플릿 파일
            const templateVars = Object.fromEntries(
                Object.entries(this.currentVariables).map(([key, data]) => [
                    key, { ...data, value: `YOUR_${key}_HERE` }
                ])
            );
            zip.file(`${baseName}.template.env`, this.generateEnvContent(templateVars));

            const content = await zip.generateAsync({ type: 'blob' });
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${baseName}_all_states_${timestamp}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showStatus('✅ 모든 상태의 환경변수 파일이 다운로드되었습니다', 'success');
        } catch (error) {
            this.showStatus(`❌ 다운로드 중 오류가 발생했습니다: ${error.message}`, 'error');
        }
    }

    generateEnvContent(variables) {
        return Object.entries(variables)
            .map(([key, data]) => `${key}=${data.value || ''}`)
            .join('\n');
    }

    async removeCurrentFile() {
        if (!this.currentFileId) return;

        const file = this.envFiles.find(f => f.id === this.currentFileId);
        if (confirm(`'${file.name}' 파일을 관리 목록에서 제거하시겠습니까?\n(실제 파일은 삭제되지 않습니다)`)) {
            try {
                const response = await fetch(`/api/env-files/${this.currentFileId}`, {
                    method: 'DELETE'
                });

                const result = await response.json();
                if (result.success) {
                    this.showStatus('✅ 파일이 관리 목록에서 제거되었습니다', 'success');
                    this.currentFileId = null;
                    document.getElementById('envEditor').classList.remove('active');
                    document.getElementById('welcomeScreen').style.display = 'block';
                    await this.loadEnvFiles();
                }
            } catch (error) {
                this.showStatus('❌ 파일 제거 중 오류가 발생했습니다: ' + error.message, 'error');
            }
        }
    }

    async handleFileUpload(files) {
        const envFiles = files.filter(file => 
            file.name.includes('.env') || file.name.endsWith('.env')
        );

        if (envFiles.length === 0) {
            this.showStatus('❌ .env 파일만 업로드할 수 있습니다', 'error');
            return;
        }

        for (const file of envFiles) {
            const formData = new FormData();
            formData.append('envFile', file);
            
            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                if (result.success) {
                    this.showStatus(`✅ ${file.name} 업로드 완료`, 'success');
                } else {
                    this.showStatus(`❌ ${file.name} 업로드 실패: ${result.error}`, 'error');
                }
            } catch (error) {
                this.showStatus(`❌ ${file.name} 업로드 중 오류: ${error.message}`, 'error');
            }
        }

        await this.loadEnvFiles();
        document.getElementById('fileInput').value = '';
    }

    showStatus(message, type = 'info', duration = 5000) {
        this.showToast(message, type, duration);
    }

    /**
     * 토스트 알림을 표시합니다
     * @param {string} message - 표시할 메시지
     * @param {string} type - 알림 타입 (success, error, warning, info)
     * @param {number} duration - 표시 시간 (밀리초)
     */
    showToast(message, type = 'info', duration = 5000) {
        const container = document.getElementById('toastContainer');
        if (!container) {
            console.error('토스트 컴테이너를 찾을 수 없습니다');
            return;
        }

        // 아이콘 매핑
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        // 제목 매핑
        const titles = {
            success: '성공',
            error: '오류',
            warning: '경고',
            info: '알림'
        };

        // 토스트 요소 생성
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-title">${titles[type] || titles.info}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.closest('.toast').remove()">&times;</button>
            <div class="toast-progress"></div>
        `;

        // 컴테이너에 추가
        container.appendChild(toast);

        // 사운드 효과 (선택적)
        this.playNotificationSound(type);

        // 애니메이션 시작
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // 자동 제거
        const autoRemove = setTimeout(() => {
            this.removeToast(toast);
        }, duration);

        // 클릭 시 자동 제거 취소
        toast.addEventListener('click', () => {
            clearTimeout(autoRemove);
        });

        // 최대 5개까지만 표시
        const toasts = container.querySelectorAll('.toast');
        if (toasts.length > 5) {
            this.removeToast(toasts[0]);
        }
    }

    /**
     * 토스트를 제거합니다
     * @param {HTMLElement} toast - 제거할 토스트 요소
     */
    removeToast(toast) {
        if (!toast || !toast.parentNode) return;
        
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 400);
    }

    /**
     * 알림 사운드를 재생합니다 (선택적)
     * @param {string} type - 알림 타입
     */
    playNotificationSound(type) {
        try {
            // Web Audio API를 사용한 간단한 비프음
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // 타입별 주파수 설정
            const frequencies = {
                success: 800,  // 높은 음
                error: 300,    // 낮은 음
                warning: 600,  // 중간 음
                info: 500      // 기본 음
            };
            
            oscillator.frequency.setValueAtTime(frequencies[type] || frequencies.info, audioContext.currentTime);
            oscillator.type = 'sine';
            
            // 볼륨 설정 (아주 작게)
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            
        } catch (error) {
            // 사운드 재생 실패 시 조용히 무시
            console.debug('사운드 재생 실패:', error);
        }
    }

    /**
     * 권한 문제 해결 가이드를 표시합니다
     * @param {string} filePath - 문제가 발생한 파일 경로
     */
    showPermissionGuide(filePath) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>🔒 파일 권한 문제 해결 가이드</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                        <h4 style="color: #856404; margin: 0 0 10px 0;">⚠️ 권한 문제가 발생했습니다</h4>
                        <p style="margin: 0; color: #856404;">파일: <code>${filePath}</code></p>
                    </div>
                    
                    <h4>🛠️ 해결 방법:</h4>
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                        <h5>1. 터미널에서 파일 권한 확인:</h5>
                        <code style="background: #e9ecef; padding: 8px; border-radius: 4px; display: block; margin: 5px 0;">ls -la "${filePath}"</code>
                        
                        <h5 style="margin-top: 15px;">2. 파일 소유자 변경 (필요시):</h5>
                        <code style="background: #e9ecef; padding: 8px; border-radius: 4px; display: block; margin: 5px 0;">sudo chown $USER:$USER "${filePath}"</code>
                        
                        <h5 style="margin-top: 15px;">3. 파일 권한 설정:</h5>
                        <code style="background: #e9ecef; padding: 8px; border-radius: 4px; display: block; margin: 5px 0;">chmod 644 "${filePath}"</code>
                    </div>
                    
                    <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px;">
                        <h5 style="color: #0c5460; margin: 0 0 10px 0;">💡 팁:</h5>
                        <p style="margin: 0; color: #0c5460;">파일 옆의 🖥️ 터미널 버튼을 클릭하여 해당 디렉토리에서 바로 터미널을 열 수 있습니다.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">확인</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 모달 외부 클릭 시 닫기
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * 권한 오류에 대한 사용자 친화적 메시지를 표시합니다
     * @param {string} operation - 수행하려던 작업 (예: 'save', 'backup')
     * @param {string} filePath - 문제가 발생한 파일 경로
     */
    showPermissionError(operation, filePath) {
        let message = '';
        let actionText = '';
        
        switch (operation) {
            case 'save':
                message = '❌ 파일 저장 권한이 없습니다';
                actionText = '저장';
                break;
            case 'backup':
                message = '⚠️ 백업 파일 생성 권한이 없습니다 (저장은 계속됩니다)';
                actionText = '백업';
                break;
            default:
                message = '❌ 파일 권한 오류가 발생했습니다';
                actionText = '작업';
        }
        
        this.showStatus(message, operation === 'backup' ? 'warning' : 'error');
        
        // 3초 후 권한 가이드 표시
        setTimeout(() => {
            this.showPermissionGuide(filePath);
        }, 3000);
    }

    async refreshFileList() {
        await this.loadEnvFiles();
        this.showStatus('✅ 파일 목록이 새로고침되었습니다', 'success');
    }
}

function showAddFileModal() {
    document.getElementById('addFileModal').style.display = 'block';
}

function showScanModal() {
    document.getElementById('scanModal').style.display = 'block';
}

function showUploadModal() {
    document.getElementById('uploadModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function addEnvFile() {
    const filePath = document.getElementById('filePath').value.trim();
    
    if (!filePath) {
        alert('파일 경로를 입력해주세요.');
        return;
    }

    try {
        const response = await fetch('/api/env-files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filePath })
        });

        const result = await response.json();
        if (result.success) {
            envManager.showStatus('✅ 파일이 성공적으로 추가되었습니다', 'success');
            await envManager.loadEnvFiles();
            closeModal('addFileModal');
            document.getElementById('filePath').value = '';
        } else {
            envManager.showStatus('❌ 파일 추가 실패: ' + result.error, 'error');
        }
    } catch (error) {
        envManager.showStatus('❌ 파일 추가 중 오류: ' + error.message, 'error');
    }
}

async function scanDirectory() {
    const directory = document.getElementById('scanPath').value.trim();
    
    if (!directory) {
        alert('디렉토리 경로를 입력해주세요.');
        return;
    }

    try {
        const response = await fetch('/api/scan-directory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ directory })
        });

        const result = await response.json();
        if (result.success) {
            envManager.showStatus(`✅ 디렉토리 스캔 완료: ${result.newFiles.length}개의 새 파일 발견`, 'success');
            await envManager.loadEnvFiles();
            closeModal('scanModal');
            document.getElementById('scanPath').value = '';
        } else {
            envManager.showStatus('❌ 디렉토리 스캔 실패: ' + result.error, 'error');
        }
    } catch (error) {
        envManager.showStatus('❌ 디렉토리 스캔 중 오류: ' + error.message, 'error');
    }
}

async function uploadFiles() {
    const destination = document.getElementById('uploadDestination').value.trim();
    const files = document.getElementById('uploadFileInput').files;
    
    if (files.length === 0) {
        alert('업로드할 파일을 선택해주세요.');
        return;
    }

    for (const file of files) {
        const formData = new FormData();
        formData.append('envFile', file);
        if (destination) {
            formData.append('destination', destination);
        }
        
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                envManager.showStatus(`✅ ${file.name} 업로드 완료`, 'success');
            } else {
                envManager.showStatus(`❌ ${file.name} 업로드 실패: ${result.error}`, 'error');
            }
        } catch (error) {
            envManager.showStatus(`❌ ${file.name} 업로드 중 오류: ${error.message}`, 'error');
        }
    }

    await envManager.loadEnvFiles();
    closeModal('uploadModal');
    document.getElementById('uploadDestination').value = '';
    document.getElementById('uploadFileInput').value = '';
}

// === 성능 모니터링 시스템 ===

/**
 * 성능 메트릭 수집 및 모니터링 클래스
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = [];
        this.apiMetrics = new Map();
        this.userMetrics = {
            pageLoadTime: 0,
            interactionCount: 0,
            errorCount: 0,
            sessionStart: Date.now()
        };
        
        this.init();
    }

    init() {
        this.measurePageLoad();
        this.setupPerformanceObserver();
        this.trackUserInteractions();
        this.startPeriodicReporting();
    }

    /**
     * 페이지 로딩 시간 측정
     */
    measurePageLoad() {
        if (performance.timing) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            this.userMetrics.pageLoadTime = loadTime;
            
            if (loadTime > 3000) {
                this.reportAlert('페이지 로딩 시간 초과', { loadTime });
            }
        }

        // Core Web Vitals 측정
        this.measureWebVitals();
    }

    /**
     * Core Web Vitals 측정 (LCP, FID, CLS)
     */
    measureWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.recordMetric('LCP', lastEntry.startTime);
                
                if (lastEntry.startTime > 2500) {
                    this.reportAlert('LCP 성능 이슈', { lcp: lastEntry.startTime });
                }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay (FID)
            const fidObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    this.recordMetric('FID', entry.processingStart - entry.startTime);
                    
                    if ((entry.processingStart - entry.startTime) > 100) {
                        this.reportAlert('FID 성능 이슈', { fid: entry.processingStart - entry.startTime });
                    }
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
        }
    }

    /**
     * Performance Observer 설정
     */
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // Resource timing 관찰
            const resourceObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    if (entry.duration > 1000) {
                        this.reportAlert('리소스 로딩 지연', {
                            name: entry.name,
                            duration: entry.duration,
                            type: entry.initiatorType
                        });
                    }
                });
            });
            resourceObserver.observe({ entryTypes: ['resource'] });

            // Navigation timing 관찰
            const navigationObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    this.recordMetric('Navigation', {
                        domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                        domComplete: entry.domComplete - entry.domLoading,
                        loadComplete: entry.loadEventEnd - entry.loadEventStart
                    });
                });
            });
            navigationObserver.observe({ entryTypes: ['navigation'] });
        }
    }

    /**
     * API 호출 성능 측정
     */
    measureAPICall(endpoint, startTime, endTime, success = true) {
        const duration = endTime - startTime;
        
        if (!this.apiMetrics.has(endpoint)) {
            this.apiMetrics.set(endpoint, {
                totalCalls: 0,
                totalDuration: 0,
                errorCount: 0,
                avgDuration: 0
            });
        }

        const metric = this.apiMetrics.get(endpoint);
        metric.totalCalls++;
        metric.totalDuration += duration;
        metric.avgDuration = metric.totalDuration / metric.totalCalls;
        
        if (!success) {
            metric.errorCount++;
        }

        // 느린 API 호출 알림
        if (duration > 5000) {
            this.reportAlert('API 응답 지연', {
                endpoint,
                duration,
                success
            });
        }

        this.recordMetric('API_Call', {
            endpoint,
            duration,
            success,
            timestamp: Date.now()
        });
    }

    /**
     * 사용자 상호작용 추적
     */
    trackUserInteractions() {
        // 클릭 이벤트 추적
        document.addEventListener('click', (event) => {
            this.userMetrics.interactionCount++;
            
            this.recordMetric('User_Interaction', {
                type: 'click',
                target: event.target.tagName,
                className: event.target.className,
                timestamp: Date.now()
            });
        });

        // 폼 제출 추적
        document.addEventListener('submit', (event) => {
            this.recordMetric('Form_Submit', {
                formId: event.target.id,
                timestamp: Date.now()
            });
        });

        // 에러 발생 추적
        window.addEventListener('error', (event) => {
            this.userMetrics.errorCount++;
            
            this.recordMetric('Client_Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                timestamp: Date.now()
            });
        });
    }

    /**
     * 메트릭 기록
     */
    recordMetric(type, data) {
        this.metrics.push({
            type,
            data,
            timestamp: Date.now()
        });

        // 메트릭 개수 제한 (메모리 사용량 관리)
        if (this.metrics.length > 1000) {
            this.metrics = this.metrics.slice(-500);
        }
    }

    /**
     * 알림 보고
     */
    reportAlert(message, data) {
        console.warn('🚨 Performance Alert:', message, data);
        
        // 실제 환경에서는 모니터링 서비스로 전송
        this.sendToMonitoringService({
            type: 'alert',
            message,
            data,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
    }

    /**
     * 정기적인 메트릭 리포팅
     */
    startPeriodicReporting() {
        setInterval(() => {
            this.generateReport();
        }, 60000); // 1분마다 리포트 생성

        // 페이지 언로드 시 최종 리포트
        window.addEventListener('beforeunload', () => {
            this.generateFinalReport();
        });
    }

    /**
     * 성능 리포트 생성
     */
    generateReport() {
        const report = {
            timestamp: Date.now(),
            session: {
                duration: Date.now() - this.userMetrics.sessionStart,
                pageLoadTime: this.userMetrics.pageLoadTime,
                interactionCount: this.userMetrics.interactionCount,
                errorCount: this.userMetrics.errorCount
            },
            api: Object.fromEntries(this.apiMetrics),
            memory: this.getMemoryUsage(),
            connection: this.getConnectionInfo()
        };

        this.sendToMonitoringService(report);
        return report;
    }

    /**
     * 최종 리포트 생성 (세션 종료 시)
     */
    generateFinalReport() {
        const finalReport = this.generateReport();
        finalReport.type = 'session_end';
        
        // beacon API를 사용하여 안정적으로 전송
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/metrics', JSON.stringify(finalReport));
        }
    }

    /**
     * 메모리 사용량 정보
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    /**
     * 연결 정보
     */
    getConnectionInfo() {
        if (navigator.connection) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            };
        }
        return null;
    }

    /**
     * 모니터링 서비스로 전송
     */
    sendToMonitoringService(data) {
        // 실제 환경에서는 외부 모니터링 서비스 (Prometheus, Grafana, New Relic 등)로 전송
        try {
            fetch('/api/metrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).catch(error => {
                console.warn('Failed to send metrics:', error);
            });
        } catch (error) {
            console.warn('Metrics sending error:', error);
        }
    }

    /**
     * 성능 대시보드 데이터 반환
     */
    getDashboardData() {
        return {
            currentSession: this.userMetrics,
            apiMetrics: Object.fromEntries(this.apiMetrics),
            recentMetrics: this.metrics.slice(-50),
            performance: {
                memory: this.getMemoryUsage(),
                connection: this.getConnectionInfo()
            }
        };
    }
}

// 전역 성능 모니터 인스턴스 생성
const performanceMonitor = new PerformanceMonitor();

// === 에러 처리 및 로깅 시스템 ===

/**
 * 에러 타입 정의
 */
const ErrorTypes = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    FILE_NOT_FOUND: 'FILE_NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    PERMISSION_ERROR: 'PERMISSION_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * 중앙화된 에러 핸들러
 */
class ErrorHandler {
    static handleError(error, context = {}) {
        const errorInfo = {
            type: this.categorizeError(error),
            message: error.message || '알 수 없는 오류가 발생했습니다',
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        // 에러 로깅
        this.logError(errorInfo);

        // 사용자에게 적절한 메시지 표시
        const userMessage = this.getUserFriendlyMessage(errorInfo);
        if (envManager) {
            envManager.showStatus(userMessage, 'error');
        }

        return errorInfo;
    }

    static categorizeError(error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return ErrorTypes.NETWORK_ERROR;
        }
        if (error.message.includes('404') || error.message.includes('not found')) {
            return ErrorTypes.FILE_NOT_FOUND;
        }
        if (error.message.includes('validation') || error.message.includes('invalid')) {
            return ErrorTypes.VALIDATION_ERROR;
        }
        if (error.message.includes('permission') || error.message.includes('forbidden')) {
            return ErrorTypes.PERMISSION_ERROR;
        }
        return ErrorTypes.UNKNOWN_ERROR;
    }

    static getUserFriendlyMessage(errorInfo) {
        const baseMessage = '❌ ';
        
        switch (errorInfo.type) {
            case ErrorTypes.NETWORK_ERROR:
                return baseMessage + '네트워크 연결을 확인해주세요. 잠시 후 다시 시도해주세요.';
            case ErrorTypes.FILE_NOT_FOUND:
                return baseMessage + '요청한 파일을 찾을 수 없습니다. 파일이 존재하는지 확인해주세요.';
            case ErrorTypes.VALIDATION_ERROR:
                return baseMessage + '입력 정보가 올바르지 않습니다. 다시 확인해주세요.';
            case ErrorTypes.PERMISSION_ERROR:
                return baseMessage + '접근 권한이 없습니다. 관리자에게 문의해주세요.';
            default:
                return baseMessage + errorInfo.message;
        }
    }

    static logError(errorInfo) {
        // 개발 환경 감지 (브라우저 환경에 맞게 수정)
        const isDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1' ||
                            window.location.hostname.includes('dev');
        
        if (isDevelopment) {
            console.group('🚨 Error Details');
            console.error('Type:', errorInfo.type);
            console.error('Message:', errorInfo.message);
            console.error('Context:', errorInfo.context);
            console.error('Timestamp:', errorInfo.timestamp);
            console.groupEnd();
        }

        // 프로덕션 환경에서는 외부 로깅 서비스로 전송
        // 예: Sentry, LogRocket, 또는 자체 로깅 API
        try {
            this.sendToLoggingService(errorInfo);
        } catch (loggingError) {
            console.warn('로깅 서비스 전송 실패:', loggingError);
        }
    }

    static sendToLoggingService(errorInfo) {
        // 실제 로깅 서비스 연동 시 구현
        // 예시: Sentry, Winston, 또는 외부 API
        
        // 로컬 스토리지에 에러 로그 저장 (임시 방편)
        try {
            const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
            errorLogs.push(errorInfo);
            
            // 최대 100개까지만 보관
            if (errorLogs.length > 100) {
                errorLogs.splice(0, errorLogs.length - 100);
            }
            
            localStorage.setItem('error_logs', JSON.stringify(errorLogs));
        } catch (e) {
            console.warn('로컬 에러 로그 저장 실패:', e);
        }
    }
}

/**
 * 전역 에러 핸들러 설정
 */
window.addEventListener('error', (event) => {
    ErrorHandler.handleError(event.error, {
        source: 'window.error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.handleError(event.reason, {
        source: 'unhandledrejection',
        promise: event.promise
    });
    event.preventDefault(); // 기본 에러 표시 방지
});

/**
 * 안전한 비동기 함수 실행 래퍼
 * @param {Function} asyncFn - 실행할 비동기 함수
 * @param {Object} context - 에러 컨텍스트 정보
 * @returns {Promise} 결과 또는 에러
 */
async function safeExecute(asyncFn, context = {}) {
    try {
        return await asyncFn();
    } catch (error) {
        return ErrorHandler.handleError(error, {
            ...context,
            function: asyncFn.name
        });
    }
}

/**
 * 재시도 로직이 포함된 안전한 실행 함수
 * @param {Function} asyncFn - 실행할 비동기 함수
 * @param {number} maxRetries - 최대 재시도 횟수
 * @param {number} retryDelay - 재시도 간격 (ms)
 * @param {Object} context - 에러 컨텍스트 정보
 */
async function safeExecuteWithRetry(asyncFn, maxRetries = 3, retryDelay = 1000, context = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await asyncFn();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxRetries) {
                break;
            }
            
            // 네트워크 에러인 경우에만 재시도
            const errorType = ErrorHandler.categorizeError(error);
            if (errorType !== ErrorTypes.NETWORK_ERROR) {
                break;
            }
            
            console.warn(`시도 ${attempt} 실패, ${retryDelay}ms 후 재시도...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
    
    return ErrorHandler.handleError(lastError, {
        ...context,
        attempts: maxRetries,
        function: asyncFn.name
    });
}

/**
 * 파일명을 안전하게 정규화하는 함수
 * @param {string} fileName - 정규화할 파일명
 * @param {number} maxLength - 최대 파일명 길이 (기본값: 255)
 * @returns {string} 정규화된 안전한 파일명
 */
function sanitizeFileName(fileName, maxLength = 255) {
    if (!fileName || typeof fileName !== 'string') {
        return 'untitled';
    }

    // 1. 기본 정리 - 앞뒤 공백 제거
    let cleaned = fileName.trim();

    // 2. 위험한 문자 제거/대체
    // Windows/Linux/macOS에서 금지된 문자들
    cleaned = cleaned
        .replace(/[<>:"/\\|?*]/g, '_')  // Windows 금지 문자
        .replace(/[\x00-\x1f\x80-\x9f]/g, '_')  // 제어 문자
        .replace(/^\.+/, '')  // 시작 점 제거 (숨김 파일 방지)
        .replace(/\.+$/, '')  // 끝 점 제거
        .replace(/\s+/g, '_')  // 공백을 언더스코어로
        .replace(/_+/g, '_')  // 연속 언더스코어 정리
        .replace(/^_+|_+$/g, ''); // 시작/끝 언더스코어 제거

    // 3. Windows 예약어 처리
    const reserved = [
        'CON', 'PRN', 'AUX', 'NUL', 
        'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
        'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ];
    
    const ext = getFileExtension(cleaned);
    const nameWithoutExt = getFileNameWithoutExtension(cleaned);
    
    if (reserved.includes(nameWithoutExt.toUpperCase())) {
        cleaned = `safe_${cleaned}`;
    }

    // 4. 길이 제한 (확장자 고려)
    if (cleaned.length > maxLength) {
        const extension = getFileExtension(cleaned);
        const baseName = getFileNameWithoutExtension(cleaned);
        const maxBaseLength = maxLength - extension.length;
        cleaned = baseName.substring(0, maxBaseLength) + extension;
    }

    // 5. 빈 문자열 처리
    if (!cleaned) {
        cleaned = 'untitled';
    }

    return cleaned;
}

/**
 * 파일 확장자를 추출하는 함수
 * @param {string} fileName - 파일명
 * @returns {string} 확장자 (점 포함)
 */
function getFileExtension(fileName) {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
}

/**
 * 확장자를 제외한 파일명을 추출하는 함수
 * @param {string} fileName - 파일명
 * @returns {string} 확장자를 제외한 파일명
 */
function getFileNameWithoutExtension(fileName) {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
}

/**
 * HTTP 헤더용 파일명 정규화 함수 (RFC 5987 준수)
 * @param {string} fileName - 정규화할 파일명
 * @returns {string} HTTP 헤더용 안전한 파일명
 */
function sanitizeFileNameForHeader(fileName) {
    return sanitizeFileName(fileName)
        .replace(/[^\w\s.-]/g, '_')
        .replace(/\s+/g, '_')
        .substring(0, 100);
}

/**
 * 타임스탬프가 포함된 고유 파일명 생성
 * @param {string} baseName - 기본 파일명
 * @param {string} extension - 확장자 (점 포함)
 * @returns {string} 타임스탬프가 포함된 고유 파일명
 */
function generateUniqueFileName(baseName, extension = '') {
    const timestamp = new Date().toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, '')
        .replace('T', '_');
    
    const safeName = sanitizeFileName(baseName);
    return `${safeName}_${timestamp}${extension}`;
}

function showAISettingsModal() {
    const modal = document.getElementById('aiSettingsModal');
    const aiService = envManager.aiService;
    
    document.getElementById('openaiApiKey').value = aiService.apiKeys.openai || '';
    document.getElementById('geminiApiKey').value = aiService.apiKeys.gemini || '';
    document.getElementById('openrouterApiKey').value = aiService.apiKeys.openrouter || '';
    document.getElementById('preferredModel').value = aiService.preferredModel || 'openai/gpt-4o';
    
    updateAISettingsStatus();
    modal.style.display = 'block';
}

function updateAISettingsStatus() {
    const aiService = envManager.aiService;
    document.getElementById('openaiStatus').textContent = aiService.apiKeys.openai ? '✅ 설정됨' : '❌ 미설정';
    document.getElementById('openaiStatus').className = aiService.apiKeys.openai ? 'status-indicator connected' : 'status-indicator disconnected';
    
    document.getElementById('geminiStatus').textContent = aiService.apiKeys.gemini ? '✅ 설정됨' : '❌ 미설정';
    document.getElementById('geminiStatus').className = aiService.apiKeys.gemini ? 'status-indicator connected' : 'status-indicator disconnected';
    
    document.getElementById('openrouterStatus').textContent = aiService.apiKeys.openrouter ? '✅ 설정됨' : '❌ 미설정';
    document.getElementById('openrouterStatus').className = aiService.apiKeys.openrouter ? 'status-indicator connected' : 'status-indicator disconnected';
}

function saveAISettings() {
    const aiService = envManager.aiService;
    const keys = {
        openai: document.getElementById('openaiApiKey').value.trim(),
        gemini: document.getElementById('geminiApiKey').value.trim(),
        openrouter: document.getElementById('openrouterApiKey').value.trim()
    };
    
    aiService.saveAPIKeys(keys);
    aiService.preferredModel = document.getElementById('preferredModel').value;
    localStorage.setItem('ai_preferred_model', aiService.preferredModel);
    
    updateAISettingsStatus();
    envManager.showStatus('✅ AI 설정이 저장되었습니다', 'success');
    closeModal('aiSettingsModal');
}

function clearAllAPIKeys() {
    if (confirm('모든 AI API 키를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        envManager.aiService.clearAPIKeys();
        document.getElementById('openaiApiKey').value = '';
        document.getElementById('geminiApiKey').value = '';
        document.getElementById('openrouterApiKey').value = '';
        updateAISettingsStatus();
        envManager.showStatus('✅ 모든 AI API 키가 삭제되었습니다', 'success');
    }
}

function showAIChatModal() {
    const modal = document.getElementById('aiChatModal');
    const aiService = envManager.aiService;
    
    const availableModels = aiService.getAvailableModels();
    if (availableModels.length === 0) {
        envManager.showStatus('❌ AI API 키가 설정되지 않았습니다. 먼저 AI 설정에서 API 키를 입력해주세요.', 'error');
        showAISettingsModal();
        return;
    }
    
    const chatModelSelect = document.getElementById('chatModel');
    chatModelSelect.innerHTML = availableModels.map(model => 
        `<option value="${model.value}" ${model.value === aiService.preferredModel ? 'selected' : ''}>${model.label}</option>`
    ).join('');
    
    renderChatHistory();
    modal.style.display = 'block';
    
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

function renderChatHistory() {
    const chatHistory = document.getElementById('chatHistory');
    const messages = envManager.aiService.chatHistory;
    
    // 시스템 메시지 (환영 메시지)
    const systemMessage = `
        <div class="chat-message system ai-welcome-message">
            <div class="message-avatar system-avatar">🤖</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">AI 도우미</span>
                    <span class="message-time">지금</span>
                </div>
                <div class="message-text">
                    <p>안녕하세요! 환경변수 관리를 도와드리겠습니다. 다음과 같은 작업이 가능합니다:</p>
                    <ul class="ai-capabilities">
                        <li><span class="capability-icon">⚙️</span> 환경변수 추가/수정/삭제</li>
                        <li><span class="capability-icon">✅</span> 환경변수 값 검증 및 제안</li>
                        <li><span class="capability-icon">🔒</span> 보안 관련 조언</li>
                        <li><span class="capability-icon">📁</span> 설정 파일 구조화</li>
                    </ul>
                    <p class="ai-prompt">어떤 도움이 필요하신가요?</p>
                </div>
            </div>
        </div>
    `;
    
    // 사용자와 AI의 대화 메시지들
    const otherMessages = messages.map((msg, index) => {
        const isUser = msg.role === 'user';
        const timestamp = new Date().toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        return `
            <div class="chat-message ${msg.role}" style="animation-delay: ${index * 0.1}s">
                <div class="message-avatar ${isUser ? 'user-avatar' : 'system-avatar'}">
                    ${isUser ? '👤' : '🤖'}
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${isUser ? '사용자' : 'AI 도우미'}</span>
                        <span class="message-time">${timestamp}</span>
                    </div>
                    <div class="message-text">
                        ${formatMessageContent(msg.content)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    chatHistory.innerHTML = systemMessage + otherMessages;
    
    // 스크롤을 맨 아래로 이동
    setTimeout(() => {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 100);
}

/**
 * 메시지 컨텐츠를 포맷팅하는 함수
 */
function formatMessageContent(content) {
    if (!content) return '';
    
    // 마크다운 스타일 처리
    let formatted = content
        // 코드 블록 처리
        .replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')
        // 인라인 코드 처리
        .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
        // 볼드 처리
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // 이탤릭 처리
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // 링크 처리
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        // 줄바꿈 처리
        .replace(/\n/g, '<br>')
        // 리스트 처리
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    return formatted;
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const message = input.value.trim();
    
    if (!message) {
        input.focus();
        return;
    }
    
    const selectedModel = document.getElementById('chatModel').value;
    const aiService = envManager.aiService;
    
    // UI 업데이트
    input.value = '';
    sendButton.disabled = true;
    sendButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="loading-spinner">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
            </circle>
        </svg>
    `;
    
    // 사용자 메시지 추가
    aiService.addToChatHistory('user', message);
    renderChatHistory();
    
    try {
        const response = await aiService.sendMessage(message, selectedModel);
        
        // 환경변수 수정 명령 처리
        const modificationResult = await processEnvironmentModification(response);
        
        let finalResponse = response;
        if (modificationResult.hasModifications) {
            finalResponse += `\n\n🔄 **환경변수 수정 결과:**\n${modificationResult.summary}`;
        }
        
        aiService.addToChatHistory('assistant', finalResponse);
        renderChatHistory();
        
        // 성공 피드백
        playNotificationSound('success');
        
    } catch (error) {
        console.error('🚨 AI 채팅 오류:', error);
        
        // 오류 메시지를 새로운 디자인으로 표시
        const errorMessage = `죄송합니다. AI 응답 중 오류가 발생했습니다: ${error.message}`;
        
        const chatHistory = document.getElementById('chatHistory');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'chat-message error';
        errorDiv.innerHTML = `
            <div class="message-avatar error-avatar">❌</div>
            <div class="message-content error-content">
                <div class="message-header">
                    <span class="message-author">오류</span>
                    <span class="message-time">${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div class="message-text">
                    ${errorMessage}
                </div>
            </div>
        `;
        
        chatHistory.appendChild(errorDiv);
        
        // 오류 사운드 재생
        playNotificationSound('error');
        
    } finally {
        // UI 복원
        sendButton.disabled = false;
        sendButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 11L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        // 입력 필드에 포커스
        input.focus();
        
        // 스크롤 조정
        const chatHistory = document.getElementById('chatHistory');
        setTimeout(() => {
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }, 100);
    }
}

/**
 * 알림 사운드 재생 함수
 */
function playNotificationSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 타입별 주파수 설정
        const frequencies = {
            success: 800,
            error: 300,
            info: 500
        };
        
        oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        // 사운드 재생 실패 시 조용히 무시
        console.debug('사운드 재생 실패:', error);
    }
}

function clearChatHistory() {
    if (confirm('대화 기록을 모두 삭제하시겠습니까?')) {
        envManager.aiService.clearChatHistory();
        renderChatHistory();
        envManager.showStatus('✅ 대화 기록이 삭제되었습니다', 'success');
    }
}

// === 전역 함수들 (HTML onclick 이벤트용) ===

// 파일 목록 새로고침 기능 (향상된 버전)
async function refreshFileList() {
    if (!envManager) {
        console.error('❌ EnvManager 인스턴스가 초기화되지 않았습니다.');
        showEnhancedErrorToast(
            '시스템 초기화 오류',
            '환경변수 관리자가 아직 준비되지 않았습니다. 페이지를 새로고침해주세요.',
            'error',
            {
                showReloadButton: true,
                persistent: true
            }
        );
        return;
    }
    
    try {
        await envManager.refreshFileList();
        showEnhancedErrorToast(
            '새로고침 완료',
            '환경변수 파일 목록이 성공적으로 업데이트되었습니다.',
            'success'
        );
    } catch (error) {
        console.error('❌ 파일 목록 새로고침 실패:', error);
        showEnhancedErrorToast(
            '새로고침 실패',
            `파일 목록을 새로고침하는 중 오류가 발생했습니다: ${error.message}`,
            'error',
            {
                showRetryButton: true,
                retryAction: 'refreshFileList'
            }
        );
    }
}

/**
 * 향상된 에러 토스트 표시 함수
 */
function showEnhancedErrorToast(title, message, type = 'error', options = {}) {
    const {
        showReloadButton = false,
        showRetryButton = false,
        retryAction = null,
        persistent = false,
        duration = persistent ? 0 : 8000
    } = options;

    // 토스트 컨테이너 확인/생성
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // 토스트 요소 생성
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} enhanced-toast`;
    
    // 아이콘 선택
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    // 액션 버튼들 HTML
    let actionButtons = '';
    if (showReloadButton) {
        actionButtons += '<button class="toast-action-btn reload-btn" onclick="window.location.reload()">🔄 페이지 새로고침</button>';
    }
    if (showRetryButton && retryAction) {
        actionButtons += `<button class="toast-action-btn retry-btn" onclick="${retryAction}()">🔁 다시 시도</button>`;
    }
    
    toast.innerHTML = `
        <div class="toast-header">
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-title">${title}</span>
            <button class="toast-close" onclick="this.closest('.toast').remove()">&times;</button>
        </div>
        <div class="toast-body">
            <p class="toast-message">${message}</p>
            ${actionButtons ? `<div class="toast-actions">${actionButtons}</div>` : ''}
        </div>
        ${!persistent ? '<div class="toast-progress"></div>' : ''}
    `;
    
    // 토스트 추가
    toastContainer.appendChild(toast);
    
    // 애니메이션 트리거
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 자동 제거 (persistent가 아닌 경우)
    if (!persistent && duration > 0) {
        const progressBar = toast.querySelector('.toast-progress');
        if (progressBar) {
            progressBar.style.animationDuration = `${duration}ms`;
        }
        
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
    
    return toast;
}

// 저장 기능 (FAB 호환)
async function saveCurrentFile() {
    if (!envManager.currentFileId) {
        showEnhancedErrorToast(
            '파일 선택 필요',
            '저장할 파일을 먼저 선택해주세요.',
            'warning'
        );
        return;
    }
    
    try {
        // 로딩 토스트 표시
        const loadingToast = showEnhancedErrorToast(
            '저장 중',
            '환경변수 파일을 저장하고 있습니다...',
            'info',
            { persistent: true }
        );
        
        await envManager.saveCurrentFile();
        
        // 로딩 토스트 제거
        if (loadingToast.parentNode) {
            loadingToast.parentNode.removeChild(loadingToast);
        }
        
        // 성공 토스트 표시
        showEnhancedErrorToast(
            '저장 완료',
            '환경변수 파일이 성공적으로 저장되었습니다.',
            'success'
        );
        
    } catch (error) {
        console.error('❌ 저장 오류:', error);
        showEnhancedErrorToast(
            '저장 실패',
            `저장 중 오류가 발생했습니다: ${error.message}`,
            'error',
            {
                showRetryButton: true,
                retryAction: 'saveCurrentFile'
            }
        );
    }
}

// 백업 기능 (FAB 호환)
async function createBackup() {
    if (!envManager.currentFileId) {
        showEnhancedErrorToast(
            '파일 선택 필요',
            '백업할 파일을 먼저 선택해주세요.',
            'warning'
        );
        return;
    }
    
    try {
        // 로딩 토스트 표시
        const loadingToast = showEnhancedErrorToast(
            '백업 생성 중',
            '환경변수 파일의 백업을 생성하고 있습니다...',
            'info',
            { persistent: true }
        );
        
        await envManager.createBackup();
        
        // 로딩 토스트 제거
        if (loadingToast.parentNode) {
            loadingToast.parentNode.removeChild(loadingToast);
        }
        
        // 성공 토스트 표시
        showEnhancedErrorToast(
            '백업 완료',
            '환경변수 파일의 백업이 성공적으로 생성되었습니다.',
            'success'
        );
        
    } catch (error) {
        console.error('❌ 백업 오류:', error);
        showEnhancedErrorToast(
            '백업 실패',
            `백업 생성 중 오류가 발생했습니다: ${error.message}`,
            'error',
            {
                showRetryButton: true,
                retryAction: 'createBackup'
            }
        );
    }
}

// 다운로드 기능 (FAB 호환)
async function downloadCurrentFile() {
    if (!envManager.currentFileId) {
        showEnhancedErrorToast(
            '파일 선택 필요',
            '다운로드할 파일을 먼저 선택해주세요.',
            'warning'
        );
        return;
    }
    
    try {
        // 로딩 토스트 표시
        const loadingToast = showEnhancedErrorToast(
            '다운로드 준비 중',
            '파일 다운로드를 준비하고 있습니다...',
            'info',
            { persistent: true }
        );
        
        const file = envManager.envFiles.find(f => f.id === envManager.currentFileId);
        if (!file) {
            throw new Error('파일 정보를 찾을 수 없습니다');
        }
        
        const response = await fetch(`/api/env-files/${envManager.currentFileId}/download`);
        if (!response.ok) {
            throw new Error(`다운로드 실패: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // 안전한 파일명 생성
        const safeFileName = generateUniqueFileName(file.name, '.env');
        a.download = safeFileName;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // 로딩 토스트 제거
        if (loadingToast.parentNode) {
            loadingToast.parentNode.removeChild(loadingToast);
        }
        
        // 성공 토스트 표시
        showEnhancedErrorToast(
            '다운로드 완료',
            `파일 '${file.name}'이 성공적으로 다운로드되었습니다.`,
            'success'
        );
        
    } catch (error) {
        console.error('❌ 다운로드 오류:', error);
        showEnhancedErrorToast(
            '다운로드 실패',
            `다운로드 중 오류가 발생했습니다: ${error.message}`,
            'error',
            {
                showRetryButton: true,
                retryAction: 'downloadCurrentFile'
            }
        );
    }
}

// 전체 다운로드 기능 (FAB 호환)
async function downloadAllStates() {
    try {
        // 로딩 토스트 표시
        const loadingToast = showEnhancedErrorToast(
            '전체 다운로드 준비',
            '모든 환경변수 파일을 압축하고 있습니다...',
            'info',
            { persistent: true }
        );
        
        await envManager.downloadAllStates();
        
        // 로딩 토스트 제거
        if (loadingToast.parentNode) {
            loadingToast.parentNode.removeChild(loadingToast);
        }
        
        // 성공 토스트 표시
        showEnhancedErrorToast(
            '전체 다운로드 완료',
            '모든 환경변수 파일이 성공적으로 다운로드되었습니다.',
            'success'
        );
        
    } catch (error) {
        console.error('❌ 전체 다운로드 오류:', error);
        showEnhancedErrorToast(
            '전체 다운로드 실패',
            `전체 다운로드 중 오류가 발생했습니다: ${error.message}`,
            'error',
            {
                showRetryButton: true,
                retryAction: 'downloadAllStates'
            }
        );
    }
}

// 제거 기능 (FAB 호환)
async function removeCurrentFile() {
    if (!envManager.currentFileId) {
        showEnhancedErrorToast(
            '파일 선택 필요',
            '제거할 파일을 먼저 선택해주세요.',
            'warning'
        );
        return;
    }
    
    // 확인 대화상자
    const file = envManager.envFiles.find(f => f.id === envManager.currentFileId);
    const fileName = file ? file.name : '선택된 파일';
    
    if (!confirm(`정말로 '파일 ${fileName}'을 제거하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
        return;
    }
    
    try {
        // 로딩 토스트 표시
        const loadingToast = showEnhancedErrorToast(
            '파일 제거 중',
            `'파일 ${fileName}'을 제거하고 있습니다...`,
            'info',
            { persistent: true }
        );
        
        await envManager.removeCurrentFile();
        
        // 로딩 토스트 제거
        if (loadingToast.parentNode) {
            loadingToast.parentNode.removeChild(loadingToast);
        }
        
        // 성공 토스트 표시
        showEnhancedErrorToast(
            '파일 제거 완료',
            `'파일 ${fileName}'이 성공적으로 제거되었습니다.`,
            'success'
        );
        
    } catch (error) {
        console.error('❌ 제거 오류:', error);
        showEnhancedErrorToast(
            '파일 제거 실패',
            `파일 제거 중 오류가 발생했습니다: ${error.message}`,
            'error',
            {
                showRetryButton: true,
                retryAction: 'removeCurrentFile'
            }
        );
    }
}

// AI 채팅 모달 표시
function showAIChatModal() {
    const modal = document.getElementById('aiChatModal');
    modal.style.display = 'block';
    
    // 모델 선택 옵션 업데이트
    const modelSelect = document.getElementById('chatModel');
    const availableModels = envManager.aiService.getAvailableModels();
    
    modelSelect.innerHTML = '';
    if (availableModels.length === 0) {
        modelSelect.innerHTML = '<option value="">API 키를 먼저 설정하세요</option>';
        document.getElementById('sendButton').disabled = true;
    } else {
        availableModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.value;
            option.textContent = model.label;
            if (model.value === envManager.aiService.preferredModel) {
                option.selected = true;
            }
            modelSelect.appendChild(option);
        });
        document.getElementById('sendButton').disabled = false;
    }
    
    renderChatHistory();
}

// 모든 API 키 삭제 (FAB 호환)
function clearAllAPIKeys() {
    if (!confirm('모든 AI API 키를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
        return;
    }
    
    try {
        envManager.aiService.clearAPIKeys();
        updateAISettingsStatus();
        
        // 성공 토스트 표시
        showEnhancedErrorToast(
            'API 키 삭제 완료',
            '모든 AI API 키가 성공적으로 삭제되었습니다.',
            'success'
        );
        
    } catch (error) {
        console.error('❌ API 키 삭제 오류:', error);
        showEnhancedErrorToast(
            'API 키 삭제 실패',
            `API 키 삭제 중 오류가 발생했습니다: ${error.message}`,
            'error'
        );
    }
}

// 새 환경변수 추가 (전역 함수)
function addNewVariable() {
    if (!envManager.currentFileId) {
        envManager.showToast('warning', '경고', '먼저 환경변수 파일을 선택해주세요.');
        return;
    }
    
    envManager.addNewVariable();
}

// === EnvManager 인스턴스 생성 ===
let envManager;

// DOM이 로드된 후 EnvManager 인스턴스 생성
// === 터미널 관리 클래스 ===
class TerminalManager {
    constructor() {
        this.terminal = null;
        this.websocket = null;
        this.fitAddon = null;
        this.isConnected = false;
        this.sessionId = null;
    }

    showModal() {
        document.getElementById('terminalModal').style.display = 'block';
    }

    hideModal() {
        document.getElementById('terminalModal').style.display = 'none';
        this.disconnect();
    }

    createLocalTerminal() {
        this.initializeTerminal();
        this.connectWebSocket('local');
    }

    createLocalTerminalWithDirectory(directory) {
        this.initializeTerminal();
        this.connectWebSocket('local', null, directory);
    }

    createSSHTerminal(config) {
        this.initializeTerminal();
        this.connectWebSocket('ssh', config);
    }

    initializeTerminal() {
        if (this.terminal) {
            this.terminal.dispose();
        }

        // xterm.js 터미널 생성
        this.terminal = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Consolas, "Courier New", monospace',
            theme: {
                background: '#1e1e1e',
                foreground: '#d4d4d4',
                cursor: '#ffffff',
                selection: '#264f78'
            },
            cols: 80,
            rows: 24
        });

        // FitAddon 추가
        this.fitAddon = new FitAddon.FitAddon();
        this.terminal.loadAddon(this.fitAddon);

        // 터미널 컨테이너에 연결
        const container = document.getElementById('terminalContainer');
        const placeholder = document.getElementById('terminalPlaceholder');
        placeholder.style.display = 'none';
        
        this.terminal.open(container);
        this.fitAddon.fit();

        // 리사이즈 이벤트
        window.addEventListener('resize', () => {
            if (this.terminal && this.fitAddon) {
                this.fitAddon.fit();
                if (this.websocket && this.isConnected) {
                    this.websocket.send(JSON.stringify({
                        type: 'terminal_resize',
                        cols: this.terminal.cols,
                        rows: this.terminal.rows
                    }));
                }
            }
        });

        // 입력 이벤트
        this.terminal.onData((data) => {
            if (this.websocket && this.isConnected) {
                this.websocket.send(JSON.stringify({
                    type: 'terminal_input',
                    data: data
                }));
            }
        });
    }

    connectWebSocket(type, config = null, directory = null) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        this.websocket = new WebSocket(wsUrl);

        this.websocket.onopen = () => {
            console.log('🔌 WebSocket 연결 성공');
            
            if (type === 'local') {
                const message = {
                    type: 'create_local_terminal'
                };
                if (directory) {
                    message.directory = directory;
                }
                this.websocket.send(JSON.stringify(message));
            } else if (type === 'ssh') {
                this.websocket.send(JSON.stringify({
                    type: 'create_ssh_terminal',
                    config: config
                }));
            }
        };

        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
                case 'terminal_ready':
                    this.isConnected = true;
                    this.sessionId = data.sessionId;
                    this.updateConnectionStatus(true);
                    this.terminal.writeln('🚀 터미널이 준비되었습니다!');
                    if (data.message) {
                        this.terminal.writeln(data.message);
                    }
                    break;
                    
                case 'terminal_output':
                    this.terminal.write(data.data);
                    break;
                    
                case 'terminal_exit':
                    this.terminal.writeln('\r\n🔌 터미널 세션이 종료되었습니다.');
                    this.disconnect();
                    break;
                    
                case 'error':
                    this.terminal.writeln(`\r\n❌ 오류: ${data.message}`);
                    this.updateConnectionStatus(false);
                    break;
            }
        };

        this.websocket.onclose = () => {
            console.log('🔌 WebSocket 연결 종료');
            this.isConnected = false;
            this.updateConnectionStatus(false);
        };

        this.websocket.onerror = (error) => {
            console.error('WebSocket 오류:', error);
            if (this.terminal) {
                this.terminal.writeln('\r\n❌ WebSocket 연결 오류');
            }
            this.updateConnectionStatus(false);
        };
    }

    disconnect() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        
        this.isConnected = false;
        this.sessionId = null;
        this.updateConnectionStatus(false);
        
        // 터미널 컨테이너 초기화
        const container = document.getElementById('terminalContainer');
        const placeholder = document.getElementById('terminalPlaceholder');
        
        if (this.terminal) {
            this.terminal.dispose();
            this.terminal = null;
        }
        
        container.innerHTML = '';
        container.appendChild(placeholder);
        placeholder.style.display = 'flex';
    }

    updateConnectionStatus(connected) {
        const localBtn = document.getElementById('localTerminalBtn');
        const sshBtn = document.getElementById('sshTerminalBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');
        
        if (connected) {
            localBtn.disabled = true;
            sshBtn.disabled = true;
            disconnectBtn.disabled = false;
        } else {
            localBtn.disabled = false;
            sshBtn.disabled = false;
            disconnectBtn.disabled = true;
        }
    }
}

// 전역 터미널 매니저 인스턴스
let terminalManager = null;

// === 터미널 관련 전역 함수들 ===
function showTerminalModal() {
    if (!terminalManager) {
        terminalManager = new TerminalManager();
    }
    terminalManager.showModal();
}

function createLocalTerminal() {
    if (!terminalManager) {
        terminalManager = new TerminalManager();
    }
    terminalManager.createLocalTerminal();
}

function showSSHModal() {
    document.getElementById('sshModal').style.display = 'block';
    loadSSHConfig();
}

function connectSSH() {
    const host = document.getElementById('sshHost').value.trim();
    const port = parseInt(document.getElementById('sshPort').value) || 22;
    const username = document.getElementById('sshUsername').value.trim();
    const authMethod = document.querySelector('input[name="authMethod"]:checked').value;
    const saveConfig = document.getElementById('saveSSHConfig').checked;
    
    if (!host || !username) {
        alert('호스트와 사용자명을 입력해주세요.');
        return;
    }
    
    const config = {
        host: host,
        port: port,
        username: username
    };
    
    if (authMethod === 'key') {
        const privateKey = document.getElementById('sshPrivateKey').value.trim();
        if (!privateKey) {
            alert('SSH 개인키를 입력해주세요.');
            return;
        }
        config.privateKey = privateKey;
    } else {
        const password = document.getElementById('sshPassword').value;
        if (!password) {
            alert('비밀번호를 입력해주세요.');
            return;
        }
        config.password = password;
    }
    
    // 연결 정보 저장 (키 제외)
    if (saveConfig) {
        const configToSave = {
            host: host,
            port: port,
            username: username,
            authMethod: authMethod
        };
        localStorage.setItem('sshConfig', JSON.stringify(configToSave));
    }
    
    // SSH 연결 시도
    if (!terminalManager) {
        terminalManager = new TerminalManager();
    }
    
    terminalManager.createSSHTerminal(config);
    closeModal('sshModal');
}

function disconnectTerminal() {
    if (terminalManager) {
        terminalManager.disconnect();
    }
}

function loadSSHConfig() {
    const savedConfig = localStorage.getItem('sshConfig');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            document.getElementById('sshHost').value = config.host || '';
            document.getElementById('sshPort').value = config.port || 22;
            document.getElementById('sshUsername').value = config.username || '';
            
            const authRadios = document.querySelectorAll('input[name="authMethod"]');
            authRadios.forEach(radio => {
                if (radio.value === config.authMethod) {
                    radio.checked = true;
                }
            });
            
            toggleAuthMethod();
        } catch (error) {
            console.error('SSH 설정 로드 오류:', error);
        }
    }
}

function openDirectoryShell(fileId) {
    // 파일 정보 찾기
    const file = envManager.envFiles.find(f => f.id === fileId);
    if (!file) {
        alert('파일 정보를 찾을 수 없습니다.');
        return;
    }
    
    // 파일 경로에서 디렉토리 추출
    const filePath = file.path;
    const directory = filePath.substring(0, filePath.lastIndexOf('/'));
    
    // 터미널 모달 열기
    if (!terminalManager) {
        terminalManager = new TerminalManager();
    }
    
    // 터미널 모달 열고 해당 디렉토리로 이동
    terminalManager.showModal();
    
    // 짧은 딩레이 후 터미널 생성 및 디렉토리 이동
    setTimeout(() => {
        terminalManager.createLocalTerminalWithDirectory(directory);
    }, 500);
}

function toggleAuthMethod() {
    const authMethod = document.querySelector('input[name="authMethod"]:checked').value;
    const keyGroup = document.getElementById('sshKeyGroup');
    const passwordGroup = document.getElementById('sshPasswordGroup');
    
    if (authMethod === 'key') {
        keyGroup.style.display = 'block';
        passwordGroup.style.display = 'none';
    } else {
        keyGroup.style.display = 'none';
        passwordGroup.style.display = 'block';
    }
}

// SSH 인증 방법 전환 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM 로드 완료, EnvManager 인스턴스 생성 중...');
    envManager = new EnvManager();
    console.log('✅ EnvManager 인스턴스 생성 완료');
    
    // SSH 인증 방법 라디오 버튼 이벤트 리스너
    const authRadios = document.querySelectorAll('input[name="authMethod"]');
    authRadios.forEach(radio => {
        radio.addEventListener('change', toggleAuthMethod);
    });
    
    // 초기 인증 방법 설정
    toggleAuthMethod();
    
    // 플로팅 액션바 초기화
    initFloatingActionBar();
    
    // AI 채팅 입력 필드 Enter 키 지원
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
        
        // 초기 포커스 설정
        chatInput.addEventListener('focus', function() {
            this.style.borderColor = '#667eea';
            this.style.backgroundColor = 'white';
        });
        
        chatInput.addEventListener('blur', function() {
            this.style.borderColor = '#e5e7eb';
            this.style.backgroundColor = '#f9fafb';
        });
    }
});

// 플로팅 액션바 관리
function initFloatingActionBar() {
    const fabMain = document.getElementById('fabMain');
    const floatingActionBar = document.getElementById('floatingActionBar');
    let isExpanded = false;
    
    // 메인 버튼 클릭 이벤트
    fabMain.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleFAB();
    });
    
    // 외부 클릭 시 FAB 닫기
    document.addEventListener('click', function(e) {
        if (!floatingActionBar.contains(e.target) && isExpanded) {
            closeFAB();
        }
    });
    
    // ESC 키로 FAB 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isExpanded) {
            closeFAB();
        }
    });
    
    function toggleFAB() {
        if (isExpanded) {
            closeFAB();
        } else {
            openFAB();
        }
    }
    
    function openFAB() {
        floatingActionBar.classList.add('expanded');
        isExpanded = true;
        
        // 파일 선택 상태에 따른 버튼 활성화/비활성화
        updateFABState();
    }
    
    function closeFAB() {
        floatingActionBar.classList.remove('expanded');
        isExpanded = false;
    }
    
    function updateFABState() {
        const hasSelectedFile = envManager && envManager.currentFileId;
        const fabActions = document.querySelectorAll('.fab-action');
        
        fabActions.forEach(action => {
            if (hasSelectedFile) {
                action.style.opacity = '1';
                action.style.pointerEvents = 'auto';
            } else {
                // AI 도우미와 전체 다운로드는 파일 선택 없이도 사용 가능
                const isAlwaysEnabled = action.onclick.toString().includes('showAIChatModal') || 
                                      action.onclick.toString().includes('downloadAllStates');
                
                if (isAlwaysEnabled) {
                    action.style.opacity = '1';
                    action.style.pointerEvents = 'auto';
                } else {
                    action.style.opacity = '0.5';
                    action.style.pointerEvents = 'none';
                }
            }
        });
    }
    
    // EnvManager의 파일 선택 상태 변경 시 FAB 상태 업데이트
    // 이 함수는 전역으로 접근 가능하도록 설정
    window.updateFABState = updateFABState;
}

// ================================
// 전역 에러 핸들러
// ================================

// 전역 JavaScript 에러 핸들러
window.addEventListener('error', function(event) {
    console.error('🚨 전역 JavaScript 오류 감지:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    // refreshFileList 관련 오류 특별 처리
    if (event.message.includes('refreshFileList is not defined')) {
        showEnhancedErrorToast(
            '함수 로딩 오류',
            '환경변수 관리 함수가 아직 로드되지 않았습니다. 잠시 후 다시 시도하거나 페이지를 새로고침해주세요.',
            'warning',
            {
                showReloadButton: true,
                showRetryButton: true,
                retryAction: 'refreshFileList',
                duration: 10000
            }
        );
    } else {
        // 기타 JavaScript 오류
        showEnhancedErrorToast(
            'JavaScript 오류',
            `페이지에서 오류가 발생했습니다: ${event.message}`,
            'error',
            {
                showReloadButton: true,
                duration: 8000
            }
        );
    }
});

// 처리되지 않은 Promise 거부 핸들러
window.addEventListener('unhandledrejection', function(event) {
    console.error('🚨 처리되지 않은 Promise 거부:', event.reason);
    
    envManager.showToast(
        'error',
        '비동기 작업 오류',
        `비동기 작업 중 오류가 발생했습니다: ${event.reason?.message || event.reason}`,
        'error',
        {
            showReloadButton: true,
            duration: 8000
        }
    );
});

// ===== 폴더 선택 기능 =====

/**
 * 폴더 선택기 열기
 * @param {string} type - 'scan' 또는 'upload'
 */
function openFolderPicker(type) {
    const inputId = type === 'scan' ? 'scanFolderInput' : 'uploadFolderInput';
    const folderInput = document.getElementById(inputId);
    
    if (folderInput) {
        folderInput.click();
    } else {
        console.error(`폴더 입력 요소를 찾을 수 없습니다: ${inputId}`);
        envManager.showToast('error', '오류', '폴더 선택 기능을 사용할 수 없습니다.');
    }
}

/**
 * 폴더 선택 처리
 * @param {string} type - 'scan' 또는 'upload'
 * @param {HTMLInputElement} input - 파일 입력 요소
 */
function handleFolderSelection(type, input) {
    try {
        if (!input.files || input.files.length === 0) {
            return;
        }

        // 첫 번째 파일의 경로에서 디렉토리 추출
        const firstFile = input.files[0];
        let folderPath = '';
        
        if (firstFile.webkitRelativePath) {
            // webkitRelativePath에서 폴더 경로 추출
            const pathParts = firstFile.webkitRelativePath.split('/');
            pathParts.pop(); // 파일명 제거
            folderPath = pathParts.join('/');
        }

        if (!folderPath) {
            envManager.showToast('warning', '경고', '폴더 경로를 추출할 수 없습니다.');
            return;
        }

        // 해당 타입에 맞는 입력 필드에 경로 설정
        if (type === 'scan') {
            const scanPathInput = document.getElementById('scanPath');
            if (scanPathInput) {
                // 상대 경로를 절대 경로로 변환 (현재 작업 디렉토리 기준)
                const absolutePath = folderPath.startsWith('/') ? folderPath : `/${folderPath}`;
                scanPathInput.value = absolutePath;
                envManager.showToast('success', '성공', `스캔 경로가 설정되었습니다: ${absolutePath}`);
            }
        } else if (type === 'upload') {
            const uploadDestInput = document.getElementById('uploadDestination');
            if (uploadDestInput) {
                // 상대 경로를 절대 경로로 변환
                const absolutePath = folderPath.startsWith('/') ? folderPath : `/${folderPath}`;
                uploadDestInput.value = absolutePath;
                envManager.showToast('success', '성공', `업로드 경로가 설정되었습니다: ${absolutePath}`);
            }
        }

        // 선택된 파일 정보 로깅
        console.log(`폴더 선택됨 (${type}):`, {
            folderPath,
            fileCount: input.files.length,
            firstFile: firstFile.name
        });

    } catch (error) {
        console.error('폴더 선택 처리 오류:', error);
        envManager.showToast('error', '오류', `폴더 선택 중 오류가 발생했습니다: ${error.message}`);
    }
}

/**
 * 브라우저의 폴더 선택 지원 여부 확인
 */
function checkFolderPickerSupport() {
    const isSupported = 'webkitdirectory' in document.createElement('input');
    
    if (!isSupported) {
        console.warn('이 브라우저는 폴더 선택 기능을 지원하지 않습니다.');
        envManager.showToast('warning', '브라우저 호환성', 
            '폴더 선택 기능은 Chrome, Edge, Firefox 등 최신 브라우저에서만 지원됩니다.');
    }
    
    return isSupported;
}

// 페이지 로드 시 폴더 선택 지원 여부 확인
document.addEventListener('DOMContentLoaded', function() {
    checkFolderPickerSupport();
    
    // 프로젝트 상태 초기 로드
    refreshProjectStatus();
});

// === 프로젝트 관리 기능 ===

/**
 * 탭 전환 함수
 */
function switchTab(tabName) {
    // 모든 탭 버튼과 컨텐츠 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    
    // 선택된 탭 활성화
    document.getElementById(`${tabName}Tab`).classList.add('active');
    document.getElementById(`${tabName}TabContent`).style.display = 'block';
    
    // 프로젝트 탭 선택 시 데이터 새로고침
    if (tabName === 'project') {
        refreshProjectStatus();
    }
}

/**
 * 프로젝트 상태 새로고침
 */
async function refreshProjectStatus() {
    try {
        const response = await fetch('/api/project/env-status');
        const data = await response.json();
        
        if (data.success) {
            updateProjectDisplay(data.report);
        } else {
            envManager.showToast('error', '오류', '프로젝트 상태를 불러올 수 없습니다.');
        }
    } catch (error) {
        console.error('프로젝트 상태 로드 실패:', error);
        envManager.showToast('error', '오류', '프로젝트 상태를 불러올 수 없습니다.');
    }
}

/**
 * 프로젝트 디스플레이 업데이트
 */
function updateProjectDisplay(report) {
    // 기본 정보 업데이트
    document.getElementById('projectFileCount').textContent = report.summary.totalFiles;
    document.getElementById('projectVarCount').textContent = report.summary.totalVariables;
    document.getElementById('projectIssueCount').textContent = report.summary.issuesCount;
    
    // 상태 표시
    const statusElement = document.getElementById('projectStatus');
    if (report.summary.issuesCount === 0) {
        statusElement.textContent = '✅ 정상';
        statusElement.style.color = '#28a745';
    } else {
        statusElement.textContent = '⚠️ 이슈 있음';
        statusElement.style.color = '#ffc107';
    }
    
    // 프로젝트 파일 목록 업데이트
    updateProjectFiles(report.files);
}

/**
 * 프로젝트 파일 목록 업데이트
 */
function updateProjectFiles(files) {
    const container = document.getElementById('projectFiles');
    container.innerHTML = '';
    
    Object.entries(files).forEach(([type, file]) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'project-file-item';
        
        const statusClass = file.exists ? 'exists' : 'missing';
        const statusText = file.exists ? '존재함' : '없음';
        
        fileItem.innerHTML = `
            <div class="project-file-header">
                <span class="project-file-type">${getFileTypeDisplayName(type)}</span>
                <span class="project-file-status ${statusClass}">${statusText}</span>
            </div>
            <div class="project-file-path">${file.path || 'N/A'}</div>
            <div class="project-file-vars">${file.variableCount || 0}개 변수</div>
        `;
        
        // 클릭 시 파일 선택 (존재하는 경우)
        if (file.exists && file.fullPath) {
            fileItem.style.cursor = 'pointer';
            fileItem.onclick = async () => {
                try {
                    // 일반 파일 관리 탭으로 전환
                    switchTab('files');
                    
                    // 파일을 일반 관리자에 추가
                    const addResponse = await fetch('/api/env-files', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ filePath: file.fullPath })
                    });
                    
                    if (addResponse.ok) {
                        await refreshFileList();
                        // 추가된 파일을 자동으로 선택
                        const addData = await addResponse.json();
                        if (addData.success && addData.file) {
                            await loadEnvFile(addData.file.id);
                        }
                    }
                } catch (error) {
                    console.error('파일 로드 실패:', error);
                    envManager.showToast('error', '오류', '파일을 로드할 수 없습니다.');
                }
            };
        }
        
        container.appendChild(fileItem);
    });
}

/**
 * 파일 타입 디스플레이 이름 반환
 */
function getFileTypeDisplayName(type) {
    const typeNames = {
        'root': '🏠 루트 (Docker)',
        'frontend': '🎨 프론트엔드',
        'backend': '⚙️ 백엔드'
    };
    return typeNames[type] || type;
}

/**
 * 프로젝트 검증
 */
async function validateProject() {
    try {
        envManager.showToast('info', '검증 중', '프로젝트 환경변수를 검증하고 있습니다...');
        
        const response = await fetch('/api/project/validate', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            const validation = data.validation;
            
            if (validation.isValid) {
                envManager.showToast('success', '검증 완료', '모든 환경변수가 유효합니다!');
            } else {
                showValidationResults(validation);
            }
        } else {
            envManager.showToast('error', '오류', '검증 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('검증 실패:', error);
        envManager.showToast('error', '오류', '검증 중 오류가 발생했습니다.');
    }
}

/**
 * 검증 결과 표시
 */
function showValidationResults(validation) {
    let message = `검증 완료:\n`;
    message += `• 이슈: ${validation.issues.length}개\n`;
    message += `• 동기화 제안: ${validation.suggestions.length}개\n\n`;
    
    if (validation.issues.length > 0) {
        message += '주요 이슈:\n';
        validation.issues.slice(0, 3).forEach((issue, index) => {
            message += `${index + 1}. ${issue.message}\n`;
        });
    }
    
    envManager.showToast('warning', '검증 결과', message);
}

/**
 * 프로젝트 동기화
 */
async function syncProject() {
    try {
        // 먼저 제안사항 조회
        const validateResponse = await fetch('/api/project/validate', {
            method: 'POST'
        });
        
        const validateData = await validateResponse.json();
        
        if (!validateData.success) {
            envManager.showToast('error', '오류', '동기화 준비 중 오류가 발생했습니다.');
            return;
        }
        
        const suggestions = validateData.validation.suggestions;
        
        if (suggestions.length === 0) {
            envManager.showToast('success', '동기화 완료', '동기화할 항목이 없습니다. 모든 환경변수가 일치합니다!');
            return;
        }
        
        // 사용자 확인
        const confirmMessage = `${suggestions.length}개 항목을 동기화하시겠습니까?\n\n` +
            suggestions.slice(0, 3).map(s => `• ${s.message}`).join('\n') +
            (suggestions.length > 3 ? `\n• ... 및 ${suggestions.length - 3}개 더` : '');
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        envManager.showToast('info', '동기화 중', '환경변수를 동기화하고 있습니다...');
        
        // 동기화 실행
        const syncResponse = await fetch('/api/project/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ suggestions })
        });
        
        const syncData = await syncResponse.json();
        
        if (syncData.success) {
            const sync = syncData.sync;
            envManager.showToast('success', '동기화 완료', 
                `${sync.successCount}/${sync.totalCount}개 항목이 성공적으로 동기화되었습니다.`);
            
            // 상태 새로고침
            refreshProjectStatus();
        } else {
            envManager.showToast('error', '오류', '동기화 중 오류가 발생했습니다.');
        }
        
    } catch (error) {
        console.error('동기화 실패:', error);
        envManager.showToast('error', '오류', '동기화 중 오류가 발생했습니다.');
    }
}

/**
 * 프로젝트 백업
 */
async function backupProject() {
    try {
        envManager.showToast('info', '백업 중', '프로젝트 환경변수를 백업하고 있습니다...');
        
        const response = await fetch('/api/project/backup', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            const backup = data.backup;
            envManager.showToast('success', '백업 완료', 
                `${backup.files.length}개 파일이 백업되었습니다.\n경로: ${backup.directory}`);
        } else {
            envManager.showToast('error', '오류', '백업 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('백업 실패:', error);
        envManager.showToast('error', '오류', '백업 중 오류가 발생했습니다.');
    }
}
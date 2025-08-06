#!/usr/bin/env node

/**
 * KB 감정다이어리 프로젝트 환경변수 관리 CLI
 */

const path = require('path');
const { spawn } = require('child_process');

// 현재 실행 디렉토리가 프로젝트 루트인지 확인
const currentDir = process.cwd();
const envManagerDir = path.join(currentDir, 'env-manager');

console.log('🌍 KB 감정다이어리 환경변수 관리자');
console.log('=====================================');

// env-manager 디렉토리 존재 확인
if (!require('fs').existsSync(envManagerDir)) {
    console.error('❌ env-manager 디렉토리를 찾을 수 없습니다.');
    console.error('   프로젝트 루트 디렉토리에서 실행해주세요.');
    process.exit(1);
}

// 명령어 파싱
const command = process.argv[2] || 'start';
const args = process.argv.slice(3);

console.log(`📂 프로젝트 루트: ${currentDir}`);
console.log(`🔧 환경변수 관리자: ${envManagerDir}`);

switch (command) {
    case 'start':
    case 'serve':
        console.log('🚀 환경변수 관리 서버를 시작합니다...');
        startServer();
        break;
        
    case 'dev':
        console.log('🔄 개발 모드로 서버를 시작합니다...');
        startServer('dev');
        break;
        
    case 'status':
        console.log('📊 프로젝트 환경변수 상태를 확인합니다...');
        checkStatus();
        break;
        
    case 'validate':
        console.log('✅ 환경변수 일관성을 검증합니다...');
        validateEnv();
        break;
        
    case 'sync':
        console.log('🔄 환경변수를 동기화합니다...');
        syncEnv();
        break;
        
    case 'backup':
        console.log('💾 환경변수 백업을 생성합니다...');
        backupEnv();
        break;
        
    case 'help':
    case '--help':
    case '-h':
        showHelp();
        break;
        
    default:
        console.error(`❌ 알 수 없는 명령어: ${command}`);
        showHelp();
        process.exit(1);
}

function startServer(mode = 'start') {
    const script = mode === 'dev' ? 'dev' : 'start';
    
    console.log(`   포트: 3001`);
    console.log(`   웹 인터페이스: http://localhost:3001`);
    console.log('');
    
    const child = spawn('npm', ['run', script], {
        cwd: envManagerDir,
        stdio: 'inherit',
        env: {
            ...process.env,
            PROJECT_ROOT: currentDir
        }
    });
    
    child.on('error', (error) => {
        console.error('❌ 서버 시작 실패:', error.message);
        process.exit(1);
    });
    
    child.on('exit', (code) => {
        if (code !== 0) {
            console.error(`❌ 서버가 종료되었습니다. 종료 코드: ${code}`);
            process.exit(code);
        }
    });
    
    // 종료 시그널 처리
    process.on('SIGINT', () => {
        console.log('\n🛑 서버를 종료합니다...');
        child.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
        child.kill('SIGTERM');
    });
}

async function checkStatus() {
    try {
        const ProjectEnvManager = require(path.join(envManagerDir, 'config/project-env-manager'));
        const manager = new ProjectEnvManager();
        
        const report = await manager.generateReport();
        
        console.log('\n📋 환경변수 현황:');
        console.log(`   총 파일 수: ${report.summary.totalFiles}`);
        console.log(`   총 환경변수 수: ${report.summary.totalVariables}`);
        console.log(`   검증 이슈: ${report.summary.issuesCount}개`);
        console.log(`   동기화 제안: ${report.summary.suggestionsCount}개`);
        
        console.log('\n📁 파일별 현황:');
        Object.entries(report.files).forEach(([type, file]) => {
            const status = file.exists ? '✅' : '❌';
            console.log(`   ${status} ${type}: ${file.variableCount}개 변수 (${file.path})`);
        });
        
        if (report.issues.length > 0) {
            console.log('\n⚠️  검증 이슈:');
            report.issues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue.message}`);
            });
        }
        
        if (report.suggestions.length > 0) {
            console.log('\n💡 동기화 제안:');
            report.suggestions.forEach((suggestion, index) => {
                console.log(`   ${index + 1}. ${suggestion.message}`);
            });
        }
        
    } catch (error) {
        console.error('❌ 상태 확인 실패:', error.message);
        process.exit(1);
    }
}

async function validateEnv() {
    try {
        const ProjectEnvManager = require(path.join(envManagerDir, 'config/project-env-manager'));
        const manager = new ProjectEnvManager();
        
        const envData = await manager.getProjectEnvStatus();
        const issues = manager.validateConsistency(envData);
        
        if (issues.length === 0) {
            console.log('✅ 모든 환경변수가 유효합니다!');
        } else {
            console.log(`❌ ${issues.length}개의 검증 이슈를 발견했습니다:`);
            issues.forEach((issue, index) => {
                console.log(`   ${index + 1}. [${issue.type}] ${issue.message}`);
            });
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ 검증 실패:', error.message);
        process.exit(1);
    }
}

async function syncEnv() {
    try {
        const ProjectEnvManager = require(path.join(envManagerDir, 'config/project-env-manager'));
        const manager = new ProjectEnvManager();
        
        const envData = await manager.getProjectEnvStatus();
        const suggestions = manager.generateSyncSuggestions(envData);
        
        if (suggestions.length === 0) {
            console.log('✅ 동기화할 항목이 없습니다. 모든 환경변수가 일관됩니다!');
            return;
        }
        
        console.log(`🔄 ${suggestions.length}개 항목을 동기화합니다:`);
        suggestions.forEach((suggestion, index) => {
            console.log(`   ${index + 1}. ${suggestion.message}`);
        });
        
        const results = await manager.applySyncSuggestions(suggestions);
        const successCount = results.filter(r => r.success).length;
        
        console.log(`\n✅ 동기화 완료: ${successCount}/${results.length}개 성공`);
        
        results.forEach((result, index) => {
            const status = result.success ? '✅' : '❌';
            const message = result.success ? result.message : result.error;
            console.log(`   ${status} ${index + 1}. ${message}`);
        });
        
    } catch (error) {
        console.error('❌ 동기화 실패:', error.message);
        process.exit(1);
    }
}

async function backupEnv() {
    try {
        const ProjectEnvManager = require(path.join(envManagerDir, 'config/project-env-manager'));
        const fs = require('fs-extra');
        const manager = new ProjectEnvManager();
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(currentDir, `env-backups/${timestamp}`);
        
        await fs.ensureDir(backupDir);
        
        const files = manager.getProjectEnvFiles();
        const backupFiles = [];
        
        for (const file of files) {
            if (file.exists) {
                const backupPath = path.join(backupDir, `${file.type}.env`);
                await fs.copy(file.fullPath, backupPath);
                backupFiles.push({
                    original: file.fullPath,
                    backup: backupPath,
                    type: file.type
                });
                console.log(`   ✅ ${file.type}: ${file.fullPath} → ${backupPath}`);
            }
        }
        
        console.log(`\n💾 백업 완료! 총 ${backupFiles.length}개 파일`);
        console.log(`📂 백업 위치: ${backupDir}`);
        
    } catch (error) {
        console.error('❌ 백업 실패:', error.message);
        process.exit(1);
    }
}

function showHelp() {
    console.log(`
사용법: npm run env-manager [명령어]

명령어:
  start, serve     환경변수 관리 웹 서버 시작 (기본값)
  dev              개발 모드로 서버 시작 (자동 재시작)
  status           프로젝트 환경변수 현황 조회
  validate         환경변수 일관성 검증
  sync             환경변수 자동 동기화
  backup           환경변수 파일 백업 생성
  help, -h         도움말 표시

예시:
  npm run env-manager start      # 웹 서버 시작
  npm run env-manager status     # 현황 조회
  npm run env-manager validate   # 검증 실행
  npm run env-manager sync       # 자동 동기화

웹 인터페이스: http://localhost:3001
    `);
}
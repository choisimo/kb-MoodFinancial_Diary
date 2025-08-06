// Jest 테스트 설정 파일
const fs = require('fs-extra');
const path = require('path');

// 테스트 환경 설정
process.env.NODE_ENV = 'test';

// 테스트용 임시 디렉토리 생성
const testDir = path.join(__dirname, '..', 'test-temp');

beforeAll(async () => {
    await fs.ensureDir(testDir);
});

afterAll(async () => {
    await fs.remove(testDir);
});

// 전역 테스트 헬퍼 함수들
global.createTestFile = async (fileName, content) => {
    const filePath = path.join(testDir, fileName);
    await fs.writeFile(filePath, content);
    return filePath;
};

global.cleanupTestFiles = async () => {
    await fs.emptyDir(testDir);
};

// 매치어 확장
expect.extend({
    toBeValidFileName(received) {
        const invalidChars = /[<>:"/\\|?*]/;
        const pass = !invalidChars.test(received) && received.length > 0 && received.length <= 255;
        
        if (pass) {
            return {
                message: () => `expected ${received} not to be a valid filename`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be a valid filename`,
                pass: false,
            };
        }
    },
});
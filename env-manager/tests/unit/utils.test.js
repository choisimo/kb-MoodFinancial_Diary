/**
 * 유틸리티 함수들의 단위 테스트
 */

// 테스트용 유틸리티 함수들을 불러오기 위해 모듈화
const {
    sanitizeFileName,
    getFileExtension,
    getFileNameWithoutExtension,
    sanitizeFileNameForHeader,
    generateUniqueFileName
} = require('./utils');

describe('Utility Functions Unit Tests', () => {
    describe('sanitizeFileName', () => {
        test('should handle normal file names', () => {
            expect(sanitizeFileName('test.env')).toBe('test.env');
            expect(sanitizeFileName('my-project.env')).toBe('my-project.env');
        });

        test('should remove dangerous characters', () => {
            expect(sanitizeFileName('test<>file.env')).toBe('test__file.env');
            expect(sanitizeFileName('test/\\:*?"file.env')).toBe('test______file.env');
        });

        test('should handle spaces and multiple underscores', () => {
            expect(sanitizeFileName('test file.env')).toBe('test_file.env');
            expect(sanitizeFileName('test   file.env')).toBe('test_file.env');
            expect(sanitizeFileName('test___file.env')).toBe('test_file.env');
        });

        test('should handle Windows reserved names', () => {
            expect(sanitizeFileName('CON.env')).toBe('safe_CON.env');
            expect(sanitizeFileName('PRN.txt')).toBe('safe_PRN.txt');
            expect(sanitizeFileName('COM1.env')).toBe('safe_COM1.env');
        });

        test('should handle leading/trailing dots and underscores', () => {
            expect(sanitizeFileName('...test.env')).toBe('test.env');
            expect(sanitizeFileName('test.env...')).toBe('test.env');
            expect(sanitizeFileName('___test.env___')).toBe('test.env');
        });

        test('should enforce length limits', () => {
            const longName = 'a'.repeat(300) + '.env';
            const result = sanitizeFileName(longName);
            expect(result.length).toBeLessThanOrEqual(255);
            expect(result.endsWith('.env')).toBe(true);
        });

        test('should handle empty or invalid input', () => {
            expect(sanitizeFileName('')).toBe('untitled');
            expect(sanitizeFileName(null)).toBe('untitled');
            expect(sanitizeFileName(undefined)).toBe('untitled');
            expect(sanitizeFileName(123)).toBe('untitled');
        });

        test('should return valid filenames', () => {
            const testCases = [
                'test<>file.env',
                'test/\\:*?"file.env',
                'CON.env',
                '...test.env...',
                'test   file.env'
            ];

            testCases.forEach(testCase => {
                const result = sanitizeFileName(testCase);
                expect(result).toBeValidFileName();
            });
        });
    });

    describe('getFileExtension', () => {
        test('should extract file extensions correctly', () => {
            expect(getFileExtension('test.env')).toBe('.env');
            expect(getFileExtension('file.tar.gz')).toBe('.gz');
            expect(getFileExtension('no-extension')).toBe('');
        });

        test('should handle edge cases', () => {
            expect(getFileExtension('.env')).toBe('');
            expect(getFileExtension('test.')).toBe('.');
            expect(getFileExtension('')).toBe('');
        });
    });

    describe('getFileNameWithoutExtension', () => {
        test('should remove extensions correctly', () => {
            expect(getFileNameWithoutExtension('test.env')).toBe('test');
            expect(getFileNameWithoutExtension('file.tar.gz')).toBe('file.tar');
            expect(getFileNameWithoutExtension('no-extension')).toBe('no-extension');
        });
    });

    describe('sanitizeFileNameForHeader', () => {
        test('should create header-safe filenames', () => {
            const result = sanitizeFileNameForHeader('test file!@#.env');
            expect(result.length).toBeLessThanOrEqual(100);
            expect(result).not.toMatch(/[^\w\s.-]/);
        });
    });

    describe('generateUniqueFileName', () => {
        test('should generate unique filenames with timestamps', () => {
            const result1 = generateUniqueFileName('test', '.env');
            const result2 = generateUniqueFileName('test', '.env');
            
            expect(result1).toMatch(/^test_\d{8}_\d{6}\.env$/);
            expect(result2).toMatch(/^test_\d{8}_\d{6}\.env$/);
            expect(result1).not.toBe(result2); // 시간차로 인해 다를 가능성 높음
        });

        test('should handle unsafe names', () => {
            const result = generateUniqueFileName('test<>file', '.env');
            expect(result).toMatch(/^test__file_\d{8}_\d{6}\.env$/);
        });
    });
});
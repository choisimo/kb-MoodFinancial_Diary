/**
 * 유틸리티 함수들을 모듈로 분리
 */

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

module.exports = {
    sanitizeFileName,
    getFileExtension,
    getFileNameWithoutExtension,
    sanitizeFileNameForHeader,
    generateUniqueFileName
};
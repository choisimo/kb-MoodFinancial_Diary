package com.nodove.MoodDiary.service;

import com.nodove.MoodDiary.config.FileStorageProperties;
import com.nodove.MoodDiary.exception.FileStorageException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {
    
    private final FileStorageProperties fileStorageProperties;
    
    /**
     * 프로필 이미지 업로드
     */
    public String storeProfileImage(MultipartFile file, Long userId) {
        validateImageFile(file);
        
        try {
            // 업로드 디렉토리 생성
            Path uploadPath = Paths.get(fileStorageProperties.getProfileImageDir());
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // 파일명 생성 (userId_UUID.확장자)
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = getFileExtension(originalFilename);
            String newFilename = userId + "_" + UUID.randomUUID().toString() + "." + fileExtension;
            
            // 파일 저장
            Path targetLocation = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            log.info("프로필 이미지 업로드 완료: userId={}, filename={}", userId, newFilename);
            
            // 상대 경로 반환
            return "/uploads/profiles/" + newFilename;
            
        } catch (IOException ex) {
            throw new FileStorageException("파일 저장에 실패했습니다: " + file.getOriginalFilename(), ex);
        }
    }
    
    /**
     * 파일 삭제
     */
    public void deleteFile(String filePath) {
        try {
            if (filePath != null && !filePath.isEmpty()) {
                // 상대 경로에서 실제 파일 경로 계산
                Path fileToDelete = Paths.get(filePath.substring(1)); // 맨 앞의 '/' 제거
                Files.deleteIfExists(fileToDelete);
                log.info("파일 삭제 완료: {}", filePath);
            }
        } catch (IOException ex) {
            log.error("파일 삭제 실패: {}", filePath, ex);
        }
    }
    
    /**
     * 이미지 파일 유효성 검증
     */
    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new FileStorageException("빈 파일은 업로드할 수 없습니다.");
        }
        
        // 파일 크기 검증
        if (file.getSize() > fileStorageProperties.getMaxFileSize()) {
            throw new FileStorageException("파일 크기가 너무 큽니다. 최대 크기: " + 
                (fileStorageProperties.getMaxFileSize() / 1024 / 1024) + "MB");
        }
        
        // 파일 타입 검증
        String contentType = file.getContentType();
        if (contentType == null || !Arrays.asList(fileStorageProperties.getAllowedImageTypes()).contains(contentType)) {
            throw new FileStorageException("지원되지 않는 파일 형식입니다. 지원 형식: " + 
                Arrays.toString(fileStorageProperties.getAllowedImageTypes()));
        }
        
        // 파일명 안전성 검증
        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        if (filename.contains("..")) {
            throw new FileStorageException("파일명에 상대 경로가 포함되어 있습니다: " + filename);
        }
    }
    
    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }
}
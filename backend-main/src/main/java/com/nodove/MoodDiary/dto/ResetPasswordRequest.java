package com.nodove.MoodDiary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 비밀번호 재설정 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {
    
    @NotBlank(message = "토큰은 필수입니다")
    private String token;
    
    @NotBlank(message = "새 비밀번호는 필수입니다")
    @Size(min = 8, max = 20, message = "비밀번호는 8자 이상 20자 이하여야 합니다")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]", 
             message = "비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다")
    private String newPassword;
}

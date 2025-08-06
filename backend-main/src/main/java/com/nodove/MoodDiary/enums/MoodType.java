package com.nodove.MoodDiary.enums;

import lombok.Getter;

@Getter
public enum MoodType {
    VERY_HAPPY("매우 행복", "😄", "#FFD700"),
    HAPPY("행복", "😊", "#FFA500"),
    CONTENT("만족", "😌", "#90EE90"),
    NEUTRAL("보통", "😐", "#D3D3D3"),
    ANXIOUS("불안", "😰", "#87CEEB"),
    SAD("슬픔", "😢", "#ADD8E6"),
    ANGRY("화남", "😠", "#FF6B6B"),
    DEPRESSED("우울", "😞", "#9370DB"),
    EXCITED("신남", "🤩", "#FF69B4"),
    TIRED("피곤", "😴", "#B0C4DE");
    
    private final String koreanName;
    private final String emoji;
    private final String color;
    
    MoodType(String koreanName, String emoji, String color) {
        this.koreanName = koreanName;
        this.emoji = emoji;
        this.color = color;
    }
}

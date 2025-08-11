package com.nodove.MoodDiary.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
    @GetMapping("/public")
    public Map<String, Object> publicTest() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "success");
        result.put("message", "Public endpoint is working");
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }
    
    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "UP");
        result.put("message", "KB Mood Diary Backend is running");
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }
}

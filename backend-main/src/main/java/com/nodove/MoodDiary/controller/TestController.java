package com.nodove.MoodDiary.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
    @Autowired(required = false)
    private ClientRegistrationRepository clientRegistrationRepository;
    
    @GetMapping("/oauth2-registrations")
    public Map<String, Object> getOAuth2Registrations() {
        Map<String, Object> result = new HashMap<>();
        
        if (clientRegistrationRepository == null) {
            result.put("status", "ClientRegistrationRepository not found");
            return result;
        }
        
        try {
            var googleRegistration = clientRegistrationRepository.findByRegistrationId("google");
            result.put("google", googleRegistration != null ? "registered" : "not found");
        } catch (Exception e) {
            result.put("google", "error: " + e.getMessage());
        }
        
        return result;
    }
}

package com.nodove.MoodDiary.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nodove.MoodDiary.security.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class NotificationWebSocketHandler implements WebSocketHandler {

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();

    public NotificationWebSocketHandler(JwtUtil jwtUtil, ObjectMapper objectMapper) {
        this.jwtUtil = jwtUtil;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String token = getTokenFromSession(session);
        if (token != null && jwtUtil.validateToken(token)) {
            String username = jwtUtil.getUsernameFromToken(token);
            userSessions.put(username, session);
            log.info("WebSocket connection established for user: {}", username);
        } else {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Invalid token"));
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        // 클라이언트로부터의 메시지 처리 (필요시 구현)
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket transport error", exception);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        String username = getUsernameFromSession(session);
        if (username != null) {
            userSessions.remove(username);
            log.info("WebSocket connection closed for user: {}", username);
        }
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    public void sendNotificationToUser(String username, Object notification) {
        WebSocketSession session = userSessions.get(username);
        if (session != null && session.isOpen()) {
            try {
                String message = objectMapper.writeValueAsString(notification);
                session.sendMessage(new TextMessage(message));
            } catch (IOException e) {
                log.error("Failed to send notification to user: {}", username, e);
            }
        }
    }

    private String getTokenFromSession(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query != null && query.startsWith("token=")) {
            return query.substring(6);
        }
        return null;
    }

    private String getUsernameFromSession(WebSocketSession session) {
        String token = getTokenFromSession(session);
        if (token != null && jwtUtil.validateToken(token)) {
            return jwtUtil.getUsernameFromToken(token);
        }
        return null;
    }
}
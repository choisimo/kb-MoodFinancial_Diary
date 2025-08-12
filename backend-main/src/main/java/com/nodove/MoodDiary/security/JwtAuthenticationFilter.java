package com.nodove.MoodDiary.security;

import com.nodove.MoodDiary.entity.User;
import com.nodove.MoodDiary.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            log.debug("Processing request: {} {}, JWT present: {}", request.getMethod(), request.getRequestURI(), jwt != null);
            
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt) && tokenProvider.isAccessToken(jwt)) {
                Long userId = tokenProvider.getUserIdFromToken(jwt);
                String role = tokenProvider.getRoleFromToken(jwt);
                
                // Load user details
                Optional<User> userOptional = userRepository.findById(userId);
                if (userOptional.isEmpty()) {
                    log.warn("JWT token contains non-existent user ID: {}. Token may be stale.", userId);
                    // Clear any existing authentication and continue with anonymous access
                    SecurityContextHolder.clearContext();
                    filterChain.doFilter(request, response);
                    return;
                }
                User user = userOptional.get();
                UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail())
                    .password("") // password not needed for JWT
                    .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)))
                    .build();
                
                // Create authentication token with UserDetails
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails, // principal as UserDetails
                        null, // credentials
                        userDetails.getAuthorities()
                    );
                
                // Set userId as details for easy access
                authentication.setDetails(userId);
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("JWT authentication successful for user: {} ({})", user.getEmail(), userId);
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }
        
        filterChain.doFilter(request, response);
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        log.debug("JWT Filter check - Method: {}, Path: {}", method, path);
        
        // Allow public auth endpoints but protect /api/auth/me and /api/notifications/stream
        if (path.startsWith("/api/auth/")) {
            boolean shouldSkip = !path.equals("/api/auth/me");
            log.debug("Auth endpoint - Path: {}, Should skip JWT: {}", path, shouldSkip);
            return shouldSkip;
        }
        // SSE stream endpoint requires JWT authentication
        if (path.equals("/api/notifications/stream")) {
            log.debug("SSE endpoint - Applying JWT filter");
            return false; // Apply JWT filter
        }
        
        boolean shouldSkip = path.startsWith("/api/public/") ||
               path.startsWith("/api/test/") ||
               path.startsWith("/api/health") ||
               path.startsWith("/login/oauth2/") ||
               path.startsWith("/oauth2/") ||
               path.startsWith("/h2-console/") ||
               path.startsWith("/swagger-ui/") ||
               path.startsWith("/v3/api-docs/") ||
               path.startsWith("/swagger-resources/") ||
               path.startsWith("/webjars/") ||
               path.startsWith("/actuator/");
        
        log.debug("General endpoint - Path: {}, Should skip JWT: {}", path, shouldSkip);
        return shouldSkip;
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        // First try to get token from Authorization header
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            log.debug("Using token from Authorization header");
            return bearerToken.substring(7);
        }
        
        // For SSE connections, try to get token from query parameter
        String tokenParam = request.getParameter("token");
        if (StringUtils.hasText(tokenParam)) {
            log.debug("Using token from query parameter for path: {}", request.getRequestURI());
            return tokenParam;
        }
        
        log.debug("No JWT token found in request to: {}", request.getRequestURI());
        return null;
    }
}
package com.nodove.MoodDiary.security;

import com.nodove.MoodDiary.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:86400000}") // 24 hours
    private long jwtExpiration;
    
    @Value("${jwt.refresh-expiration:604800000}") // 7 days
    private long refreshExpiration;
    
    private static final String CLAIM_USER_ID = "userId";
    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_TOKEN_TYPE = "tokenType";
    private static final String TOKEN_TYPE_ACCESS = "ACCESS";
    private static final String TOKEN_TYPE_REFRESH = "REFRESH";
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }
    
    public String generateAccessToken(User user) {
        return generateToken(user, jwtExpiration, TOKEN_TYPE_ACCESS);
    }
    
    public String generateRefreshToken(User user) {
        return generateToken(user, refreshExpiration, TOKEN_TYPE_REFRESH);
    }
    
    private String generateToken(User user, long expiration, String tokenType) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_USER_ID, user.getId());
        claims.put(CLAIM_ROLE, user.getRole().name());
        claims.put(CLAIM_TOKEN_TYPE, tokenType);
        
        return Jwts.builder()
                .subject(user.getEmail())
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }
    
    public String getEmailFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }
    
    public Long getUserIdFromToken(String token) {
        return getClaimsFromToken(token).get(CLAIM_USER_ID, Long.class);
    }
    
    public String getRoleFromToken(String token) {
        return getClaimsFromToken(token).get(CLAIM_ROLE, String.class);
    }
    
    public String getTokenTypeFromToken(String token) {
        return getClaimsFromToken(token).get(CLAIM_TOKEN_TYPE, String.class);
    }
    
    public Date getExpirationDateFromToken(String token) {
        return getClaimsFromToken(token).getExpiration();
    }
    
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            return expiration.before(new Date());
        } catch (JwtException e) {
            return true;
        }
    }
    
    public boolean isAccessToken(String token) {
        try {
            String tokenType = getTokenTypeFromToken(token);
            return TOKEN_TYPE_ACCESS.equals(tokenType);
        } catch (JwtException e) {
            return false;
        }
    }
    
    public boolean isRefreshToken(String token) {
        try {
            String tokenType = getTokenTypeFromToken(token);
            return TOKEN_TYPE_REFRESH.equals(tokenType);
        } catch (JwtException e) {
            return false;
        }
    }
    
    private Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    public boolean validateToken(String token) {
        try {
            getClaimsFromToken(token);
            return !isTokenExpired(token);
        } catch (ExpiredJwtException e) {
            log.debug("JWT token is expired: {}", e.getMessage());
            return false;
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        } catch (JwtException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
            return false;
        }
    }
    
    public boolean validateAccessToken(String token) {
        return validateToken(token) && isAccessToken(token);
    }
    
    public boolean validateRefreshToken(String token) {
        return validateToken(token) && isRefreshToken(token);
    }
    
    public long getExpirationTime() {
        return jwtExpiration;
    }
    
    public long getRefreshExpirationTime() {
        return refreshExpiration;
    }
}
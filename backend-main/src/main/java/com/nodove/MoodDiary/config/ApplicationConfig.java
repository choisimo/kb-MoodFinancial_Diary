package com.nodove.MoodDiary.config;

import com.nodove.MoodDiary.enums.DatabaseConstants;
import com.nodove.MoodDiary.enums.EmailConstants;
import com.nodove.MoodDiary.enums.OAuthConstants;
import com.nodove.MoodDiary.enums.OAuth2Scopes;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

import java.util.Properties;

@Configuration
public class ApplicationConfig {

    @Bean
    public JavaMailSender getJavaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(EmailConstants.SMTP_HOST.getStringValue());
        mailSender.setPort(EmailConstants.SMTP_PORT.getIntValue());

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", EmailConstants.SMTP_AUTH.getBooleanValue());
        props.put("mail.smtp.starttls.enable", EmailConstants.STARTTLS_ENABLE.getBooleanValue());
        props.put("mail.debug", "true");

        return mailSender;
    }

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        return new InMemoryClientRegistrationRepository(
            googleClientRegistration(),
            kakaoClientRegistration()
        );
    }

    private ClientRegistration googleClientRegistration() {
        return ClientRegistration.withRegistrationId(OAuthConstants.GOOGLE_PROVIDER.getValue())
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri(OAuthConstants.OAUTH_REDIRECT_URI.getValue())
                .scope(OAuth2Scopes.GOOGLE_EMAIL.getScope(), OAuth2Scopes.GOOGLE_PROFILE.getScope())
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://www.googleapis.com/oauth2/v4/token")
                .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
                .userNameAttributeName("sub")
                .build();
    }

    private ClientRegistration kakaoClientRegistration() {
        return ClientRegistration.withRegistrationId(OAuthConstants.KAKAO_PROVIDER.getValue())
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri(OAuthConstants.OAUTH_REDIRECT_URI.getValue())
                .scope(OAuth2Scopes.KAKAO_PROFILE_NICKNAME.getScope(), OAuth2Scopes.KAKAO_ACCOUNT_EMAIL.getScope())
                .authorizationUri(OAuthConstants.KAKAO_AUTHORIZATION_URI.getValue())
                .tokenUri(OAuthConstants.KAKAO_TOKEN_URI.getValue())
                .userInfoUri(OAuthConstants.KAKAO_USER_INFO_URI.getValue())
                .userNameAttributeName(OAuthConstants.KAKAO_USER_NAME_ATTRIBUTE.getValue())
                .build();
    }
}
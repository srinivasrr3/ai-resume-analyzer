package com.resume.resume_analyzer_backend.service;

import com.resume.resume_analyzer_backend.dto.auth.AuthResponse;
import com.resume.resume_analyzer_backend.dto.auth.PasswordValidationResult;
import com.resume.resume_analyzer_backend.dto.auth.SignInRequest;
import com.resume.resume_analyzer_backend.dto.auth.SignUpRequest;
import com.resume.resume_analyzer_backend.model.AppUser;
import com.resume.resume_analyzer_backend.model.UserSession;
import com.resume.resume_analyzer_backend.repository.AppUserRepository;
import com.resume.resume_analyzer_backend.repository.UserSessionRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AuthService {

    private static final int SESSION_DAYS = 30;
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile(".*[a-z].*");
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile(".*[A-Z].*");
    private static final Pattern DIGIT_PATTERN = Pattern.compile(".*\\d.*");
    private static final Pattern SPECIAL_PATTERN = Pattern.compile(".*[^A-Za-z0-9].*");

    private final AppUserRepository appUserRepository;
    private final UserSessionRepository userSessionRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(AppUserRepository appUserRepository, UserSessionRepository userSessionRepository) {
        this.appUserRepository = appUserRepository;
        this.userSessionRepository = userSessionRepository;
    }

    public PasswordValidationResult validatePasswordStrength(String password) {
        PasswordValidationResult result = new PasswordValidationResult();
        if (password == null) {
            result.setValid(false);
            result.getRecommendations().add("Password is required.");
            return result;
        }

        if (password.length() < 10) {
            result.getRecommendations().add("Use at least 10 characters.");
        }
        if (!LOWERCASE_PATTERN.matcher(password).matches()) {
            result.getRecommendations().add("Add at least one lowercase letter.");
        }
        if (!UPPERCASE_PATTERN.matcher(password).matches()) {
            result.getRecommendations().add("Add at least one uppercase letter.");
        }
        if (!DIGIT_PATTERN.matcher(password).matches()) {
            result.getRecommendations().add("Add at least one number.");
        }
        if (!SPECIAL_PATTERN.matcher(password).matches()) {
            result.getRecommendations().add("Add at least one special character.");
        }

        result.setValid(result.getRecommendations().isEmpty());
        return result;
    }

    public AuthResponse signUp(SignUpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (appUserRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered.");
        }

        PasswordValidationResult passwordCheck = validatePasswordStrength(request.getPassword());
        if (!passwordCheck.isValid()) {
            throw new IllegalArgumentException("Weak password. " + String.join(" ", passwordCheck.getRecommendations()));
        }

        AppUser user = new AppUser();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        appUserRepository.save(user);

        return createSessionResponse(user, "Account created successfully.");
    }

    public AuthResponse signIn(SignInRequest request) {
        AppUser user = appUserRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        user.setLastLoginAt(LocalDateTime.now());
        appUserRepository.save(user);

        return createSessionResponse(user, "Signed in successfully.");
    }

    public Optional<AppUser> findUserByToken(String token) {
        if (token == null || token.isBlank()) return Optional.empty();

        return userSessionRepository.findByToken(token)
                .filter(session -> !session.isRevoked())
                .filter(session -> session.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(session -> {
                    session.setLastAccessAt(LocalDateTime.now());
                    userSessionRepository.save(session);
                    return session.getUser();
                });
    }

    public void signOut(String token) {
        if (token == null || token.isBlank()) return;
        userSessionRepository.findByToken(token).ifPresent(session -> {
            session.setRevoked(true);
            userSessionRepository.save(session);
        });
    }

    private AuthResponse createSessionResponse(AppUser user, String message) {
        revokeExistingSessions(user);

        UserSession session = new UserSession();
        session.setUser(user);
        session.setToken(UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().substring(0, 8));
        session.setExpiresAt(LocalDateTime.now().plusDays(SESSION_DAYS));
        userSessionRepository.save(session);

        AuthResponse response = new AuthResponse();
        response.setToken(session.getToken());
        response.setUserId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setExpiresAt(session.getExpiresAt());
        response.setMessage(message);
        return response;
    }

    private void revokeExistingSessions(AppUser user) {
        List<UserSession> sessions = userSessionRepository.findByUserAndRevokedFalse(user);
        for (UserSession session : sessions) {
            session.setRevoked(true);
        }
        userSessionRepository.saveAll(sessions);
    }
}

package com.resume.resume_analyzer_backend;

import com.resume.resume_analyzer_backend.dto.auth.AuthResponse;
import com.resume.resume_analyzer_backend.dto.auth.ForgotPasswordRequest;
import com.resume.resume_analyzer_backend.dto.auth.PasswordValidationResult;
import com.resume.resume_analyzer_backend.dto.auth.SignInRequest;
import com.resume.resume_analyzer_backend.dto.auth.SignUpRequest;
import com.resume.resume_analyzer_backend.model.AppUser;
import com.resume.resume_analyzer_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@Valid @RequestBody SignUpRequest request) {
        try {
            AuthResponse response = authService.signUp(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(error(ex.getMessage()));
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@Valid @RequestBody SignInRequest request) {
        try {
            AuthResponse response = authService.signIn(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error(ex.getMessage()));
        }
    }

    @PostMapping("/signout")
    public ResponseEntity<?> signOut(@RequestHeader(value = "Authorization", required = false) String authorization) {
        String token = extractBearerToken(authorization);
        authService.signOut(token);
        return ResponseEntity.ok(Map.of("message", "Signed out successfully."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            authService.forgotPassword(request);
            return ResponseEntity.ok(Map.of("message", "Password reset successful. You can sign in with your new password."));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(error(ex.getMessage()));
        }
    }

    @GetMapping("/password-policy")
    public Map<String, Object> passwordPolicy() {
        PasswordValidationResult sampleCheck = authService.validatePasswordStrength("abc");
        return Map.of(
                "minimumLength", 10,
                "requiresLowercase", true,
                "requiresUppercase", true,
                "requiresNumber", true,
                "requiresSpecialCharacter", true,
                "recommendationsExample", sampleCheck.getRecommendations()
        );
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        String token = extractBearerToken(authorization);
        Optional<AppUser> user = authService.findUserByToken(token);
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Session expired or invalid."));
        }
        return ResponseEntity.ok(Map.of(
                "userId", user.get().getId(),
                "fullName", user.get().getFullName(),
                "email", user.get().getEmail()
        ));
    }

    private String extractBearerToken(String authorization) {
        if (authorization == null || authorization.isBlank()) return null;
        if (authorization.toLowerCase().startsWith("bearer ")) {
            return authorization.substring(7).trim();
        }
        return authorization.trim();
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("error", message);
        return map;
    }
}

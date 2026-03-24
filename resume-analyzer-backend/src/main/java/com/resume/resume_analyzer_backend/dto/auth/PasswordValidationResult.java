package com.resume.resume_analyzer_backend.dto.auth;

import java.util.ArrayList;
import java.util.List;

public class PasswordValidationResult {
    private boolean valid;
    private final List<String> recommendations = new ArrayList<>();

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }
}

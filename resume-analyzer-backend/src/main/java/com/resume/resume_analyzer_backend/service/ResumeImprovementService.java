package com.resume.resume_analyzer_backend.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class ResumeImprovementService {

    public List<String> generateSuggestions(Set<String> resumeSkills,
                                            Set<String> jdSkills,
                                            String resumeText) {

        List<String> suggestions = new ArrayList<>();

        for (String skill : jdSkills) {
            if (!resumeSkills.contains(skill)) {
                suggestions.add("Add practical experience with " + skill +
                        " to increase ATS compatibility.");
            }
        }

        if (!resumeText.matches(".*\\d+.*")) {
            suggestions.add("Include measurable achievements (e.g., increased performance by 30%).");
        }

        if (!resumeText.toLowerCase().contains("project")) {
            suggestions.add("Add project descriptions to strengthen technical credibility.");
        }

        if (resumeText.length() < 1500) {
            suggestions.add("Expand your resume with more detailed experience sections.");
        }

        suggestions.add("Use strong action verbs like 'Implemented', 'Optimized', 'Designed'.");
        suggestions.add("Ensure formatting is ATS-friendly (simple layout, no graphics).");

        return suggestions;
    }
}

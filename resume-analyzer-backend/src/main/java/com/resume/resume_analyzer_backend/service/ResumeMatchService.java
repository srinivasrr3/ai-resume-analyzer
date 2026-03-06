package com.resume.resume_analyzer_backend.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeMatchService {

    // Master skill dictionary (expand anytime)
    private static final Set<String> MASTER_SKILLS = new HashSet<>(Arrays.asList(
            "java","spring","spring boot","hibernate","python","django",
            "flask","node","nodejs","express","react","angular",
            "mongodb","mysql","postgresql","sql","docker","kubernetes",
            "aws","azure","gcp","devops","jenkins","git",
            "html","css","javascript","typescript",
            "microservices","rest","api","machine learning",
            "data analysis","power bi","tableau","c","c++",
            "linux","bash","agile","scrum"
    ));

    public Map<String, Object> analyze(String resumeText, String jobDescription) {

        Map<String, Object> result = new HashMap<>();

        resumeText = resumeText.toLowerCase();
        jobDescription = jobDescription.toLowerCase();

        // Extract skills
        Set<String> resumeSkills = extractSkills(resumeText);
        Set<String> jdSkills = extractSkills(jobDescription);

        // Matching logic
        Set<String> matchedSkills = new HashSet<>(resumeSkills);
        matchedSkills.retainAll(jdSkills);

        Set<String> missingSkills = new HashSet<>(jdSkills);
        missingSkills.removeAll(resumeSkills);

        // Score calculation
        double matchScore = jdSkills.isEmpty()
                ? 0
                : ((double) matchedSkills.size() / jdSkills.size()) * 100;

        matchScore = Math.round(matchScore);

        // ATS Breakdown
        double keywordScore = matchScore;
        double skillScore = matchScore * 0.9;
        double formatScore = 85;
        double contentScore = matchScore * 0.8;

        keywordScore = Math.min(100, Math.round(keywordScore));
        skillScore = Math.min(100, Math.round(skillScore));
        contentScore = Math.min(100, Math.round(contentScore));

        // Improvement Suggestions
        List<String> suggestions = generateSuggestions(missingSkills);

        result.put("matchScore", matchScore);
        result.put("matchedSkills", new ArrayList<>(matchedSkills));
        result.put("missingSkills", new ArrayList<>(missingSkills));
        result.put("improvementSuggestions", suggestions);

        result.put("keywordScore", keywordScore);
        result.put("skillScore", skillScore);
        result.put("formatScore", formatScore);
        result.put("contentScore", contentScore);

        return result;
    }

    private Set<String> extractSkills(String text) {
        return MASTER_SKILLS.stream()
                .filter(text::contains)
                .collect(Collectors.toSet());
    }

    private List<String> generateSuggestions(Set<String> missingSkills) {

        List<String> suggestions = new ArrayList<>();

        if (!missingSkills.isEmpty()) {
            suggestions.add("Add the following missing skills to align better with the job description: "
                    + String.join(", ", missingSkills) + ".");
        }

        suggestions.add("Ensure your resume includes measurable achievements (e.g., improved performance by 30%).");
        suggestions.add("Use industry-relevant keywords naturally within your experience descriptions.");
        suggestions.add("Maintain consistent formatting and professional section structure.");
        suggestions.add("Highlight tools, technologies, and frameworks used in real projects.");

        return suggestions;
    }
}
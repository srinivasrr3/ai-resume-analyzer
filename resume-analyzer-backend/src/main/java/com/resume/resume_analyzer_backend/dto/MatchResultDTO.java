package com.resume.resume_analyzer_backend.dto;

import java.util.List;

public class MatchResultDTO {

    private double matchScore;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> improvementSuggestions;

    public MatchResultDTO(double matchScore,
                          List<String> matchedSkills,
                          List<String> missingSkills,
                          List<String> improvementSuggestions) {
        this.matchScore = matchScore;
        this.matchedSkills = matchedSkills;
        this.missingSkills = missingSkills;
        this.improvementSuggestions = improvementSuggestions;
    }

    public double getMatchScore() {
        return matchScore;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public List<String> getImprovementSuggestions() {
        return improvementSuggestions;
    }
}

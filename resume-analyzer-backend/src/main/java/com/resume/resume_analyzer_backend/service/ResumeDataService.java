package com.resume.resume_analyzer_backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resume.resume_analyzer_backend.model.AppUser;
import com.resume.resume_analyzer_backend.model.ResumeAnalysisRecord;
import com.resume.resume_analyzer_backend.repository.ResumeAnalysisRecordRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ResumeDataService {

    private final ResumeAnalysisRecordRepository repository;
    private final ObjectMapper objectMapper;

    public ResumeDataService(ResumeAnalysisRecordRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public void saveAnalysis(
            AppUser user,
            String originalFileName,
            String resumeExtractedText,
            String jobDescription,
            Map<String, Object> analysis
    ) {
        ResumeAnalysisRecord record = new ResumeAnalysisRecord();
        record.setUser(user);
        record.setOriginalFileName(originalFileName);
        record.setResumeExtractedText(resumeExtractedText);
        record.setJobDescription(jobDescription);

        record.setOverallScore(intValue(analysis.get("matchScore")));
        record.setKeywordScore(intValue(analysis.get("keywordScore")));
        record.setSkillScore(intValue(analysis.get("skillScore")));
        record.setFormatScore(intValue(analysis.get("formatScore")));
        record.setContentScore(intValue(analysis.get("contentScore")));
        record.setExperienceScore(intValue(analysis.get("experienceScore")));
        record.setEducationScore(intValue(analysis.get("educationScore")));
        record.setImpactScore(intValue(analysis.get("impactScore")));

        record.setMatchedSkillsJson(toJson(analysis.get("matchedSkills")));
        record.setMissingSkillsJson(toJson(analysis.get("missingSkills")));
        record.setCriticalMissingSkillsJson(toJson(analysis.get("criticalMissingSkills")));
        record.setCategoryScoresJson(toJson(analysis.get("categoryScores")));
        record.setStrengthsJson(toJson(analysis.get("strengths")));
        record.setRiskFlagsJson(toJson(analysis.get("riskFlags")));
        record.setSuggestionsJson(toJson(analysis.get("improvementSuggestions")));
        record.setAnalysisSummary(asString(analysis.get("analysisSummary")));

        repository.save(record);
    }

    public List<Map<String, Object>> getUserHistory(AppUser user) {
        return repository.findTop20ByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toHistoryItem)
                .toList();
    }

    private Map<String, Object> toHistoryItem(ResumeAnalysisRecord record) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", record.getId());
        map.put("originalFileName", record.getOriginalFileName());
        map.put("createdAt", record.getCreatedAt());
        map.put("matchScore", record.getOverallScore());
        map.put("keywordScore", record.getKeywordScore());
        map.put("skillScore", record.getSkillScore());
        map.put("formatScore", record.getFormatScore());
        map.put("contentScore", record.getContentScore());
        map.put("experienceScore", record.getExperienceScore());
        map.put("educationScore", record.getEducationScore());
        map.put("impactScore", record.getImpactScore());
        map.put("matchedSkills", parseList(record.getMatchedSkillsJson()));
        map.put("missingSkills", parseList(record.getMissingSkillsJson()));
        map.put("criticalMissingSkills", parseList(record.getCriticalMissingSkillsJson()));
        map.put("categoryScores", parseMap(record.getCategoryScoresJson()));
        map.put("strengths", parseList(record.getStrengthsJson()));
        map.put("riskFlags", parseList(record.getRiskFlagsJson()));
        map.put("improvementSuggestions", parseList(record.getSuggestionsJson()));
        map.put("analysisSummary", record.getAnalysisSummary());
        return map;
    }

    private Integer intValue(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) {
            return n.intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }

    private String toJson(Object value) {
        if (value == null) return null;
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            return null;
        }
    }

    private List<String> parseList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception ex) {
            return Collections.emptyList();
        }
    }

    private Map<String, Integer> parseMap(String json) {
        if (json == null || json.isBlank()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Integer>>() {});
        } catch (Exception ex) {
            return Collections.emptyMap();
        }
    }
}

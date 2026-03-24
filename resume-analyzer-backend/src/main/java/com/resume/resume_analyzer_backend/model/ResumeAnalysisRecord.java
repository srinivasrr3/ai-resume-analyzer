package com.resume.resume_analyzer_backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "resume_analysis_records")
public class ResumeAnalysisRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @Column(length = 255)
    private String originalFileName;

    @Lob
    @Column(nullable = false)
    private String jobDescription;

    @Lob
    @Column(nullable = false)
    private String resumeExtractedText;

    private Integer overallScore;
    private Integer keywordScore;
    private Integer skillScore;
    private Integer formatScore;
    private Integer contentScore;
    private Integer experienceScore;
    private Integer educationScore;
    private Integer impactScore;

    @Lob
    private String matchedSkillsJson;

    @Lob
    private String missingSkillsJson;

    @Lob
    private String criticalMissingSkillsJson;

    @Lob
    private String categoryScoresJson;

    @Lob
    private String strengthsJson;

    @Lob
    private String riskFlagsJson;

    @Lob
    private String suggestionsJson;

    @Lob
    private String analysisSummary;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public String getResumeExtractedText() {
        return resumeExtractedText;
    }

    public void setResumeExtractedText(String resumeExtractedText) {
        this.resumeExtractedText = resumeExtractedText;
    }

    public Integer getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Integer overallScore) {
        this.overallScore = overallScore;
    }

    public Integer getKeywordScore() {
        return keywordScore;
    }

    public void setKeywordScore(Integer keywordScore) {
        this.keywordScore = keywordScore;
    }

    public Integer getSkillScore() {
        return skillScore;
    }

    public void setSkillScore(Integer skillScore) {
        this.skillScore = skillScore;
    }

    public Integer getFormatScore() {
        return formatScore;
    }

    public void setFormatScore(Integer formatScore) {
        this.formatScore = formatScore;
    }

    public Integer getContentScore() {
        return contentScore;
    }

    public void setContentScore(Integer contentScore) {
        this.contentScore = contentScore;
    }

    public Integer getExperienceScore() {
        return experienceScore;
    }

    public void setExperienceScore(Integer experienceScore) {
        this.experienceScore = experienceScore;
    }

    public Integer getEducationScore() {
        return educationScore;
    }

    public void setEducationScore(Integer educationScore) {
        this.educationScore = educationScore;
    }

    public Integer getImpactScore() {
        return impactScore;
    }

    public void setImpactScore(Integer impactScore) {
        this.impactScore = impactScore;
    }

    public String getMatchedSkillsJson() {
        return matchedSkillsJson;
    }

    public void setMatchedSkillsJson(String matchedSkillsJson) {
        this.matchedSkillsJson = matchedSkillsJson;
    }

    public String getMissingSkillsJson() {
        return missingSkillsJson;
    }

    public void setMissingSkillsJson(String missingSkillsJson) {
        this.missingSkillsJson = missingSkillsJson;
    }

    public String getCriticalMissingSkillsJson() {
        return criticalMissingSkillsJson;
    }

    public void setCriticalMissingSkillsJson(String criticalMissingSkillsJson) {
        this.criticalMissingSkillsJson = criticalMissingSkillsJson;
    }

    public String getCategoryScoresJson() {
        return categoryScoresJson;
    }

    public void setCategoryScoresJson(String categoryScoresJson) {
        this.categoryScoresJson = categoryScoresJson;
    }

    public String getStrengthsJson() {
        return strengthsJson;
    }

    public void setStrengthsJson(String strengthsJson) {
        this.strengthsJson = strengthsJson;
    }

    public String getRiskFlagsJson() {
        return riskFlagsJson;
    }

    public void setRiskFlagsJson(String riskFlagsJson) {
        this.riskFlagsJson = riskFlagsJson;
    }

    public String getSuggestionsJson() {
        return suggestionsJson;
    }

    public void setSuggestionsJson(String suggestionsJson) {
        this.suggestionsJson = suggestionsJson;
    }

    public String getAnalysisSummary() {
        return analysisSummary;
    }

    public void setAnalysisSummary(String analysisSummary) {
        this.analysisSummary = analysisSummary;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}

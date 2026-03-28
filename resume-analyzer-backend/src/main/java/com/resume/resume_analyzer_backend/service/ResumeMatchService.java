package com.resume.resume_analyzer_backend.service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ResumeMatchService {

    private static final Set<String> DEFAULT_SKILLS = new LinkedHashSet<>(Arrays.asList(
            "java", "spring", "spring boot", "hibernate", "python", "django",
            "flask", "node", "nodejs", "express", "react", "angular",
            "mongodb", "mysql", "postgresql", "sql", "docker", "kubernetes",
            "aws", "azure", "gcp", "devops", "jenkins", "git",
            "html", "css", "javascript", "typescript",
            "microservices", "rest", "rest api", "api", "machine learning",
            "data analysis", "power bi", "tableau", "c", "c++",
            "linux", "bash", "agile", "scrum", "ci/cd", "communication",
            "leadership", "project management", "kotlin", "swift",
            "sales", "marketing", "accounting", "finance", "recruitment",
            "customer service", "negotiation", "teamwork", "problem solving"
    ));

    private static final Set<String> STOPWORDS = new HashSet<>(Arrays.asList(
            "the", "and", "for", "with", "that", "this", "from", "into", "your",
            "you", "our", "are", "was", "were", "have", "has", "had", "will",
            "would", "should", "can", "could", "to", "of", "in", "on", "at",
            "by", "or", "an", "a", "as", "be", "is", "it", "if", "we", "us",
            "about", "using", "use", "plus", "etc", "than", "over", "under"
    ));

    private static final Set<String> ACTION_VERBS = new HashSet<>(Arrays.asList(
            "built", "designed", "developed", "implemented", "optimized", "led",
            "created", "improved", "delivered", "engineered", "automated",
            "reduced", "increased", "migrated", "scaled", "analyzed", "launched"
    ));

    private static final Pattern YEARS_PATTERN = Pattern.compile("(\\d{1,2})\\s*\\+?\\s*(years|year|yrs|yr)");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern PHONE_PATTERN = Pattern.compile("(\\+?\\d[\\d\\s\\-()]{7,}\\d)");

    private final Map<String, String> normalizedSkillMap;

    public ResumeMatchService() {
        this.normalizedSkillMap = loadSkills();
    }

    public Map<String, Object> analyze(String resumeText, String jobDescription) {
        Map<String, Object> result = new LinkedHashMap<>();

        String resume = safeLower(resumeText);
        String jd = safeLower(jobDescription);

        Set<String> resumeSkills = extractSkills(resume);
        Set<String> jdSkills = extractSkills(jd);
        Map<String, Integer> jdSkillWeights = computeJobSkillWeights(jd, jdSkills);

        Set<String> matchedSkills = new LinkedHashSet<>(resumeSkills);
        matchedSkills.retainAll(jdSkills);

        Set<String> missingSkills = new LinkedHashSet<>(jdSkills);
        missingSkills.removeAll(resumeSkills);

        List<String> criticalMissingSkills = missingSkills.stream()
                .filter(skill -> jdSkillWeights.getOrDefault(skill, 1) >= 2)
                .sorted()
                .toList();

        double skillCoverageScore = computeWeightedCoverage(jdSkillWeights, matchedSkills);
        double keywordScore = computeKeywordRelevance(resume, jd);
        double experienceScore = computeExperienceScore(resume, jd);
        double educationScore = computeEducationScore(resume, jd);
        double impactScore = computeImpactScore(resume);
        double formatScore = computeFormatScore(resume);

        double contentStrengthScore = roundToInt((experienceScore * 0.45) + (impactScore * 0.35) + (educationScore * 0.20));
        double overallAtsScore = roundToInt(
                (skillCoverageScore * 0.35) +
                        (keywordScore * 0.20) +
                        (experienceScore * 0.15) +
                        (impactScore * 0.10) +
                        (educationScore * 0.08) +
                        (formatScore * 0.12)
        );

        Map<String, Integer> categoryScores = new LinkedHashMap<>();
        categoryScores.put("Skills Alignment", (int) skillCoverageScore);
        categoryScores.put("Keyword Relevance", (int) keywordScore);
        categoryScores.put("Experience Fit", (int) experienceScore);
        categoryScores.put("Impact & Achievements", (int) impactScore);
        categoryScores.put("Education Fit", (int) educationScore);
        categoryScores.put("ATS Formatting", (int) formatScore);

        List<String> strengths = generateStrengths(
                matchedSkills, skillCoverageScore, keywordScore, experienceScore, impactScore, formatScore);
        List<String> riskFlags = generateRiskFlags(
                missingSkills, criticalMissingSkills, resume, formatScore, impactScore, experienceScore);
        List<String> suggestions = generateSuggestions(criticalMissingSkills, missingSkills, riskFlags, resume);

        result.put("matchScore", overallAtsScore);
        result.put("matchedSkills", sortedList(matchedSkills));
        result.put("missingSkills", sortedList(missingSkills));
        result.put("criticalMissingSkills", criticalMissingSkills);
        result.put("improvementSuggestions", suggestions);

        result.put("keywordScore", keywordScore);
        result.put("skillScore", skillCoverageScore);
        result.put("formatScore", formatScore);
        result.put("contentScore", contentStrengthScore);

        result.put("experienceScore", experienceScore);
        result.put("educationScore", educationScore);
        result.put("impactScore", impactScore);
        result.put("categoryScores", categoryScores);
        result.put("strengths", strengths);
        result.put("riskFlags", riskFlags);
        result.put("jdSkillCount", jdSkills.size());
        result.put("resumeSkillCount", resumeSkills.size());
        result.put("matchedSkillCount", matchedSkills.size());
        result.put("analysisSummary", buildSummary(overallAtsScore, strengths, riskFlags, criticalMissingSkills));

        return result;
    }

    private Map<String, String> loadSkills() {
        Map<String, String> allSkills = new LinkedHashMap<>();
        for (String skill : DEFAULT_SKILLS) {
            addSkill(allSkills, skill);
        }
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new ClassPathResource("skills.txt").getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String skill = line.trim().toLowerCase(Locale.ROOT);
                if (skill.isBlank() || skill.startsWith("#")) {
                    continue;
                }
                addSkill(allSkills, skill);
            }
        } catch (Exception ignored) {
            // Keep default skills if resource loading fails.
        }
        return allSkills;
    }

    private void addSkill(Map<String, String> target, String skill) {
        String normalizedSkill = normalizeText(skill);
        if (!normalizedSkill.isBlank()) {
            target.putIfAbsent(normalizedSkill, skill);
        }
    }

    private String safeLower(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }

    private Set<String> extractSkills(String text) {
        if (text.isBlank()) return Collections.emptySet();

        Set<String> found = new LinkedHashSet<>();
        String normalized = " " + normalizeText(text) + " ";
        for (Map.Entry<String, String> skillEntry : normalizedSkillMap.entrySet()) {
            String token = " " + skillEntry.getKey() + " ";
            if (normalized.contains(token)) {
                found.add(skillEntry.getValue());
            }
        }

        // Alias normalization so "nodejs" and "node" are treated consistently.
        if (found.contains("nodejs")) {
            found.add("node");
        }
        if (found.contains("rest api")) {
            found.add("rest");
            found.add("api");
        }
        return found;
    }

    private String normalizeText(String input) {
        return input
                .replaceAll("[^a-z0-9+#/\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private Map<String, Integer> computeJobSkillWeights(String jd, Set<String> jdSkills) {
        Map<String, Integer> weights = new HashMap<>();
        for (String skill : jdSkills) {
            int weight = 1;
            if (isCriticalSkill(jd, skill)) {
                weight = 3;
            } else if (isPreferredSkill(jd, skill)) {
                weight = 2;
            }
            weights.put(skill, weight);
        }
        return weights;
    }

    private boolean isCriticalSkill(String jd, String skill) {
        return containsWindow(jd, skill, Arrays.asList(
                "must", "required", "mandatory", "minimum", "need", "strong", "hands on"));
    }

    private boolean isPreferredSkill(String jd, String skill) {
        return containsWindow(jd, skill, Arrays.asList(
                "preferred", "nice to have", "good to have", "plus"));
    }

    private boolean containsWindow(String text, String skill, List<String> triggers) {
        int idx = text.indexOf(skill);
        if (idx < 0) return false;
        int from = Math.max(0, idx - 80);
        int to = Math.min(text.length(), idx + skill.length() + 80);
        String window = text.substring(from, to);
        for (String trigger : triggers) {
            if (window.contains(trigger)) {
                return true;
            }
        }
        return false;
    }

    private double computeWeightedCoverage(Map<String, Integer> jdSkillWeights, Set<String> matchedSkills) {
        if (jdSkillWeights.isEmpty()) return 0;
        int total = jdSkillWeights.values().stream().mapToInt(Integer::intValue).sum();
        int covered = jdSkillWeights.entrySet().stream()
                .filter(e -> matchedSkills.contains(e.getKey()))
                .mapToInt(Map.Entry::getValue)
                .sum();
        return roundToInt((covered * 100.0) / total);
    }

    private double computeKeywordRelevance(String resume, String jd) {
        Set<String> jdTokens = extractRelevantTokens(jd);
        Set<String> resumeTokens = extractRelevantTokens(resume);
        if (jdTokens.isEmpty()) return 0;

        long exactTokenMatches = jdTokens.stream().filter(resumeTokens::contains).count();
        double tokenScore = (exactTokenMatches * 100.0) / jdTokens.size();

        Set<String> jdBigrams = extractBigrams(jdTokens);
        Set<String> resumeBigrams = extractBigrams(resumeTokens);
        long bigramMatches = jdBigrams.stream().filter(resumeBigrams::contains).count();
        double bigramScore = jdBigrams.isEmpty() ? tokenScore : (bigramMatches * 100.0) / jdBigrams.size();

        return roundToInt((tokenScore * 0.7) + (bigramScore * 0.3));
    }

    private Set<String> extractRelevantTokens(String text) {
        String normalized = normalizeText(text);
        Set<String> tokens = new LinkedHashSet<>();
        for (String token : normalized.split(" ")) {
            if (token.length() < 3) continue;
            if (STOPWORDS.contains(token)) continue;
            tokens.add(token);
        }
        return tokens;
    }

    private Set<String> extractBigrams(Set<String> orderedTokens) {
        List<String> list = new ArrayList<>(orderedTokens);
        Set<String> bigrams = new LinkedHashSet<>();
        for (int i = 0; i < list.size() - 1; i++) {
            bigrams.add(list.get(i) + "_" + list.get(i + 1));
        }
        return bigrams;
    }

    private double computeExperienceScore(String resume, String jd) {
        int resumeYears = maxYearsFound(resume);
        int jdYears = maxYearsFound(jd);

        double yearsFit;
        if (jdYears <= 0) {
            yearsFit = resumeYears > 0 ? 78 : 58;
        } else if (resumeYears >= jdYears) {
            yearsFit = 92;
        } else {
            yearsFit = Math.max(35, (resumeYears * 100.0) / jdYears);
        }

        int sectionSignals = 0;
        if (resume.contains("experience")) sectionSignals += 10;
        if (resume.contains("project")) sectionSignals += 6;
        if (resume.contains("responsible") || resume.contains("ownership")) sectionSignals += 4;

        return clamp(roundToInt(yearsFit + sectionSignals), 0, 100);
    }

    private int maxYearsFound(String text) {
        Matcher matcher = YEARS_PATTERN.matcher(text);
        int max = 0;
        while (matcher.find()) {
            int value = Integer.parseInt(matcher.group(1));
            if (value > max) max = value;
        }
        return max;
    }

    private double computeEducationScore(String resume, String jd) {
        boolean jdBachelors = containsAny(jd, "bachelor", "b.tech", "bs", "bsc");
        boolean jdMasters = containsAny(jd, "master", "m.tech", "ms", "msc");
        boolean jdPhd = containsAny(jd, "phd", "doctorate");

        boolean hasBachelors = containsAny(resume, "bachelor", "b.tech", "bs", "bsc");
        boolean hasMasters = containsAny(resume, "master", "m.tech", "ms", "msc");
        boolean hasPhd = containsAny(resume, "phd", "doctorate");

        if (!jdBachelors && !jdMasters && !jdPhd) {
            return hasBachelors || hasMasters || hasPhd ? 85 : 65;
        }

        if (jdPhd) return hasPhd ? 95 : 55;
        if (jdMasters) return (hasMasters || hasPhd) ? 92 : (hasBachelors ? 70 : 50);
        return (hasBachelors || hasMasters || hasPhd) ? 90 : 52;
    }

    private double computeImpactScore(String resume) {
        int metricCount = countRegex(resume, "\\b\\d+(\\.\\d+)?\\s*%\\b|\\b\\d+(\\.\\d+)?\\s*(x|k|m|b)\\b|\\$\\s*\\d+");
        int actionVerbHits = (int) ACTION_VERBS.stream().filter(resume::contains).count();
        int bulletCount = countRegex(resume, "(^|\\n)\\s*[-•*]");

        double score = 40;
        score += Math.min(metricCount * 10, 30);
        score += Math.min(actionVerbHits * 3.5, 22);
        score += Math.min(bulletCount * 1.2, 8);

        return clamp(roundToInt(score), 0, 100);
    }

    private double computeFormatScore(String resume) {
        int score = 100;

        boolean hasEmail = EMAIL_PATTERN.matcher(resume).find();
        boolean hasPhone = PHONE_PATTERN.matcher(resume).find();
        if (!hasEmail) score -= 10;
        if (!hasPhone) score -= 8;

        if (!resume.contains("summary")) score -= 6;
        if (!resume.contains("experience")) score -= 10;
        if (!resume.contains("skills")) score -= 8;
        if (!resume.contains("education")) score -= 6;
        if (!resume.contains("project")) score -= 5;

        if (resume.length() < 1000) score -= 8;
        if (resume.length() > 9000) score -= 6;

        int veryLongLines = countRegex(resume, ".{160,}");
        if (veryLongLines > 8) score -= 6;

        return clamp(score, 0, 100);
    }

    private List<String> generateStrengths(
            Set<String> matchedSkills,
            double skillCoverageScore,
            double keywordScore,
            double experienceScore,
            double impactScore,
            double formatScore
    ) {
        List<String> strengths = new ArrayList<>();
        if (skillCoverageScore >= 75) {
            strengths.add("Strong hard-skill alignment with the target job description.");
        }
        if (keywordScore >= 70) {
            strengths.add("Good keyword relevance for ATS parser matching.");
        }
        if (experienceScore >= 75) {
            strengths.add("Experience signals are aligned with role expectations.");
        }
        if (impactScore >= 70) {
            strengths.add("Resume includes measurable outcomes and action-oriented language.");
        }
        if (formatScore >= 80) {
            strengths.add("ATS-friendly structure with core sections present.");
        }
        if (matchedSkills.size() >= 8) {
            strengths.add("Broad technical stack coverage across multiple role-relevant tools.");
        }
        if (strengths.isEmpty()) {
            strengths.add("Baseline alignment exists; prioritizing missing requirements can raise competitiveness quickly.");
        }
        return strengths;
    }

    private List<String> generateRiskFlags(
            Set<String> missingSkills,
            List<String> criticalMissingSkills,
            String resume,
            double formatScore,
            double impactScore,
            double experienceScore
    ) {
        List<String> risks = new ArrayList<>();
        if (!criticalMissingSkills.isEmpty()) {
            risks.add("Critical required skills missing: " + String.join(", ", criticalMissingSkills) + ".");
        }
        if (missingSkills.size() > 8) {
            risks.add("High skill-gap count may reduce shortlist probability.");
        }
        if (impactScore < 55) {
            risks.add("Low measurable impact density; add quantifiable achievements.");
        }
        if (experienceScore < 60) {
            risks.add("Experience signals may be below role expectations.");
        }
        if (formatScore < 70) {
            risks.add("ATS formatting quality is below recommended threshold.");
        }
        if (!resume.contains("project")) {
            risks.add("Missing project section may weaken practical skill validation.");
        }
        return risks;
    }

    private List<String> generateSuggestions(
            List<String> criticalMissingSkills,
            Set<String> missingSkills,
            List<String> riskFlags,
            String resume
    ) {
        List<String> suggestions = new ArrayList<>();

        if (!criticalMissingSkills.isEmpty()) {
            suggestions.add("Prioritize adding evidence for required skills: " + String.join(", ", criticalMissingSkills) + ".");
        }

        if (!missingSkills.isEmpty()) {
            List<String> topGaps = missingSkills.stream().sorted().limit(8).toList();
            suggestions.add("Close secondary skill gaps by adding relevant tools or frameworks: " + String.join(", ", topGaps) + ".");
        }

        if (countRegex(resume, "\\b\\d+(\\.\\d+)?\\s*%\\b|\\$\\s*\\d+") < 2) {
            suggestions.add("Add metrics to at least 3 bullets (percent, time, revenue, cost, scale) to improve impact scoring.");
        }

        if (!resume.contains("summary")) {
            suggestions.add("Add a concise professional summary tailored to the role and domain.");
        }
        if (!resume.contains("project")) {
            suggestions.add("Include 2-3 projects with technologies, architecture choices, and measurable outcomes.");
        }
        if (!EMAIL_PATTERN.matcher(resume).find() || !PHONE_PATTERN.matcher(resume).find()) {
            suggestions.add("Ensure contact details include both email and phone for ATS completeness.");
        }

        if (riskFlags.size() >= 3) {
            suggestions.add("Focus edits in this order: required skills, quantified achievements, ATS section structure.");
        }

        if (suggestions.isEmpty()) {
            suggestions.add("Strong baseline detected. Next optimization: tailor summary and top 5 bullets to the exact JD wording.");
        }
        return suggestions;
    }

    private String buildSummary(
            double overallAtsScore,
            List<String> strengths,
            List<String> riskFlags,
            List<String> criticalMissingSkills
    ) {
        String band =
                overallAtsScore >= 85 ? "Excellent fit" :
                        overallAtsScore >= 70 ? "Good fit" :
                                overallAtsScore >= 55 ? "Moderate fit" : "Low fit";
        String strengthHead = strengths.isEmpty() ? "Strength signals are limited." : strengths.get(0);
        String riskHead = riskFlags.isEmpty()
                ? "No major ATS blockers detected."
                : "Top risk: " + riskFlags.get(0);
        String criticalHead = criticalMissingSkills.isEmpty()
                ? "No critical required skills missing."
                : "Critical gap count: " + criticalMissingSkills.size() + ".";

        return band + " for this JD. " + strengthHead + " " + riskHead + " " + criticalHead;
    }

    private int countRegex(String input, String regex) {
        Matcher matcher = Pattern.compile(regex, Pattern.MULTILINE).matcher(input);
        int count = 0;
        while (matcher.find()) {
            count++;
        }
        return count;
    }

    private boolean containsAny(String text, String... terms) {
        for (String term : terms) {
            if (text.contains(term)) return true;
        }
        return false;
    }

    private int clamp(double value, int min, int max) {
        return (int) Math.max(min, Math.min(max, Math.round(value)));
    }

    private int roundToInt(double value) {
        return (int) Math.round(value);
    }

    private List<String> sortedList(Set<String> input) {
        return input.stream()
                .sorted(Comparator.naturalOrder())
                .collect(Collectors.toList());
    }
}

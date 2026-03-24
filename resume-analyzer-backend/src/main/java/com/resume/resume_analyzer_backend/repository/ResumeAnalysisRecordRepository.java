package com.resume.resume_analyzer_backend.repository;

import com.resume.resume_analyzer_backend.model.AppUser;
import com.resume.resume_analyzer_backend.model.ResumeAnalysisRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeAnalysisRecordRepository extends JpaRepository<ResumeAnalysisRecord, Long> {
    List<ResumeAnalysisRecord> findTop20ByUserOrderByCreatedAtDesc(AppUser user);
}

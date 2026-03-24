package com.resume.resume_analyzer_backend.repository;

import com.resume.resume_analyzer_backend.model.AppUser;
import com.resume.resume_analyzer_backend.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByToken(String token);
    List<UserSession> findByUserAndRevokedFalse(AppUser user);
}

package com.resume.resume_analyzer_backend;

import com.resume.resume_analyzer_backend.model.AppUser;
import com.resume.resume_analyzer_backend.service.AuthService;
import com.resume.resume_analyzer_backend.service.ResumeDataService;
import com.resume.resume_analyzer_backend.service.ResumeMatchService;
import org.apache.tika.Tika;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private final ResumeMatchService resumeMatchService;
    private final ResumeDataService resumeDataService;
    private final AuthService authService;

    public ResumeController(
            ResumeMatchService resumeMatchService,
            ResumeDataService resumeDataService,
            AuthService authService
    ) {
        this.resumeMatchService = resumeMatchService;
        this.resumeDataService = resumeDataService;
        this.authService = authService;
    }

    @GetMapping("/")
    public String home() {
        return "AI Resume Analyzer Backend Running";
    }

    @PostMapping("/upload")
    public Map<String, Object> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("jobDescription") String jobDescription,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) throws Exception {

        Tika tika = new Tika();
        String resumeText = tika.parseToString(file.getInputStream());
        Map<String, Object> analysis = resumeMatchService.analyze(resumeText, jobDescription);

        Optional<AppUser> user = authService.findUserByToken(extractBearerToken(authorization));
        resumeDataService.saveAnalysis(
                user.orElse(null),
                file.getOriginalFilename(),
                resumeText,
                jobDescription,
                analysis
        );

        return analysis;
    }

    @GetMapping("/history")
    public ResponseEntity<?> userHistory(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Optional<AppUser> user = authService.findUserByToken(extractBearerToken(authorization));
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Please sign in to view history."));
        }
        List<Map<String, Object>> history = resumeDataService.getUserHistory(user.get());
        return ResponseEntity.ok(history);
    }

    private String extractBearerToken(String authorization) {
        if (authorization == null || authorization.isBlank()) return null;
        if (authorization.toLowerCase().startsWith("bearer ")) {
            return authorization.substring(7).trim();
        }
        return authorization.trim();
    }
}

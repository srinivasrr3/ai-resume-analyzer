package com.resume.resume_analyzer_backend;

import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.resume.resume_analyzer_backend.service.ResumeMatchService;

import java.util.Map;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = "http://localhost:4200")
public class ResumeController {

    @Autowired
    private ResumeMatchService resumeMatchService;
    @GetMapping("/")
public String home() {
    return "AI Resume Analyzer Backend Running";
}

    @PostMapping("/upload")
    public Map<String, Object> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("jobDescription") String jobDescription
    ) throws Exception {

        Tika tika = new Tika();
        String resumeText = tika.parseToString(file.getInputStream());

        return resumeMatchService.analyze(resumeText, jobDescription);
    }
}
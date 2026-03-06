package com.resume.resume_analyzer_backend;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/test")
public class TestUploadController {

    @PostMapping("/upload")
    public String testUpload(@RequestParam("file") MultipartFile file) {
        System.out.println("✅ FILE RECEIVED: " + file.getOriginalFilename());
        return "FILE OK";
    }
}

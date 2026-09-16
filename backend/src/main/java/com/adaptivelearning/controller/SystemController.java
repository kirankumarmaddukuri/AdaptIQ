package com.adaptivelearning.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    @Value("${gemini.model:gemini-3.6-flash}")
    private String geminiModel;

    @Value("${spring.application.name:AdaptIQ}")
    private String appName;

    @GetMapping("/info")
    public ResponseEntity<Map<String, String>> getSystemInfo() {
        return ResponseEntity.ok(Map.of(
            "geminiModel", geminiModel,
            "appName", appName,
            "aiProvider", "Google Gemini"
        ));
    }
}

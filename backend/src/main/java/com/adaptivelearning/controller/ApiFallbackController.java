package com.adaptivelearning.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ApiFallbackController {

    private static final List<String> VALID_ENDPOINTS = List.of(
            "GET  /api/roles",
            "GET  /api/roles/{roleId}",
            "GET  /api/roles/{roleId}/competencies",
            "GET  /api/modules",
            "GET  /api/modules/{moduleId}",
            "POST /api/modules/{moduleId}/complete",
            "GET  /api/users",
            "GET  /api/users/profile",
            "GET  /api/users/{userId}",
            "PUT  /api/users/profile",
            "GET  /api/dashboard",
            "GET  /api/dashboard/{userId}",
            "GET  /api/learning-path",
            "GET  /api/learning-path/{userId}",
            "POST /api/learning-path/generate",
            "POST /api/assessment/generate",
            "POST /api/assessment/submit",
            "GET  /api/assessment/result/{quizId}",
            "POST /api/checkpoint/generate",
            "POST /api/checkpoint/submit",
            "POST /api/auth/register",
            "POST /api/auth/login",
            "POST /api/auth/verify",
            "GET  /api/system/info"
    );

    @RequestMapping("/api/**")
    public ResponseEntity<Map<String, Object>> handleUnknownApiEndpoint(HttpServletRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("invalidEndpoint", request.getRequestURI());
        body.put("message", "API endpoint '" + request.getRequestURI() + "' was not found on this server.");
        body.put("validEndpoints", VALID_ENDPOINTS);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }
}

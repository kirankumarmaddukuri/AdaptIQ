package com.adaptivelearning.controller;

import com.adaptivelearning.model.LearningModule;
import com.adaptivelearning.service.ContentSynthesisService;
import com.adaptivelearning.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/modules")
public class ModuleController {

    private final ContentSynthesisService contentSynthesisService;
    private final ProgressService progressService;

    public ModuleController(ContentSynthesisService contentSynthesisService, ProgressService progressService) {
        this.contentSynthesisService = contentSynthesisService;
        this.progressService = progressService;
    }

    @GetMapping("/{moduleId}")
    public ResponseEntity<LearningModule> getModule(@PathVariable String moduleId) {
        LearningModule module = contentSynthesisService.synthesizeModuleContent(moduleId);
        return ResponseEntity.ok(module);
    }

    @PostMapping("/{moduleId}/complete")
    public ResponseEntity<Map<String, Object>> completeModule(
            @PathVariable String moduleId,
            @RequestBody Map<String, Object> payload) {

        String userId = (String) payload.getOrDefault("userId", "user-demo-1");
        int answerIndex = ((Number) payload.getOrDefault("exerciseAnswerIndex", 0)).intValue();
        int timeSpent = ((Number) payload.getOrDefault("timeSpentSeconds", 120)).intValue();

        Map<String, Object> result = progressService.completeModule(userId, moduleId, answerIndex, timeSpent);
        return ResponseEntity.ok(result);
    }
}

package com.adaptivelearning.controller;

import com.adaptivelearning.model.LearningModule;
import com.adaptivelearning.repository.DataStore;
import com.adaptivelearning.service.ContentSynthesisService;
import com.adaptivelearning.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Map;

@RestController
@RequestMapping({"/api/modules", "/api/module"})
public class ModuleController {

    private final ContentSynthesisService contentSynthesisService;
    private final ProgressService progressService;
    private final DataStore dataStore;

    public ModuleController(ContentSynthesisService contentSynthesisService, ProgressService progressService, DataStore dataStore) {
        this.contentSynthesisService = contentSynthesisService;
        this.progressService = progressService;
        this.dataStore = dataStore;
    }

    @GetMapping
    public ResponseEntity<Collection<LearningModule>> getAllModules() {
        return ResponseEntity.ok(dataStore.getAllModules());
    }

    @GetMapping("/{moduleId}")
    public ResponseEntity<?> getModule(@PathVariable String moduleId) {
        try {
            LearningModule module = contentSynthesisService.synthesizeModuleContent(moduleId);
            return ResponseEntity.ok(module);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "status", 404,
                    "error", "Not Found",
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/{moduleId}/complete")
    public ResponseEntity<Map<String, Object>> completeModule(
            @PathVariable String moduleId,
            @RequestBody Map<String, Object> payload) {

        String userId = (String) payload.getOrDefault("userId", "user-demo-1");
        int answerIndex = payload.containsKey("exerciseAnswerIndex") && payload.get("exerciseAnswerIndex") != null
                ? ((Number) payload.get("exerciseAnswerIndex")).intValue()
                : -1;
        int timeSpent = ((Number) payload.getOrDefault("timeSpentSeconds", 120)).intValue();

        try {
            Map<String, Object> result = progressService.completeModule(userId, moduleId, answerIndex, timeSpent);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}

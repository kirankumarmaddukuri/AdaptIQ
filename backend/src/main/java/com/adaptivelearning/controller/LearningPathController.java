package com.adaptivelearning.controller;

import com.adaptivelearning.model.LearningPath;
import com.adaptivelearning.service.CurriculumService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/learning-path")
public class LearningPathController {

    private final CurriculumService curriculumService;

    public LearningPathController(CurriculumService curriculumService) {
        this.curriculumService = curriculumService;
    }

    @PostMapping("/generate")
    public ResponseEntity<LearningPath> generatePath(@RequestBody Map<String, String> request) {
        String userId = request.getOrDefault("userId", "user-demo-1");
        LearningPath path = curriculumService.generatePersonalizedPath(userId);
        return ResponseEntity.ok(path);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<LearningPath> getPath(@PathVariable String userId) {
        LearningPath path = curriculumService.getPathForUser(userId);
        return ResponseEntity.ok(path);
    }
}

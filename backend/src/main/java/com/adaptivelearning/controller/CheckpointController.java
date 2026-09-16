package com.adaptivelearning.controller;

import com.adaptivelearning.model.Quiz;
import com.adaptivelearning.model.QuizSubmission;
import com.adaptivelearning.service.CheckpointService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/checkpoint")
public class CheckpointController {

    private final CheckpointService checkpointService;

    public CheckpointController(CheckpointService checkpointService) {
        this.checkpointService = checkpointService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Quiz> generateCheckpoint(@RequestBody Map<String, String> payload) {
        String userId = payload.getOrDefault("userId", "user-demo-1");
        String competency = payload.getOrDefault("competency", "HTML5 & Modern CSS");

        Quiz checkpointQuiz = checkpointService.generateCheckpointQuiz(userId, competency);
        return ResponseEntity.ok(checkpointQuiz);
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitCheckpoint(@RequestBody QuizSubmission submission) {
        Map<String, Object> result = checkpointService.evaluateCheckpoint(submission);
        return ResponseEntity.ok(result);
    }
}

package com.adaptivelearning.controller;

import com.adaptivelearning.model.Quiz;
import com.adaptivelearning.model.QuizResult;
import com.adaptivelearning.model.QuizSubmission;
import com.adaptivelearning.repository.DataStore;
import com.adaptivelearning.service.AssessmentService;
import com.adaptivelearning.service.EvaluationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/assessment")
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final EvaluationService evaluationService;
    private final DataStore dataStore;

    public AssessmentController(AssessmentService assessmentService, EvaluationService evaluationService, DataStore dataStore) {
        this.assessmentService = assessmentService;
        this.evaluationService = evaluationService;
        this.dataStore = dataStore;
    }

    @PostMapping("/generate")
    public ResponseEntity<Quiz> generateAssessment(@RequestBody Map<String, String> request) {
        String userId = request.getOrDefault("userId", "user-demo-1");
        String roleId = request.getOrDefault("roleId", "role-frontend-engineer");

        Quiz quiz = assessmentService.generateDiagnosticQuiz(userId, roleId);
        return ResponseEntity.ok(quiz);
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizResult> submitAssessment(@RequestBody QuizSubmission submission) {
        QuizResult result = evaluationService.evaluateQuiz(submission);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/result/{quizId}")
    public ResponseEntity<QuizResult> getResult(@PathVariable String quizId) {
        QuizResult result = dataStore.getQuizResult(quizId);
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }
}

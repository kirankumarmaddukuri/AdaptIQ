package com.adaptivelearning.service;

import com.adaptivelearning.model.*;
import com.adaptivelearning.repository.DataStore;
import com.adaptivelearning.service.ai.AIGatewayService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CheckpointService {

    private static final Logger logger = LoggerFactory.getLogger(CheckpointService.class);

    private final AIGatewayService aiGatewayService;
    private final DataStore dataStore;
    private final ObjectMapper objectMapper;

    public CheckpointService(AIGatewayService aiGatewayService, DataStore dataStore, ObjectMapper objectMapper) {
        this.aiGatewayService = aiGatewayService;
        this.dataStore = dataStore;
        this.objectMapper = objectMapper;
    }

    public Quiz generateCheckpointQuiz(String userId, String competency) {
        User user = dataStore.getUser(userId);
        if (user == null) {
            user = dataStore.getUsers().values().iterator().next();
        }

        String currentLevel = user.getCompetencyLevels().getOrDefault(competency, "NOVICE");
        String nextLevel = getNextLevel(currentLevel);

        String quizId = "chk-" + UUID.randomUUID().toString().substring(0, 8);
        Quiz quiz = new Quiz(quizId, user.getId(), user.getRoleId(), user.getRoleName(), "CHECKPOINT");
        quiz.setTargetCompetency(competency);

        List<Question> questions = null;

        try {
            questions = generateCheckpointQuestionsWithAI(competency, currentLevel, nextLevel);
        } catch (Exception e) {
            logger.warn("AI Checkpoint generation error: {}. Using structured fallback.", e.getMessage());
        }

        if (questions == null || questions.isEmpty()) {
            questions = generateFallbackCheckpoint(competency, nextLevel);
        }

        quiz.setQuestions(questions);
        dataStore.saveQuiz(quiz);
        return quiz;
    }

    public Map<String, Object> evaluateCheckpoint(QuizSubmission submission) {
        Quiz quiz = dataStore.getQuiz(submission.getQuizId());
        if (quiz == null) {
            throw new IllegalArgumentException("Checkpoint quiz not found: " + submission.getQuizId());
        }

        int total = quiz.getQuestions().size();
        int correct = 0;
        List<Map<String, Object>> reviews = new ArrayList<>();

        for (Question q : quiz.getQuestions()) {
            int selected = submission.getAnswers().getOrDefault(q.getId(), -1);
            boolean isCorrect = (selected == q.getCorrectOptionIndex());
            if (isCorrect) correct++;

            Map<String, Object> rev = new HashMap<>();
            rev.put("questionId", q.getId());
            rev.put("text", q.getText());
            rev.put("selected", selected);
            rev.put("correctIndex", q.getCorrectOptionIndex());
            rev.put("isCorrect", isCorrect);
            rev.put("explanation", q.getExplanation());
            reviews.add(rev);
        }

        int scorePct = (int) Math.round(((double) correct / Math.max(1, total)) * 100);
        boolean passed = scorePct >= 66; // 2 out of 3 or 66%+

        User user = dataStore.getUser(submission.getUserId());
        String competency = quiz.getTargetCompetency();
        String oldLevel = (user != null) ? user.getCompetencyLevels().getOrDefault(competency, "NOVICE") : "NOVICE";
        String newLevel = oldLevel;

        if (passed && user != null) {
            newLevel = getNextLevel(oldLevel);
            user.getCompetencyLevels().put(competency, newLevel);
            int updatedScore = Math.min(100, user.getCompetencyScores().getOrDefault(competency, 50) + 25);
            user.getCompetencyScores().put(competency, updatedScore);

            // Re-evaluate overall level based on average score
            int avgScore = (int) user.getCompetencyScores().values().stream()
                    .mapToInt(Integer::intValue)
                    .average()
                    .orElse(scorePct);

            if (avgScore >= 75) {
                user.setOverallLevel("EXPERT");
            } else if (avgScore >= 45) {
                user.setOverallLevel("INTERMEDIATE");
            }
            dataStore.saveUser(user);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("passed", passed);
        response.put("scorePercentage", scorePct);
        response.put("correctAnswers", correct);
        response.put("totalQuestions", total);
        response.put("competency", competency);
        response.put("oldLevel", oldLevel);
        response.put("newLevel", newLevel);
        response.put("promoted", passed && !oldLevel.equals(newLevel));
        response.put("reviews", reviews);

        return response;
    }

    private String getNextLevel(String currentLevel) {
        if ("NOVICE".equalsIgnoreCase(currentLevel)) return "INTERMEDIATE";
        if ("INTERMEDIATE".equalsIgnoreCase(currentLevel)) return "EXPERT";
        return "EXPERT";
    }

    private List<Question> generateCheckpointQuestionsWithAI(String competency, String currentLevel, String targetLevel) {
        String prompt = String.format("""
            Generate a targeted 3-question competency checkpoint assessment for the skill: "%s".
            The learner is currently at %s level and attempting promotion to %s level.
            Questions must test applied knowledge and practical comprehension.
            
            Return JSON array:
            [
              {
                "id": 1,
                "text": "Question text testing practical comprehension?",
                "options": ["A", "B", "C", "D"],
                "correctOptionIndex": 0,
                "difficulty": "MEDIUM",
                "competency": "%s",
                "explanation": "Why this answer validates promotion."
              }
            ]
            Return only valid JSON array.
            """, competency, currentLevel, targetLevel, competency);

        String aiResponse = aiGatewayService.generateContent("You are a competency certification officer. Output JSON only.", prompt);
        String json = aiGatewayService.extractJson(aiResponse);

        if (json != null && !json.isBlank()) {
            try {
                List<Question> list = objectMapper.readValue(json, new TypeReference<List<Question>>() {});
                if (list != null && !list.isEmpty()) {
                    for (int i = 0; i < list.size(); i++) {
                        list.get(i).setId(i + 1);
                    }
                    return list;
                }
            } catch (Exception e) {
                logger.warn("Failed to parse checkpoint JSON: {}", e.getMessage());
            }
        }

        return null;
    }

    private List<Question> generateFallbackCheckpoint(String competency, String targetLevel) {
        return List.of(
                new Question(
                        1,
                        "In a high-traffic production scenario testing " + competency + ", which architectural approach best balances latency with fault tolerance?",
                        List.of(
                                "Synchronous blocking calls with no timeout",
                                "Asynchronous non-blocking pipeline with circuit breakers and fallback caching",
                                "Eagerly polling all downstream servers every 10ms",
                                "Disabling logging and monitoring to save CPU cycles"
                        ),
                        1,
                        "MEDIUM",
                        competency,
                        "Asynchronous non-blocking calls paired with circuit breakers and caching safeguard system throughput during unexpected latency spikes."
                ),
                new Question(
                        2,
                        "When refactoring legacy code in " + competency + ", what is the recommended strategy to avoid introducing regressions?",
                        List.of(
                                "Rewrite everything from scratch in a single weekend without tests",
                                "Write automated regression test suites first, then apply incremental modular refactoring",
                                "Manually click around the UI right before deployment",
                                "Deploy directly to production and wait for bug reports"
                        ),
                        1,
                        "EASY",
                        competency,
                        "Establishing baseline test coverage before refactoring guarantees that behavioral contracts are preserved."
                ),
                new Question(
                        3,
                        "Which metric or diagnostic tool is most critical when verifying advanced mastery in " + competency + "?",
                        List.of(
                                "Lines of code written per day",
                                "Comprehensive observability metrics (P99 latency, error rates, resource utilization profiling)",
                                "Number of comments in the code files",
                                "Font size used in the IDE"
                        ),
                        1,
                        "HARD",
                        competency,
                        "P99 latency and resource profiling provide objective, data-driven validation of performance and stability."
                )
        );
    }
}

package com.adaptivelearning.service;

import com.adaptivelearning.model.*;
import com.adaptivelearning.repository.DataStore;
import com.adaptivelearning.service.ai.AIGatewayService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class EvaluationService {

    private static final Logger logger = LoggerFactory.getLogger(EvaluationService.class);

    private final DataStore dataStore;
    private final AIGatewayService aiGatewayService;

    public EvaluationService(DataStore dataStore, AIGatewayService aiGatewayService) {
        this.dataStore = dataStore;
        this.aiGatewayService = aiGatewayService;
    }

    public QuizResult evaluateQuiz(QuizSubmission submission) {
        Quiz quiz = dataStore.getQuiz(submission.getQuizId());
        if (quiz == null) {
            throw new IllegalArgumentException("Quiz not found: " + submission.getQuizId());
        }

        QuizResult result = new QuizResult();
        result.setId("res-" + UUID.randomUUID().toString().substring(0, 8));
        result.setQuizId(quiz.getId());
        result.setUserId(submission.getUserId());
        result.setRoleName(quiz.getRoleName());
        result.setTotalQuestions(quiz.getQuestions().size());

        int correctCount = 0;
        Map<String, Integer> compCorrect = new HashMap<>();
        Map<String, Integer> compTotal = new HashMap<>();
        List<QuizResult.QuestionReview> reviews = new ArrayList<>();

        for (Question q : quiz.getQuestions()) {
            int selectedIndex = submission.getAnswers().getOrDefault(q.getId(), -1);
            boolean isCorrect = (selectedIndex == q.getCorrectOptionIndex());

            if (isCorrect) correctCount++;

            compTotal.put(q.getCompetency(), compTotal.getOrDefault(q.getCompetency(), 0) + 1);
            if (isCorrect) {
                compCorrect.put(q.getCompetency(), compCorrect.getOrDefault(q.getCompetency(), 0) + 1);
            }

            reviews.add(new QuizResult.QuestionReview(
                    q.getId(),
                    q.getText(),
                    q.getOptions(),
                    selectedIndex,
                    q.getCorrectOptionIndex(),
                    isCorrect,
                    q.getCompetency(),
                    q.getExplanation()
            ));
        }

        result.setCorrectAnswers(correctCount);
        int percentage = (int) Math.round(((double) correctCount / Math.max(1, quiz.getQuestions().size())) * 100);
        result.setOverallScorePercentage(percentage);

        String overallLevel = determineLevel(percentage);
        result.setOverallLevel(overallLevel);
        result.setQuestionReviews(reviews);

        // Competency scores and levels
        Map<String, Integer> scoreByComp = new HashMap<>();
        Map<String, String> levelByComp = new HashMap<>();

        for (String comp : compTotal.keySet()) {
            int tot = compTotal.get(comp);
            int corr = compCorrect.getOrDefault(comp, 0);
            int compPct = (int) Math.round(((double) corr / tot) * 100);
            scoreByComp.put(comp, compPct);
            levelByComp.put(comp, determineLevel(compPct));
        }

        result.setScoreByCompetency(scoreByComp);
        result.setLevelByCompetency(levelByComp);

        // Generate AI coaching feedback
        String aiFeedback = generateAIFeedback(quiz.getRoleName(), overallLevel, percentage, scoreByComp);
        result.setAiFeedback(aiFeedback);

        // Save result
        dataStore.saveQuizResult(result);

        // Update user state
        User user = dataStore.getUser(submission.getUserId());
        if (user != null) {
            user.setOverallLevel(overallLevel);
            user.getCompetencyLevels().clear();
            user.getCompetencyScores().clear();
            user.getCompetencyLevels().putAll(levelByComp);
            user.getCompetencyScores().putAll(scoreByComp);
                User.AssessmentHistoryItem historyItem = new User.AssessmentHistoryItem(
                    quiz.getId(),
                    quiz.getRoleName(),
                    percentage,
                    overallLevel
                );
                historyItem.setTotalQuestions(result.getTotalQuestions());
                historyItem.setCorrectAnswers(result.getCorrectAnswers());
                historyItem.setQuestionReviews(result.getQuestionReviews());
                user.getAssessmentHistory().add(historyItem);
            dataStore.saveUser(user);
        }

        return result;
    }

    public String determineLevel(int scorePercentage) {
        if (scorePercentage >= 71) {
            return "EXPERT";
        } else if (scorePercentage >= 41) {
            return "INTERMEDIATE";
        } else {
            return "NOVICE";
        }
    }

    private String generateAIFeedback(String roleName, String level, int score, Map<String, Integer> compScores) {
        try {
            String prompt = String.format("""
                Provide an encouraging, executive-ready technical summary (2-3 concise paragraphs) for a candidate who just completed a diagnostic assessment for the role of %s.
                Overall Score: %d%%.
                Assigned Level: %s.
                Competency Breakdown: %s.
                
                Highlight 1 primary strength and pinpoint 1-2 key areas where the adaptive curriculum will focus to accelerate their career growth.
                """, roleName, score, level, compScores.toString());

            String res = aiGatewayService.generateContent("You are an expert engineering mentor and competency evaluator.", prompt);
            if (res != null && !res.isBlank()) {
                return res.trim();
            }
        } catch (Exception e) {
            logger.warn("AI feedback generation fallback: {}", e.getMessage());
        }

        return String.format(
                "Assessment completed with an overall score of %d%% (%s level). Your baseline shows clear familiarity with foundational concepts. Your adaptive curriculum has been tailored to focus on strengthening weaker areas while reinforcing your core competencies.",
                score, level
        );
    }
}

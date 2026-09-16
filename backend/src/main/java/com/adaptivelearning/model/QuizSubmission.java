package com.adaptivelearning.model;

import java.util.HashMap;
import java.util.Map;

public class QuizSubmission {
    private String quizId;
    private String userId;
    // Map of question id to selected option index (0-3)
    private Map<Integer, Integer> answers = new HashMap<>();

    public QuizSubmission() {}

    public String getQuizId() { return quizId; }
    public void setQuizId(String quizId) { this.quizId = quizId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Map<Integer, Integer> getAnswers() { return answers; }
    public void setAnswers(Map<Integer, Integer> answers) { this.answers = answers; }
}

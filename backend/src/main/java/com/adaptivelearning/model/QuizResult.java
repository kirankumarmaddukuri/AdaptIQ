package com.adaptivelearning.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class QuizResult {
    private String id;
    private String quizId;
    private String userId;
    private String roleName;
    private int totalQuestions;
    private int correctAnswers;
    private int overallScorePercentage; // 0 - 100
    private String overallLevel; // "NOVICE", "INTERMEDIATE", "EXPERT"
    private Map<String, Integer> scoreByCompetency = new HashMap<>(); // Competency -> percentage
    private Map<String, String> levelByCompetency = new HashMap<>(); // Competency -> "NOVICE"|"INTERMEDIATE"|"EXPERT"
    private List<QuestionReview> questionReviews = new ArrayList<>();
    private String aiFeedback;
    private LocalDateTime evaluatedAt = LocalDateTime.now();

    public QuizResult() {}

    public static class QuestionReview {
        private int questionId;
        private String text;
        private List<String> options;
        private int selectedIndex;
        private int correctIndex;
        private boolean isCorrect;
        private String competency;
        private String explanation;

        public QuestionReview() {}

        public QuestionReview(int questionId, String text, List<String> options, int selectedIndex, int correctIndex, boolean isCorrect, String competency, String explanation) {
            this.questionId = questionId;
            this.text = text;
            this.options = options;
            this.selectedIndex = selectedIndex;
            this.correctIndex = correctIndex;
            this.isCorrect = isCorrect;
            this.competency = competency;
            this.explanation = explanation;
        }

        public int getQuestionId() { return questionId; }
        public void setQuestionId(int questionId) { this.questionId = questionId; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }
        public int getSelectedIndex() { return selectedIndex; }
        public void setSelectedIndex(int selectedIndex) { this.selectedIndex = selectedIndex; }
        public int getCorrectIndex() { return correctIndex; }
        public void setCorrectIndex(int correctIndex) { this.correctIndex = correctIndex; }
        public boolean isCorrect() { return isCorrect; }
        public void setCorrect(boolean correct) { isCorrect = correct; }
        public String getCompetency() { return competency; }
        public void setCompetency(String competency) { this.competency = competency; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getQuizId() { return quizId; }
    public void setQuizId(String quizId) { this.quizId = quizId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public int getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(int correctAnswers) { this.correctAnswers = correctAnswers; }

    public int getOverallScorePercentage() { return overallScorePercentage; }
    public void setOverallScorePercentage(int overallScorePercentage) { this.overallScorePercentage = overallScorePercentage; }

    public String getOverallLevel() { return overallLevel; }
    public void setOverallLevel(String overallLevel) { this.overallLevel = overallLevel; }

    public Map<String, Integer> getScoreByCompetency() { return scoreByCompetency; }
    public void setScoreByCompetency(Map<String, Integer> scoreByCompetency) { this.scoreByCompetency = scoreByCompetency; }

    public Map<String, String> getLevelByCompetency() { return levelByCompetency; }
    public void setLevelByCompetency(Map<String, String> levelByCompetency) { this.levelByCompetency = levelByCompetency; }

    public List<QuestionReview> getQuestionReviews() { return questionReviews; }
    public void setQuestionReviews(List<QuestionReview> questionReviews) { this.questionReviews = questionReviews; }

    public String getAiFeedback() { return aiFeedback; }
    public void setAiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; }

    public LocalDateTime getEvaluatedAt() { return evaluatedAt; }
    public void setEvaluatedAt(LocalDateTime evaluatedAt) { this.evaluatedAt = evaluatedAt; }
}

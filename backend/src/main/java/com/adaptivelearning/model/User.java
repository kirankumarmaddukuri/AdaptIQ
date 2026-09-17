package com.adaptivelearning.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String email;
    private String displayName;
    private String password;
    private String roleId;
    private String roleName;
    private String overallLevel; // "UNASSESSED", "NOVICE", "INTERMEDIATE", "EXPERT"
    private Map<String, String> competencyLevels = new HashMap<>(); // Competency -> Level
    private Map<String, Integer> competencyScores = new HashMap<>(); // Competency -> Score (0-100)
    private List<AssessmentHistoryItem> assessmentHistory = new ArrayList<>();
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public User() {}

    public User(String id, String email, String displayName) {
        this.id = id;
        this.email = email;
        this.displayName = displayName;
        this.overallLevel = "UNASSESSED";
    }

    public static class AssessmentHistoryItem {
        private String quizId;
        private String roleName;
        private int overallScore;
        private String resultLevel;
        private int totalQuestions;
        private int correctAnswers;
        private List<QuizResult.QuestionReview> questionReviews = new ArrayList<>();
        private LocalDateTime takenAt = LocalDateTime.now();

        public AssessmentHistoryItem() {}

        public AssessmentHistoryItem(String quizId, String roleName, int overallScore, String resultLevel) {
            this.quizId = quizId;
            this.roleName = roleName;
            this.overallScore = overallScore;
            this.resultLevel = resultLevel;
        }

        public String getQuizId() { return quizId; }
        public void setQuizId(String quizId) { this.quizId = quizId; }
        public String getRoleName() { return roleName; }
        public void setRoleName(String roleName) { this.roleName = roleName; }
        public int getOverallScore() { return overallScore; }
        public void setOverallScore(int overallScore) { this.overallScore = overallScore; }
        public String getResultLevel() { return resultLevel; }
        public void setResultLevel(String resultLevel) { this.resultLevel = resultLevel; }
        public int getTotalQuestions() { return totalQuestions; }
        public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
        public int getCorrectAnswers() { return correctAnswers; }
        public void setCorrectAnswers(int correctAnswers) { this.correctAnswers = correctAnswers; }
        public List<QuizResult.QuestionReview> getQuestionReviews() { return questionReviews; }
        public void setQuestionReviews(List<QuizResult.QuestionReview> questionReviews) { this.questionReviews = questionReviews; }
        public LocalDateTime getTakenAt() { return takenAt; }
        public void setTakenAt(LocalDateTime takenAt) { this.takenAt = takenAt; }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRoleId() { return roleId; }
    public void setRoleId(String roleId) { this.roleId = roleId; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public String getOverallLevel() { return overallLevel; }
    public void setOverallLevel(String overallLevel) { this.overallLevel = overallLevel; }

    public Map<String, String> getCompetencyLevels() { return competencyLevels; }
    public void setCompetencyLevels(Map<String, String> competencyLevels) { this.competencyLevels = competencyLevels; }

    public Map<String, Integer> getCompetencyScores() { return competencyScores; }
    public void setCompetencyScores(Map<String, Integer> competencyScores) { this.competencyScores = competencyScores; }

    public List<AssessmentHistoryItem> getAssessmentHistory() { return assessmentHistory; }
    public void setAssessmentHistory(List<AssessmentHistoryItem> assessmentHistory) { this.assessmentHistory = assessmentHistory; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

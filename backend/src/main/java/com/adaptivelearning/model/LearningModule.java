package com.adaptivelearning.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "modules")
public class LearningModule {
    @Id
    private String id;
    private String title;
    private String description;
    private String competency;
    private String level; // "NOVICE", "INTERMEDIATE", "EXPERT"
    private int estimatedMinutes;
    private int orderIndex;
    private String status; // "LOCKED", "AVAILABLE", "IN_PROGRESS", "COMPLETED"
    private List<String> learningObjectives = new ArrayList<>();
    private String content; // AI-generated personalized content
    private int contentVersion;
    private Exercise exercise;
    private LocalDateTime completedAt;

    public LearningModule() {}

    public static class Exercise {
        private String question;
        private List<String> options = new ArrayList<>();
        private int correctOptionIndex;
        private String explanation;
        private String submittedAnswer;
        private Boolean passed;

        public Exercise() {}

        public Exercise(String question, List<String> options, int correctOptionIndex, String explanation) {
            this.question = question;
            this.options = options;
            this.correctOptionIndex = correctOptionIndex;
            this.explanation = explanation;
        }

        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }
        public int getCorrectOptionIndex() { return correctOptionIndex; }
        public void setCorrectOptionIndex(int correctOptionIndex) { this.correctOptionIndex = correctOptionIndex; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
        public String getSubmittedAnswer() { return submittedAnswer; }
        public void setSubmittedAnswer(String submittedAnswer) { this.submittedAnswer = submittedAnswer; }
        public Boolean getPassed() { return passed; }
        public void setPassed(Boolean passed) { this.passed = passed; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCompetency() { return competency; }
    public void setCompetency(String competency) { this.competency = competency; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public int getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(int estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }

    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getLearningObjectives() { return learningObjectives; }
    public void setLearningObjectives(List<String> learningObjectives) { this.learningObjectives = learningObjectives; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public int getContentVersion() { return contentVersion; }
    public void setContentVersion(int contentVersion) { this.contentVersion = contentVersion; }

    public Exercise getExercise() { return exercise; }
    public void setExercise(Exercise exercise) { this.exercise = exercise; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}

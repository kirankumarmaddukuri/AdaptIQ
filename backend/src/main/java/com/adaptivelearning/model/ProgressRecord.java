package com.adaptivelearning.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "progress_records")
public class ProgressRecord {
    @Id
    private String id;
    private String userId;
    private String moduleId;
    private String moduleTitle;
    private String competency;
    private String status;
    private boolean exercisePassed;
    private int timeSpentSeconds;
    private LocalDateTime completedAt = LocalDateTime.now();

    public ProgressRecord() {}

    public ProgressRecord(String id, String userId, String moduleId, String moduleTitle, String competency, boolean exercisePassed, int timeSpentSeconds) {
        this.id = id;
        this.userId = userId;
        this.moduleId = moduleId;
        this.moduleTitle = moduleTitle;
        this.competency = competency;
        this.status = "COMPLETED";
        this.exercisePassed = exercisePassed;
        this.timeSpentSeconds = timeSpentSeconds;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getModuleId() { return moduleId; }
    public void setModuleId(String moduleId) { this.moduleId = moduleId; }

    public String getModuleTitle() { return moduleTitle; }
    public void setModuleTitle(String moduleTitle) { this.moduleTitle = moduleTitle; }

    public String getCompetency() { return competency; }
    public void setCompetency(String competency) { this.competency = competency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isExercisePassed() { return exercisePassed; }
    public void setExercisePassed(boolean exercisePassed) { this.exercisePassed = exercisePassed; }

    public int getTimeSpentSeconds() { return timeSpentSeconds; }
    public void setTimeSpentSeconds(int timeSpentSeconds) { this.timeSpentSeconds = timeSpentSeconds; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}

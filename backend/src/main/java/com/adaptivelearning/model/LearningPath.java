package com.adaptivelearning.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class LearningPath {
    private String id;
    private String userId;
    private String roleId;
    private String roleName;
    private String learnerOverallLevel;
    private String pathSummary;
    private List<LearningModule> modules = new ArrayList<>();
    private int totalModules;
    private int completedModules;
    private int progressPercentage;
    private LocalDateTime generatedAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public LearningPath() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getRoleId() { return roleId; }
    public void setRoleId(String roleId) { this.roleId = roleId; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public String getLearnerOverallLevel() { return learnerOverallLevel; }
    public void setLearnerOverallLevel(String learnerOverallLevel) { this.learnerOverallLevel = learnerOverallLevel; }

    public String getPathSummary() { return pathSummary; }
    public void setPathSummary(String pathSummary) { this.pathSummary = pathSummary; }

    public List<LearningModule> getModules() { return modules; }
    public void setModules(List<LearningModule> modules) { this.modules = modules; }

    public int getTotalModules() { return totalModules; }
    public void setTotalModules(int totalModules) { this.totalModules = totalModules; }

    public int getCompletedModules() { return completedModules; }
    public void setCompletedModules(int completedModules) { this.completedModules = completedModules; }

    public int getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(int progressPercentage) { this.progressPercentage = progressPercentage; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

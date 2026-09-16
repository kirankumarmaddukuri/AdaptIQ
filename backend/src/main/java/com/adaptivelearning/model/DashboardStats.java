package com.adaptivelearning.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DashboardStats {
    private String userId;
    private String displayName;
    private String roleName;
    private String overallLevel;
    private int completedModulesCount;
    private int totalModulesCount;
    private int overallProgressPercentage;
    private int learningStreakDays;
    private int skillPoints;
    private Map<String, Integer> competencyRadarScores = new HashMap<>(); // Competency -> 0-100
    private Map<String, String> competencyLevels = new HashMap<>(); // Competency -> Level
    private List<LearningModule> upcomingModules = new ArrayList<>();
    private List<ProgressRecord> recentActivity = new ArrayList<>();
    private List<User.AssessmentHistoryItem> assessmentHistory = new ArrayList<>();

    public DashboardStats() {}

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public String getOverallLevel() { return overallLevel; }
    public void setOverallLevel(String overallLevel) { this.overallLevel = overallLevel; }

    public int getCompletedModulesCount() { return completedModulesCount; }
    public void setCompletedModulesCount(int completedModulesCount) { this.completedModulesCount = completedModulesCount; }

    public int getTotalModulesCount() { return totalModulesCount; }
    public void setTotalModulesCount(int totalModulesCount) { this.totalModulesCount = totalModulesCount; }

    public int getOverallProgressPercentage() { return overallProgressPercentage; }
    public void setOverallProgressPercentage(int overallProgressPercentage) { this.overallProgressPercentage = overallProgressPercentage; }

    public int getLearningStreakDays() { return learningStreakDays; }
    public void setLearningStreakDays(int learningStreakDays) { this.learningStreakDays = learningStreakDays; }

    public int getSkillPoints() { return skillPoints; }
    public void setSkillPoints(int skillPoints) { this.skillPoints = skillPoints; }

    public Map<String, Integer> getCompetencyRadarScores() { return competencyRadarScores; }
    public void setCompetencyRadarScores(Map<String, Integer> competencyRadarScores) { this.competencyRadarScores = competencyRadarScores; }

    public Map<String, String> getCompetencyLevels() { return competencyLevels; }
    public void setCompetencyLevels(Map<String, String> competencyLevels) { this.competencyLevels = competencyLevels; }

    public List<LearningModule> getUpcomingModules() { return upcomingModules; }
    public void setUpcomingModules(List<LearningModule> upcomingModules) { this.upcomingModules = upcomingModules; }

    public List<ProgressRecord> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<ProgressRecord> recentActivity) { this.recentActivity = recentActivity; }

    public List<User.AssessmentHistoryItem> getAssessmentHistory() { return assessmentHistory; }
    public void setAssessmentHistory(List<User.AssessmentHistoryItem> assessmentHistory) { this.assessmentHistory = assessmentHistory; }
}

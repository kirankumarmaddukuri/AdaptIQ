package com.adaptivelearning.service;

import com.adaptivelearning.model.*;
import com.adaptivelearning.repository.DataStore;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final DataStore dataStore;

    public DashboardService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public DashboardStats getDashboardData(String userId) {
        User user = dataStore.getUser(userId);
        if (user == null) {
            user = dataStore.getUsers().values().iterator().next();
        }

        DashboardStats stats = new DashboardStats();
        stats.setUserId(user.getId());
        stats.setDisplayName(user.getDisplayName());
        stats.setRoleName(user.getRoleName() != null ? user.getRoleName() : "Software Engineer");
        stats.setOverallLevel(user.getOverallLevel() != null ? user.getOverallLevel() : "UNASSESSED");

        // Competencies and radar scores
        Map<String, Integer> radarScores = new HashMap<>(user.getCompetencyScores());
        Map<String, String> compLevels = new HashMap<>(user.getCompetencyLevels());

        Role role = dataStore.getRole(user.getRoleId());
        if (role != null) {
            for (String comp : role.getCompetencies()) {
                if (!radarScores.containsKey(comp) && !"UNASSESSED".equalsIgnoreCase(user.getOverallLevel())) {
                    radarScores.put(comp, 0);
                }
                if (!compLevels.containsKey(comp) && !"UNASSESSED".equalsIgnoreCase(user.getOverallLevel())) {
                    compLevels.put(comp, "NOVICE");
                }
            }
        }

        stats.setCompetencyRadarScores(radarScores);
        stats.setCompetencyLevels(compLevels);

        // Learning path metrics
        LearningPath path = dataStore.getLearningPathByUserId(user.getId());
        if (path != null) {
            stats.setTotalModulesCount(path.getTotalModules());
            stats.setCompletedModulesCount(path.getCompletedModules());
            stats.setOverallProgressPercentage(path.getProgressPercentage());

            List<LearningModule> upcoming = new ArrayList<>();
            for (LearningModule m : path.getModules()) {
                if (!"COMPLETED".equalsIgnoreCase(m.getStatus())) {
                    upcoming.add(m);
                }
            }
            stats.setUpcomingModules(upcoming);
        } else {
            stats.setTotalModulesCount(0);
            stats.setCompletedModulesCount(0);
            stats.setOverallProgressPercentage(0);
            stats.setUpcomingModules(List.of());
        }

        // Progress records
        List<ProgressRecord> history = dataStore.getProgressForUser(user.getId());
        stats.setRecentActivity(history);
        stats.setAssessmentHistory(user.getAssessmentHistory());

        // Points and streak
        int points = stats.getCompletedModulesCount() * 150 + user.getAssessmentHistory().size() * 300;
        stats.setSkillPoints(points);
        stats.setLearningStreakDays(Math.max(1, stats.getCompletedModulesCount() / 2 + 1));

        return stats;
    }
}

package com.adaptivelearning.service;

import com.adaptivelearning.model.*;
import com.adaptivelearning.repository.DataStore;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class DashboardService {

    private final DataStore dataStore;

    public DashboardService(DataStore dataStore) {
        this.dataStore = dataStore;
    }
    public DashboardStats getDashboardData(String userId) {
        User user = userId != null ? dataStore.getUser(userId) : null;
        if (user == null && !dataStore.getUsers().isEmpty()) {
            user = dataStore.getUser("user-demo-1");
            if (user == null) {
                user = dataStore.getUsers().values().iterator().next();
            }
        }
        if (user == null) {
            user = new User(userId != null ? userId : "user-demo-1", "demo@adaptiq.io", "Learner");
            user.setRoleId("role-frontend-engineer");
            user.setRoleName("Frontend Architect");
            dataStore.saveUser(user);
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
        stats.setLearningStreakDays(calculateLearningStreak(user, history));

        return stats;
    }

    /**
     * Calculates the daily learning streak based on distinct consecutive active calendar days.
     * Completing multiple modules or assessments on the same day counts as 1 active day.
     */
    private int calculateLearningStreak(User user, List<ProgressRecord> history) {
        Set<LocalDate> activeDates = new HashSet<>();

        if (history != null) {
            for (ProgressRecord pr : history) {
                if (pr.getCompletedAt() != null) {
                    activeDates.add(pr.getCompletedAt().toLocalDate());
                }
            }
        }

        if (user.getAssessmentHistory() != null) {
            for (User.AssessmentHistoryItem ah : user.getAssessmentHistory()) {
                if (ah.getTakenAt() != null) {
                    activeDates.add(ah.getTakenAt().toLocalDate());
                }
            }
        }

        if (activeDates.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        LocalDate checkDate;
        if (activeDates.contains(today)) {
            checkDate = today;
        } else if (activeDates.contains(yesterday)) {
            checkDate = yesterday;
        } else {
            return 0;
        }

        int streak = 0;
        while (activeDates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        return streak;
    }
}

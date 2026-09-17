package com.adaptivelearning.service;

import com.adaptivelearning.model.LearningModule;
import com.adaptivelearning.model.LearningPath;
import com.adaptivelearning.model.ProgressRecord;
import com.adaptivelearning.model.User;
import com.adaptivelearning.repository.DataStore;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ProgressService {

    private final DataStore dataStore;

    public ProgressService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public Map<String, Object> completeModule(String userId, String moduleId, int submittedExerciseIndex, int timeSpentSeconds) {
        LearningModule module = dataStore.getModule(moduleId);
        if (module == null) {
            throw new IllegalArgumentException("Module not found: " + moduleId);
        }

        boolean passed = true;
        if (module.getExercise() != null) {
            if (submittedExerciseIndex < 0) {
                throw new IllegalArgumentException("Knowledge check quiz must be completed before submitting this module.");
            }
            passed = (submittedExerciseIndex == module.getExercise().getCorrectOptionIndex());
            if (!passed) {
                throw new IllegalArgumentException("The quiz answer is incorrect. You must select the correct answer to complete this module.");
            }
            module.getExercise().setSubmittedAnswer("Option " + (submittedExerciseIndex + 1));
            module.getExercise().setPassed(true);
        }

        module.setStatus("COMPLETED");
        module.setCompletedAt(LocalDateTime.now());
        dataStore.saveModule(module);

        // Record progress
        ProgressRecord record = new ProgressRecord(
                "prog-" + UUID.randomUUID().toString().substring(0, 8),
                userId,
                module.getId(),
                module.getTitle(),
                module.getCompetency(),
                passed,
                timeSpentSeconds
        );
        dataStore.addProgressRecord(record);

        // Update user learning path progress and unlock next module
        LearningPath path = dataStore.getLearningPaths().values().stream()
            .filter(candidate -> candidate.getUserId().equals(userId))
            .filter(candidate -> candidate.getModules().stream().anyMatch(item -> item.getId().equals(moduleId)))
            .findFirst()
            .orElse(null);
        boolean checkpointAvailable = false;
        String checkpointCompetency = null;

        if (path != null) {
            List<LearningModule> modules = path.getModules();
            int completedCount = 0;
            boolean nextUnlocked = false;

            for (int i = 0; i < modules.size(); i++) {
                LearningModule m = modules.get(i);
                if (m.getId().equals(moduleId)) {
                    m.setStatus("COMPLETED");
                    m.setCompletedAt(module.getCompletedAt());
                    // Unlock next module if locked
                    if (i + 1 < modules.size()) {
                        LearningModule next = modules.get(i + 1);
                        if ("LOCKED".equalsIgnoreCase(next.getStatus())) {
                            next.setStatus("AVAILABLE");
                            dataStore.saveModule(next);
                            nextUnlocked = true;
                        }
                    }
                }
                if ("COMPLETED".equalsIgnoreCase(m.getStatus())) {
                    completedCount++;
                }
            }

            path.setCompletedModules(completedCount);
            int pct = (int) Math.round(((double) completedCount / Math.max(1, modules.size())) * 100);
            path.setProgressPercentage(pct);
            dataStore.saveLearningPath(path);

            // Check if all modules for this competency are completed
            long remainingInComp = modules.stream()
                    .filter(m -> m.getCompetency().equalsIgnoreCase(module.getCompetency()))
                    .filter(m -> !"COMPLETED".equalsIgnoreCase(m.getStatus()))
                    .count();

            if (remainingInComp == 0) {
                checkpointAvailable = true;
                checkpointCompetency = module.getCompetency();
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("passed", passed);
        result.put("moduleId", moduleId);
        result.put("checkpointAvailable", checkpointAvailable);
        result.put("checkpointCompetency", checkpointCompetency);
        result.put("progressPercentage", path != null ? path.getProgressPercentage() : 100);

        return result;
    }
}

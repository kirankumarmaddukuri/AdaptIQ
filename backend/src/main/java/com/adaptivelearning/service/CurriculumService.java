package com.adaptivelearning.service;

import com.adaptivelearning.model.*;
import com.adaptivelearning.repository.DataStore;
import com.adaptivelearning.service.ai.AIGatewayService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CurriculumService {

    private static final Logger logger = LoggerFactory.getLogger(CurriculumService.class);

    private final AIGatewayService aiGatewayService;
    private final DataStore dataStore;
    private final ObjectMapper objectMapper;

    public CurriculumService(AIGatewayService aiGatewayService, DataStore dataStore, ObjectMapper objectMapper) {
        this.aiGatewayService = aiGatewayService;
        this.dataStore = dataStore;
        this.objectMapper = objectMapper;
    }

    public LearningPath generatePersonalizedPath(String userId) {
        User user = dataStore.getUser(userId);
        if (user == null) {
            user = dataStore.getUsers().values().iterator().next();
        }

        Role role = dataStore.getRole(user.getRoleId());
        if (role == null) {
            role = dataStore.getRoles().values().iterator().next();
        }

        String pathId = "path-" + UUID.randomUUID().toString().substring(0, 8);
        LearningPath path = new LearningPath();
        path.setId(pathId);
        path.setUserId(user.getId());
        path.setRoleId(role.getId());
        path.setRoleName(role.getName());
        path.setLearnerOverallLevel(user.getOverallLevel() != null ? user.getOverallLevel() : "NOVICE");

        List<LearningModule> modules = null;

        try {
            modules = generateModulesWithAI(role, user);
        } catch (Exception e) {
            logger.warn("AI curriculum generation failed: {}. Generating adaptive fallback path.", e.getMessage());
        }

        if (modules == null || modules.isEmpty()) {
            modules = generateFallbackModules(role, user);
        }

        // Configure progression locks and orders
        for (int i = 0; i < modules.size(); i++) {
            LearningModule m = modules.get(i);
            m.setOrderIndex(i + 1);
            if (i == 0) {
                m.setStatus("AVAILABLE");
            } else {
                m.setStatus("LOCKED");
            }
        }

        path.setModules(modules);
        path.setTotalModules(modules.size());
        path.setCompletedModules(0);
        path.setProgressPercentage(0);
        path.setPathSummary(String.format(
                "Tailored roadmap for %s level in %s. Curriculum weighted towards competencies requiring reinforcement.",
                path.getLearnerOverallLevel(), role.getName()
        ));

        dataStore.saveLearningPath(path);
        return path;
    }

    private List<LearningModule> generateModulesWithAI(Role role, User user) {
        String levelsStr = user.getCompetencyLevels().toString();
        String scoresStr = user.getCompetencyScores().toString();

        String prompt = String.format("""
            You are a Lead Curriculum Architect at a top tech company.
            Design a personalized micro-learning roadmap of 4 to 5 focused modules for an employee.
            Role: %s
            Assessed Overall Level: %s
            Competency Scores: %s
            Competency Levels: %s
            
            Guidelines:
            1. Prioritize more modules on competencies where score is lowest or level is NOVICE.
            2. Each module must be a concise micro-learning unit (10-25 minutes).
            3. Return strict JSON array matching this schema:
            [
              {
                "id": "mod-1",
                "title": "Module Title",
                "description": "Short 2-sentence summary of practical takeaways",
                "competency": "Exact Competency Name",
                "level": "NOVICE" or "INTERMEDIATE" or "EXPERT",
                "estimatedMinutes": 15,
                "learningObjectives": [
                  "Objective 1",
                  "Objective 2",
                  "Objective 3"
                ]
              }
            ]
            Return only valid JSON array.
            """, role.getName(), user.getOverallLevel(), scoresStr, levelsStr);

        String response = aiGatewayService.generateContent("You strictly output valid JSON arrays representing curriculum roadmaps.", prompt);
        String json = aiGatewayService.extractJson(response);

        if (json != null && !json.isBlank()) {
            try {
                List<LearningModule> list = objectMapper.readValue(json, new TypeReference<List<LearningModule>>() {});
                if (list != null && !list.isEmpty()) {
                    for (int i = 0; i < list.size(); i++) {
                        LearningModule m = list.get(i);
                        m.setId("mod-" + UUID.randomUUID().toString().substring(0, 8));
                        String competencyLevel = user.getCompetencyLevels().get(m.getCompetency());
                        m.setLevel(resolveModuleLevel(user.getOverallLevel(), competencyLevel));
                    }
                    return list;
                }
            } catch (Exception e) {
                logger.warn("Failed to parse AI curriculum JSON: {}", e.getMessage());
            }
        }
        return null;
    }

    private List<LearningModule> generateFallbackModules(Role role, User user) {
        List<LearningModule> modules = new ArrayList<>();
        List<String> comps = role.getCompetencies();

        int id = 1;
        for (String comp : comps) {
            String userLevel = resolveModuleLevel(user.getOverallLevel(), user.getCompetencyLevels().get(comp));

            LearningModule m = new LearningModule();
            m.setId("mod-" + UUID.randomUUID().toString().substring(0, 8));
            m.setCompetency(comp);
            m.setLevel(userLevel);
            m.setEstimatedMinutes(15);

            if (comp.contains("HTML") || comp.contains("CSS")) {
                m.setTitle("Modern CSS Architecture & Responsive Layout Systems");
                m.setDescription("Master modern Flexbox, Grid auto-placement mechanics, and CSS custom property design tokens.");
                m.setLearningObjectives(List.of(
                        "Understand Grid template repeat and auto-fit syntax",
                        "Build resilient responsive components without fragile media queries",
                        "Implement fluid typography and spacing tokens"
                ));
            } else if (comp.contains("JavaScript") || comp.contains("TypeScript")) {
                m.setTitle("Mastering Asynchronous JavaScript & Modern Event Loop");
                m.setDescription("Demystify promises, async/await microtask queues, closure memory leaks, and TypeScript strict types.");
                m.setLearningObjectives(List.of(
                        "Trace Macrotask vs Microtask execution in the JS runtime",
                        "Handle asynchronous race conditions cleanly with AbortController",
                        "Design reusable TypeScript generic utility interfaces"
                ));
            } else if (comp.contains("React")) {
                m.setTitle("React Component Performance & State Synchronization");
                m.setDescription("Deep dive into React 18 reconciliation, hooks dependency hygiene, and optimal state lifecycles.");
                m.setLearningObjectives(List.of(
                        "Prevent unnecessary re-renders with strategic memoization",
                        "Implement custom reducer hooks for predictable state machines",
                        "Structure contextual data trees without performance penalties"
                ));
            } else if (comp.contains("Performance") || comp.contains("Vitals")) {
                m.setTitle("Optimizing Core Web Vitals (LCP, CLS, and INP)");
                m.setDescription("Audit and eliminate web bottlenecks to achieve 90+ Lighthouse performance benchmarks in production.");
                m.setLearningObjectives(List.of(
                        "Identify and optimize Largest Contentful Paint critical paths",
                        "Eliminate Cumulative Layout Shift through aspect-ratio bounding boxes",
                        "Profile and fix Interaction to Next Paint long tasks"
                ));
            } else if (comp.contains("Cloud") || comp.contains("Microservices")) {
                m.setTitle("Resilient Microservices Architecture & Fault Tolerance");
                m.setDescription("Design stateless, scalable APIs with circuit breaking, rate limiting, and robust health checks.");
                m.setLearningObjectives(List.of(
                        "Implement Circuit Breaker and Retry with exponential backoff",
                        "Enforce stateless JWT security validation",
                        "Structure Dockerized container deployments with zero-downtime health probes"
                ));
            } else {
                m.setTitle("Enterprise LLM Orchestration & Prompt System Design");
                m.setDescription("Build context-grounded AI applications using structured outputs, few-shot prompts, and token safety.");
                m.setLearningObjectives(List.of(
                        "Enforce reliable JSON schemas from frontier LLMs",
                        "Engineer system instructions with deterministic guardrails",
                        "Minimize latency and token cost using dynamic context windows"
                ));
            }

            modules.add(m);
            if (modules.size() >= 5) break;
        }

        return modules;
    }

    private String resolveModuleLevel(String overallLevel, String competencyLevel) {
        String overall = normalizeLevel(overallLevel);
        String competency = normalizeLevel(competencyLevel);
        if ("UNASSESSED".equals(overall)) {
            return "NOVICE";
        }
        return levelRank(competency) < levelRank(overall) ? overall : competency;
    }

    private String normalizeLevel(String level) {
        if ("EXPERT".equalsIgnoreCase(level)) return "EXPERT";
        if ("INTERMEDIATE".equalsIgnoreCase(level)) return "INTERMEDIATE";
        if ("NOVICE".equalsIgnoreCase(level)) return "NOVICE";
        return "UNASSESSED";
    }

    private int levelRank(String level) {
        return "EXPERT".equals(level) ? 3 : "INTERMEDIATE".equals(level) ? 2 : 1;
    }

    public LearningPath getPathForUser(String userId) {
        LearningPath path = dataStore.getLearningPathByUserId(userId);
        if (path == null) {
            // Generate initial path if none exists
            path = generatePersonalizedPath(userId);
        }
        return path;
    }
}

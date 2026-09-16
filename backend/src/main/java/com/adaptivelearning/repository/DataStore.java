package com.adaptivelearning.repository;

import com.adaptivelearning.model.*;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class DataStore {

    private final Map<String, User> users = new ConcurrentHashMap<>();
    private final Map<String, Role> roles = new ConcurrentHashMap<>();
    private final Map<String, Competency> competencies = new ConcurrentHashMap<>();
    private final Map<String, Quiz> quizzes = new ConcurrentHashMap<>();
    private final Map<String, QuizResult> quizResults = new ConcurrentHashMap<>();
    private final Map<String, LearningPath> learningPaths = new ConcurrentHashMap<>();
    private final Map<String, LearningModule> modules = new ConcurrentHashMap<>();
    private final Map<String, List<ProgressRecord>> userProgress = new ConcurrentHashMap<>();
    private final Map<String, String> passwordsByUserId = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        seedRolesAndCompetencies();
    }

    private void seedRolesAndCompetencies() {
        // Competencies
        addCompetency(new Competency(
                "comp-html-css",
                "HTML5 & Modern CSS",
                "Semantic markup, responsive design, Flexbox/Grid, CSS architecture, and web accessibility (a11y).",
                "Basic tags, simple styling, inline vs block elements.",
                "Responsive grids/flexbox, CSS animations, modern layouts, BEM architecture.",
                "Sub-grid, CSS Houdini, advanced rendering performance, WCAG AAA compliance."
        ));

        addCompetency(new Competency(
                "comp-js-ts",
                "JavaScript & TypeScript",
                "Core ECMAScript, closures, asynchronous programming, event loop, and strong static typing with TypeScript.",
                "Variables, conditionals, loops, functions, basic DOM manipulation.",
                "Promises/async-await, array methods, closures, TS interfaces, generics, event loop.",
                "V8 engine internals, memory leak profiling, advanced conditional/mapped types, AST transforms."
        ));

        addCompetency(new Competency(
                "comp-react",
                "React & State Architecture",
                "Component lifecycles, hooks, virtual DOM, context, state management patterns, and SSR/Next.js.",
                "JSX syntax, functional components, useState and basic props passing.",
                "Custom hooks, useEffect optimization, Context API, Redux/Zustand, React Router.",
                "Fiber reconciler mechanics, Concurrent React, Suspense architectures, Server Components."
        ));

        addCompetency(new Competency(
                "comp-web-perf",
                "Web Performance & Core Web Vitals",
                "LCP, FID/INP, CLS optimization, bundle splitting, critical rendering path, caching, and CDN delivery.",
                "Image compression, basic browser caching headers.",
                "Code splitting, lazy loading, Core Web Vitals measurement, font optimization.",
                "Resource prioritization (103 Early Hints), tree shaking analysis, web workers offloading."
        ));

        addCompetency(new Competency(
                "comp-cloud-apis",
                "Cloud APIs & Microservices",
                "RESTful API design, Spring Boot/Node microservices, authentication (OAuth2/JWT), Docker, and cloud scaling.",
                "Basic HTTP methods (GET/POST), consuming REST endpoints.",
                "Building REST services, stateless JWT security, Docker containerization, error handling.",
                "Event-driven CQRS architectures, service mesh, zero-downtime canary rollouts, resilient circuit breakers."
        ));

        addCompetency(new Competency(
                "comp-ai-llm",
                "AI Engineering & LLM Integration",
                "Prompt engineering, retrieval-augmented generation (RAG), vector embeddings, token optimization, and LLM orchestration.",
                "Basic chatbot prompting, API keys setup.",
                "Structured JSON generation, few-shot prompting, embeddings search, token budget handling.",
                "Fine-tuning evaluation pipelines, hybrid semantic search, Agentic function calling, guardrails."
        ));

        // Roles
        roles.put("role-frontend-engineer", new Role(
                "role-frontend-engineer",
                "Frontend Architect",
                "Frontend Engineering",
                "Designs high-performance, accessible, and scalable web interfaces using modern frameworks and performance optimization.",
                "Code",
                List.of("HTML5 & Modern CSS", "JavaScript & TypeScript", "React & State Architecture", "Web Performance & Core Web Vitals")
        ));

        roles.put("role-fullstack-cloud", new Role(
                "role-fullstack-cloud",
                "Full Stack Cloud Developer",
                "Software Engineering",
                "Builds end-to-end resilient applications spanning modern React frontends, robust Spring Boot APIs, and cloud microservices.",
                "Layers",
                List.of("JavaScript & TypeScript", "React & State Architecture", "Cloud APIs & Microservices", "Web Performance & Core Web Vitals")
        ));

        roles.put("role-ai-engineer", new Role(
                "role-ai-engineer",
                "AI & Prompt Systems Engineer",
                "Artificial Intelligence",
                "Integrates generative AI models, builds intelligent agent workflows, and automates context-aware enterprise systems.",
                "Brain",
                List.of("AI Engineering & LLM Integration", "JavaScript & TypeScript", "Cloud APIs & Microservices")
        ));

        addRole("role-backend-engineer", "Backend Engineer", "Software Engineering", "Builds reliable APIs, services, and data access layers.", "Code", List.of("Cloud APIs & Microservices", "JavaScript & TypeScript", "AI Engineering & LLM Integration"));
        addRole("role-java-developer", "Java Developer", "Software Engineering", "Develops maintainable Java services with Spring Boot and production testing practices.", "Code", List.of("Cloud APIs & Microservices", "JavaScript & TypeScript", "Web Performance & Core Web Vitals"));
        addRole("role-devops-engineer", "DevOps Engineer", "Cloud Engineering", "Automates delivery, observability, reliability, and scalable cloud operations.", "Layers", List.of("Cloud APIs & Microservices", "Web Performance & Core Web Vitals", "AI Engineering & LLM Integration"));
        addRole("role-data-engineer", "Data Engineer", "Data Engineering", "Designs dependable data pipelines and systems for analytics and intelligent products.", "Layers", List.of("Cloud APIs & Microservices", "AI Engineering & LLM Integration", "JavaScript & TypeScript"));
        addRole("role-qa-engineer", "QA Automation Engineer", "Quality Engineering", "Creates automated test strategies that protect product quality across web and API workflows.", "Code", List.of("JavaScript & TypeScript", "Cloud APIs & Microservices", "Web Performance & Core Web Vitals"));
        addRole("role-security-engineer", "Security Engineer", "Security Engineering", "Builds secure application and service architectures with practical threat controls.", "Brain", List.of("Cloud APIs & Microservices", "JavaScript & TypeScript", "AI Engineering & LLM Integration"));
        addRole("role-product-engineer", "Product Engineer", "Product Engineering", "Turns user needs into polished, measurable, and maintainable product experiences.", "Code", List.of("React & State Architecture", "JavaScript & TypeScript", "Web Performance & Core Web Vitals"));
    }

    private void addRole(String id, String name, String category, String description, String icon, List<String> competencies) {
        roles.put(id, new Role(id, name, category, description, icon, competencies));
    }

    private void addCompetency(Competency comp) {
        competencies.put(comp.getId(), comp);
        // Also map by name for quick lookup
        competencies.put(comp.getName(), comp);
    }

    // Accessors
    public Map<String, User> getUsers() { return users; }
    public Map<String, Role> getRoles() { return roles; }
    public Map<String, Competency> getCompetencies() { return competencies; }
    public Map<String, Quiz> getQuizzes() { return quizzes; }
    public Map<String, QuizResult> getQuizResults() { return quizResults; }
    public Map<String, LearningPath> getLearningPaths() { return learningPaths; }
    public Map<String, LearningModule> getModules() { return modules; }
    public Map<String, List<ProgressRecord>> getUserProgress() { return userProgress; }

    public User getUser(String userId) {
        return users.get(userId);
    }

    public User getUserByEmail(String email) {
        return users.values().stream()
                .filter(user -> user.getEmail() != null && user.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(null);
    }

    public void setPassword(String userId, String password) {
        passwordsByUserId.put(userId, password);
    }

    public boolean passwordMatches(String userId, String password) {
        return password != null && password.equals(passwordsByUserId.get(userId));
    }

    public void saveUser(User user) {
        users.put(user.getId(), user);
    }

    public Role getRole(String roleId) {
        return roles.get(roleId);
    }

    public Quiz getQuiz(String quizId) {
        return quizzes.get(quizId);
    }

    public void saveQuiz(Quiz quiz) {
        quizzes.put(quiz.getId(), quiz);
    }

    public QuizResult getQuizResult(String quizId) {
        return quizResults.get(quizId);
    }

    public void saveQuizResult(QuizResult result) {
        quizResults.put(result.getQuizId(), result);
    }

    public LearningPath getLearningPathByUserId(String userId) {
        User user = getUser(userId);
        return user == null ? null : getLearningPathByUserIdAndRole(userId, user.getRoleId());
    }

    public LearningPath getLearningPathByUserIdAndRole(String userId, String roleId) {
        return learningPaths.get(pathKey(userId, roleId));
    }

    public void saveLearningPath(LearningPath path) {
        learningPaths.put(pathKey(path.getUserId(), path.getRoleId()), path);
        for (LearningModule m : path.getModules()) {
            modules.put(m.getId(), m);
        }
    }

    private String pathKey(String userId, String roleId) {
        return userId + ":" + (roleId == null ? "unassigned" : roleId);
    }

    public LearningModule getModule(String moduleId) {
        return modules.get(moduleId);
    }

    public void saveModule(LearningModule module) {
        modules.put(module.getId(), module);
    }

    public List<ProgressRecord> getProgressForUser(String userId) {
        return userProgress.computeIfAbsent(userId, k -> new ArrayList<>());
    }

    public void addProgressRecord(ProgressRecord record) {
        List<ProgressRecord> list = userProgress.computeIfAbsent(record.getUserId(), k -> new ArrayList<>());
        list.add(record);
    }
}

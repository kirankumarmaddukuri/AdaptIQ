package com.adaptivelearning.repository;

import com.adaptivelearning.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class DataStore {

    private static final Logger logger = LoggerFactory.getLogger(DataStore.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CompetencyRepository competencyRepository;
    private final LearningPathRepository learningPathRepository;
    private final ModuleRepository moduleRepository;
    private final QuizRepository quizRepository;
    private final QuizResultRepository quizResultRepository;
    private final ProgressRecordRepository progressRecordRepository;

    private final Map<String, User> users = new ConcurrentHashMap<>();
    private final Map<String, Role> roles = new ConcurrentHashMap<>();
    private final Map<String, Competency> competencies = new ConcurrentHashMap<>();
    private final Map<String, Quiz> quizzes = new ConcurrentHashMap<>();
    private final Map<String, QuizResult> quizResults = new ConcurrentHashMap<>();
    private final Map<String, LearningPath> learningPaths = new ConcurrentHashMap<>();
    private final Map<String, LearningModule> modules = new ConcurrentHashMap<>();
    private final Map<String, List<ProgressRecord>> userProgress = new ConcurrentHashMap<>();
    private final Map<String, String> passwordsByUserId = new ConcurrentHashMap<>();

    public DataStore(UserRepository userRepository,
                     RoleRepository roleRepository,
                     CompetencyRepository competencyRepository,
                     LearningPathRepository learningPathRepository,
                     ModuleRepository moduleRepository,
                     QuizRepository quizRepository,
                     QuizResultRepository quizResultRepository,
                     ProgressRecordRepository progressRecordRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.competencyRepository = competencyRepository;
        this.learningPathRepository = learningPathRepository;
        this.moduleRepository = moduleRepository;
        this.quizRepository = quizRepository;
        this.quizResultRepository = quizResultRepository;
        this.progressRecordRepository = progressRecordRepository;
    }

    @PostConstruct
    public void init() {
        seedRolesAndCompetencies();
        seedDemoUser();
        loadFromMongoDB();
    }

    private void loadFromMongoDB() {
        try {
            logger.info("Synchronizing data with MongoDB Atlas...");
            userRepository.findAll().forEach(u -> {
                users.put(u.getId(), u);
                if (u.getPassword() != null) {
                    passwordsByUserId.put(u.getId(), u.getPassword());
                }
            });
            roleRepository.findAll().forEach(r -> roles.put(r.getId(), r));
            competencyRepository.findAll().forEach(c -> {
                competencies.put(c.getId(), c);
                competencies.put(c.getName(), c);
            });
            learningPathRepository.findAll().forEach(lp -> {
                learningPaths.put(pathKey(lp.getUserId(), lp.getRoleId()), lp);
                if (lp.getModules() != null) {
                    lp.getModules().forEach(m -> modules.put(m.getId(), m));
                }
            });
            moduleRepository.findAll().forEach(m -> modules.put(m.getId(), m));
            quizRepository.findAll().forEach(q -> quizzes.put(q.getId(), q));
            quizResultRepository.findAll().forEach(qr -> {
                if (qr.getQuizId() != null) {
                    quizResults.put(qr.getQuizId(), qr);
                }
            });
            progressRecordRepository.findAll().forEach(pr -> {
                if (pr.getUserId() != null) {
                    userProgress.computeIfAbsent(pr.getUserId(), k -> new ArrayList<>()).add(pr);
                }
            });
            logger.info("MongoDB Atlas synchronization complete. Loaded {} users, {} roles, {} competencies.",
                    users.size(), roles.size(), competencies.size());
        } catch (Exception e) {
            logger.warn("Could not sync directly with MongoDB Atlas on startup ({}). Local cache initialized.", e.getMessage());
        }
    }

    private void seedDemoUser() {
        try {
            User demoUser = new User("user-demo-1", "demo@adaptiq.io", "Alex Chen");
            demoUser.setPassword("demo1234");
            demoUser.setRoleId("role-frontend-engineer");
            demoUser.setRoleName("Frontend Architect");
            demoUser.setOverallLevel("INTERMEDIATE");
            demoUser.setCompetencyLevels(new HashMap<>(Map.of(
                    "HTML5 & Modern CSS", "EXPERT",
                    "JavaScript & TypeScript", "INTERMEDIATE",
                    "React & State Architecture", "INTERMEDIATE",
                    "Web Performance & Core Web Vitals", "NOVICE"
            )));
            demoUser.setCompetencyScores(new HashMap<>(Map.of(
                    "HTML5 & Modern CSS", 90,
                    "JavaScript & TypeScript", 75,
                    "React & State Architecture", 80,
                    "Web Performance & Core Web Vitals", 55
            )));
            users.put(demoUser.getId(), demoUser);
            passwordsByUserId.put(demoUser.getId(), "demo1234");

            if (userRepository != null && userRepository.findById(demoUser.getId()).isEmpty()) {
                userRepository.save(demoUser);
                logger.info("Seeded default demo user 'user-demo-1' into MongoDB Atlas.");
            }
        } catch (Exception e) {
            logger.warn("Failed to seed demo user to MongoDB: {}", e.getMessage());
        }
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

            addCompetency(new Competency(
                "comp-data-modeling",
                "SQL & Data Modeling",
                "SQL querying, relational design, normalization, dimensional modeling, and data quality constraints.",
                "Basic SELECT queries, filters, joins, and primary keys.",
                "Aggregations, window functions, normalization, indexes, and star-schema design.",
                "Query plans, partitioning, slowly changing dimensions, and advanced dimensional modeling."
            ));

            addCompetency(new Competency(
                "comp-data-pipelines",
                "ETL & Data Pipelines",
                "Reliable batch and streaming pipelines, data ingestion, transformations, orchestration, and data quality.",
                "Load files into a database and perform basic transformations.",
                "Orchestrated incremental loads, validation, retries, and dependency management.",
                "Idempotent distributed processing, late-arriving data, replay, and exactly-once tradeoffs."
            ));

            addCompetency(new Competency(
                "comp-snowflake",
                "Snowflake & Cloud Data Warehousing",
                "Snowflake architecture, virtual warehouses, storage and compute separation, security, and cost-aware analytics.",
                "Databases, schemas, tables, and basic Snowflake queries.",
                "Virtual warehouses, stages, file loading, roles, and workload isolation.",
                "Clustering, time travel, streams/tasks, resource monitors, and query optimization."
            ));

            addCompetency(new Competency(
                "comp-power-bi",
                "Power BI & Analytics",
                "Power BI data modeling, DAX, semantic models, dashboards, reporting, and business analytics.",
                "Import data, create visuals, and build basic reports.",
                "Star schemas, relationships, measures, filters, and dashboard design.",
                "DAX evaluation context, row-level security, incremental refresh, and model performance."
            ));

        // Roles
        addRole("role-frontend-engineer", "Frontend Architect", "Frontend Engineering", "Designs accessible web interfaces with semantic HTML, modern CSS, TypeScript, React, and browser performance optimization.", "Code", List.of("HTML5 & Modern CSS", "JavaScript & TypeScript", "React & State Architecture", "Web Performance & Core Web Vitals"));
        addRole("role-fullstack-cloud", "Full Stack Cloud Developer", "Software Engineering", "Builds React frontends, Spring Boot APIs, authenticated services, Docker images, and resilient cloud microservices.", "Layers", List.of("JavaScript & TypeScript", "React & State Architecture", "Cloud APIs & Microservices", "Web Performance & Core Web Vitals"));
        addRole("role-ai-engineer", "AI & Prompt Systems Engineer", "Artificial Intelligence", "Builds Gemini and LLM integrations using prompt engineering, RAG, embeddings, agents, structured output, evaluation, and safety controls.", "Brain", List.of("AI Engineering & LLM Integration", "JavaScript & TypeScript", "Cloud APIs & Microservices"));
        addRole("role-backend-engineer", "Backend Engineer", "Software Engineering", "Builds scalable REST APIs and services with Spring Boot or Node.js, databases, authentication, testing, and observability.", "Code", List.of("Cloud APIs & Microservices", "JavaScript & TypeScript", "AI Engineering & LLM Integration"));
        addRole("role-java-developer", "Java Developer", "Software Engineering", "Develops Java and Spring Boot services using object-oriented design, concurrency, persistence, REST APIs, testing, and JVM performance practices.", "Code", List.of("Cloud APIs & Microservices", "JavaScript & TypeScript", "Web Performance & Core Web Vitals"));
        addRole("role-devops-engineer", "DevOps Engineer", "Cloud Engineering", "Automates CI/CD, Docker and Kubernetes delivery, infrastructure as code, monitoring, logging, reliability, and deployment strategies.", "Layers", List.of("Cloud APIs & Microservices", "Web Performance & Core Web Vitals", "AI Engineering & LLM Integration"));
        addRole("role-data-engineer", "Data Engineer", "Data Engineering", "Designs dependable data pipelines and systems for analytics and intelligent products.", "Layers", List.of("SQL & Data Modeling", "ETL & Data Pipelines", "Snowflake & Cloud Data Warehousing", "Power BI & Analytics"));
        addRole("role-qa-engineer", "QA Automation Engineer", "Quality Engineering", "Creates automated web and API tests with Playwright or Selenium, fixtures, mocking, regression coverage, and CI quality gates.", "Code", List.of("JavaScript & TypeScript", "Cloud APIs & Microservices", "Web Performance & Core Web Vitals"));
        addRole("role-security-engineer", "Security Engineer", "Security Engineering", "Builds secure systems using threat modeling, OWASP controls, OAuth2 and JWT, secrets management, encryption, and cloud security.", "Brain", List.of("Cloud APIs & Microservices", "JavaScript & TypeScript", "AI Engineering & LLM Integration"));
        addRole("role-product-engineer", "Product Engineer", "Product Engineering", "Turns user needs into accessible React experiences with API integration, analytics, experimentation, and maintainable delivery.", "Code", List.of("React & State Architecture", "JavaScript & TypeScript", "Web Performance & Core Web Vitals"));

        // Keep the built-in role and competency catalog synchronized with MongoDB.
        try {
            if (competencyRepository != null) {
                competencyRepository.saveAll(new HashSet<>(competencies.values()));
            }
            if (roleRepository != null) {
                roleRepository.saveAll(roles.values());
            }
            logger.info("Synchronized built-in roles and competencies with MongoDB Atlas.");
        } catch (Exception e) {
            logger.warn("Could not synchronize roles/competencies to MongoDB: {}", e.getMessage());
        }
    }

    private void addRole(String id, String name, String category, String description, String icon, List<String> compList) {
        Role role = new Role(id, name, category, description, icon, compList);
        roles.put(id, role);
    }

    private void addCompetency(Competency comp) {
        competencies.put(comp.getId(), comp);
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
        User user = users.get(userId);
        if (user == null && userRepository != null) {
            try {
                Optional<User> dbUser = userRepository.findById(userId);
                if (dbUser.isPresent()) {
                    user = dbUser.get();
                    users.put(userId, user);
                    if (user.getPassword() != null) {
                        passwordsByUserId.put(userId, user.getPassword());
                    }
                }
            } catch (Exception e) {
                logger.warn("Error fetching user {} from MongoDB: {}", userId, e.getMessage());
            }
        }
        return user;
    }

    public User getUserByEmail(String email) {
        if (email == null) return null;
        User cached = users.values().stream()
                .filter(u -> u.getEmail() != null && u.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElse(null);
        if (cached != null) return cached;

        if (userRepository != null) {
            try {
                Optional<User> dbUser = userRepository.findByEmailIgnoreCase(email);
                if (dbUser.isPresent()) {
                    User user = dbUser.get();
                    users.put(user.getId(), user);
                    if (user.getPassword() != null) {
                        passwordsByUserId.put(user.getId(), user.getPassword());
                    }
                    return user;
                }
            } catch (Exception e) {
                logger.warn("Error fetching user by email {} from MongoDB: {}", email, e.getMessage());
            }
        }
        return null;
    }

    public void setPassword(String userId, String password) {
        passwordsByUserId.put(userId, password);
        User user = getUser(userId);
        if (user != null) {
            user.setPassword(password);
            saveUser(user);
        }
    }

    public boolean passwordMatches(String userId, String password) {
        if (password == null) return false;
        String stored = passwordsByUserId.get(userId);
        if (stored == null) {
            User user = getUser(userId);
            if (user != null && user.getPassword() != null) {
                stored = user.getPassword();
                passwordsByUserId.put(userId, stored);
            }
        }
        return password.equals(stored);
    }

    public void saveUser(User user) {
        users.put(user.getId(), user);
        if (user.getPassword() != null) {
            passwordsByUserId.put(user.getId(), user.getPassword());
        }
        if (userRepository != null) {
            try {
                userRepository.save(user);
            } catch (Exception e) {
                logger.warn("Could not persist user {} to MongoDB: {}", user.getId(), e.getMessage());
            }
        }
    }

    public Role getRole(String roleId) {
        Role role = roles.get(roleId);
        if (role == null && roleRepository != null) {
            try {
                Optional<Role> dbRole = roleRepository.findById(roleId);
                if (dbRole.isPresent()) {
                    role = dbRole.get();
                    roles.put(roleId, role);
                }
            } catch (Exception e) {
                logger.warn("Could not fetch role {} from MongoDB: {}", roleId, e.getMessage());
            }
        }
        return role;
    }

    public Quiz getQuiz(String quizId) {
        Quiz quiz = quizzes.get(quizId);
        if (quiz == null && quizRepository != null) {
            try {
                Optional<Quiz> dbQuiz = quizRepository.findById(quizId);
                if (dbQuiz.isPresent()) {
                    quiz = dbQuiz.get();
                    quizzes.put(quizId, quiz);
                }
            } catch (Exception e) {
                logger.warn("Could not fetch quiz {} from MongoDB: {}", quizId, e.getMessage());
            }
        }
        return quiz;
    }

    public void saveQuiz(Quiz quiz) {
        quizzes.put(quiz.getId(), quiz);
        if (quizRepository != null) {
            try {
                quizRepository.save(quiz);
            } catch (Exception e) {
                logger.warn("Could not persist quiz {} to MongoDB: {}", quiz.getId(), e.getMessage());
            }
        }
    }

    public QuizResult getQuizResult(String quizId) {
        QuizResult qr = quizResults.get(quizId);
        if (qr == null && quizResultRepository != null) {
            try {
                Optional<QuizResult> dbResult = quizResultRepository.findByQuizId(quizId);
                if (dbResult.isPresent()) {
                    qr = dbResult.get();
                    quizResults.put(quizId, qr);
                }
            } catch (Exception e) {
                logger.warn("Could not fetch quiz result {} from MongoDB: {}", quizId, e.getMessage());
            }
        }
        return qr;
    }

    public void saveQuizResult(QuizResult result) {
        if (result.getId() == null) {
            result.setId(result.getQuizId() != null ? result.getQuizId() : UUID.randomUUID().toString());
        }
        quizResults.put(result.getQuizId(), result);
        if (quizResultRepository != null) {
            try {
                quizResultRepository.save(result);
            } catch (Exception e) {
                logger.warn("Could not persist quiz result to MongoDB: {}", e.getMessage());
            }
        }
    }

    public LearningPath getLearningPathByUserId(String userId) {
        User user = getUser(userId);
        return user == null ? null : getLearningPathByUserIdAndRole(userId, user.getRoleId());
    }

    public LearningPath getLearningPathByUserIdAndRole(String userId, String roleId) {
        String key = pathKey(userId, roleId);
        LearningPath lp = learningPaths.get(key);
        if (lp == null && learningPathRepository != null) {
            try {
                Optional<LearningPath> dbPath = learningPathRepository.findByUserIdAndRoleId(userId, roleId);
                if (dbPath.isPresent()) {
                    lp = dbPath.get();
                    learningPaths.put(key, lp);
                    if (lp.getModules() != null) {
                        lp.getModules().forEach(m -> modules.put(m.getId(), m));
                    }
                }
            } catch (Exception e) {
                logger.warn("Could not fetch learning path from MongoDB: {}", e.getMessage());
            }
        }
        return lp;
    }

    public void saveLearningPath(LearningPath path) {
        learningPaths.put(pathKey(path.getUserId(), path.getRoleId()), path);
        if (path.getModules() != null) {
            for (LearningModule m : path.getModules()) {
                modules.put(m.getId(), m);
            }
        }
        if (learningPathRepository != null) {
            try {
                learningPathRepository.save(path);
                if (path.getModules() != null && moduleRepository != null) {
                    moduleRepository.saveAll(path.getModules());
                }
            } catch (Exception e) {
                logger.warn("Could not persist learning path to MongoDB: {}", e.getMessage());
            }
        }
    }

    private String pathKey(String userId, String roleId) {
        return userId + ":" + (roleId == null ? "unassigned" : roleId);
    }

    public LearningModule getModule(String moduleId) {
        LearningModule m = modules.get(moduleId);
        if (m == null && moduleRepository != null) {
            try {
                Optional<LearningModule> dbMod = moduleRepository.findById(moduleId);
                if (dbMod.isPresent()) {
                    m = dbMod.get();
                    modules.put(moduleId, m);
                }
            } catch (Exception e) {
                logger.warn("Could not fetch module {} from MongoDB: {}", moduleId, e.getMessage());
            }
        }
        return m;
    }

    public Collection<LearningModule> getAllModules() {
        if (moduleRepository != null && modules.isEmpty()) {
            try {
                moduleRepository.findAll().forEach(m -> modules.put(m.getId(), m));
            } catch (Exception e) {
                logger.warn("Could not fetch all modules from MongoDB: {}", e.getMessage());
            }
        }
        return modules.values();
    }

    public void saveModule(LearningModule module) {
        modules.put(module.getId(), module);
        if (moduleRepository != null) {
            try {
                moduleRepository.save(module);
            } catch (Exception e) {
                logger.warn("Could not persist module {} to MongoDB: {}", module.getId(), e.getMessage());
            }
        }
    }

    public List<ProgressRecord> getProgressForUser(String userId) {
        List<ProgressRecord> list = userProgress.get(userId);
        if ((list == null || list.isEmpty()) && progressRecordRepository != null) {
            try {
                List<ProgressRecord> dbRecords = progressRecordRepository.findByUserId(userId);
                if (dbRecords != null && !dbRecords.isEmpty()) {
                    userProgress.put(userId, new ArrayList<>(dbRecords));
                    return dbRecords;
                }
            } catch (Exception e) {
                logger.warn("Could not fetch progress records from MongoDB: {}", e.getMessage());
            }
        }
        return userProgress.computeIfAbsent(userId, k -> new ArrayList<>());
    }

    public void addProgressRecord(ProgressRecord record) {
        if (record.getId() == null) {
            record.setId("pr-" + UUID.randomUUID().toString().substring(0, 8));
        }
        List<ProgressRecord> list = userProgress.computeIfAbsent(record.getUserId(), k -> new ArrayList<>());
        list.add(record);
        if (progressRecordRepository != null) {
            try {
                progressRecordRepository.save(record);
            } catch (Exception e) {
                logger.warn("Could not persist progress record to MongoDB: {}", e.getMessage());
            }
        }
    }
}

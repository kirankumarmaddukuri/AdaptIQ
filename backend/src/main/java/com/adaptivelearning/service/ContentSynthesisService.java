package com.adaptivelearning.service;

import com.adaptivelearning.model.LearningModule;
import com.adaptivelearning.model.LearningModule.Exercise;
import com.adaptivelearning.repository.DataStore;
import com.adaptivelearning.service.ai.AIGatewayService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContentSynthesisService {

    private static final Logger logger = LoggerFactory.getLogger(ContentSynthesisService.class);
    private static final int CONTENT_VERSION = 2;

    private final AIGatewayService aiGatewayService;
    private final DataStore dataStore;
    private final ObjectMapper objectMapper;

    public ContentSynthesisService(AIGatewayService aiGatewayService, DataStore dataStore, ObjectMapper objectMapper) {
        this.aiGatewayService = aiGatewayService;
        this.dataStore = dataStore;
        this.objectMapper = objectMapper;
    }

    public LearningModule synthesizeModuleContent(String moduleId) {
        LearningModule module = dataStore.getModule(moduleId);
        if (module == null) {
            throw new IllegalArgumentException("Module not found: " + moduleId);
        }

        // If content already generated and cached in dataStore, return immediately
        if (module.getContentVersion() == CONTENT_VERSION
            && module.getContent() != null && !module.getContent().isBlank() && module.getExercise() != null) {
            return module;
        }

        try {
            synthesizeWithAI(module);
        } catch (Exception e) {
            logger.warn("AI content synthesis failed for module {}: {}. Generating structured fallback content.", moduleId, e.getMessage());
            generateFallbackContent(module);
        }

        dataStore.saveModule(module);
        return module;
    }

    private void synthesizeWithAI(LearningModule module) {
        String level = (module.getLevel() != null) ? module.getLevel() : "NOVICE";
        String competency = module.getCompetency();
        String title = module.getTitle();

        String levelInstructions;
        String contentLength;
        String sectionRequirements;

        if ("NOVICE".equalsIgnoreCase(level)) {
            levelInstructions = """
                TARGET AUDIENCE: NOVICE (Foundational learner / Beginner)
                TONE: Warm, patient, accessible, clear, and pedagogical.
                MANDATORY REQUIREMENTS:
                1. NEAT DEFINITIONS: Explicitly define every core technical term, acronym, and keyword with neat, simple definitions before using it. Explain "what it is" and "why it matters" in plain language.
                2. INTUITIVE REAL-WORLD ANALOGY: Provide an intuitive, memorable real-world analogy (e.g. comparing the concept to postal mail, kitchen recipes, blueprints, or telephone switchboards) to anchor comprehension.
                3. STEP-BY-STEP GUIDANCE: Break explanations into clear, sequential, numbered step-by-step instructions.
                4. AVOID UNEXPLAINED JARGON: Assume no prior expertise. Keep code snippets minimal, clean, and heavily annotated with beginner-friendly comments.
                """;
            contentLength = "Write 350-480 words to provide thorough context, neat definitions, and guided explanations.";
            sectionRequirements = """
                Must include exactly these sections:
                - ### 📖 Core Definitions & Foundational Concepts (clearly define each key term in bullet points)
                - ### 💡 Real-World Analogy (a relatable everyday analogy making the concept click)
                - ### 🛠️ Step-by-Step Practical Walkthrough (guided step-by-step explanation with a simple annotated code/command snippet)
                """;
        } else if ("EXPERT".equalsIgnoreCase(level)) {
            levelInstructions = """
                TARGET AUDIENCE: EXPERT (Staff/Principal Engineer & Systems Architect)
                TONE: Highly sophisticated, authoritative, high-level computer science vernacular, mathematically and architecturally rigorous.
                MANDATORY REQUIREMENTS:
                1. HIGH-LEVEL TECHNICAL VERNACULAR: Employ advanced engineering vocabulary (e.g. cache locality, amortized complexity, tail latency distribution, zero-copy buffers, consensus protocols, lock contention). Skip all basic definitions.
                2. SYSTEMS & ENGINE INTERNALS: Delve deeply into runtime internals, JIT compilation, virtual memory management, thread synchronization primitives, and OS-level syscall overhead.
                3. ENTERPRISE SCALE & FAILURE MODES: Analyze distributed resilience, CAP/PACELC tradeoffs, circuit breaker failure cascades, p99.99 SLA adherence, and observability telemetry.
                """;
            contentLength = "Write 280-400 words with dense, high-signal architectural depth and technical precision.";
            sectionRequirements = """
                Must include exactly these sections:
                - ### 🏛️ System Architecture & Runtime Internals (deep dive into engine mechanics and memory/concurrency models)
                - ### ⚡ High-Scale Performance Constraints & Failure Modes (critical edge cases, p99 latency tradeoffs, and failure mitigation)
                """;
        } else {
            levelInstructions = """
                TARGET AUDIENCE: INTERMEDIATE (Practicing Software Engineer)
                TONE: Pragmatic, professional, code-focused, and industry-oriented.
                MANDATORY REQUIREMENTS:
                1. NO INTRODUCTORY DEFINITIONS: Assume standard programming syntax and core fundamentals are already well understood.
                2. REAL-WORLD PRODUCTION PATTERNS: Focus on clean code patterns, modular architecture, state machines, and maintainable implementation workflows.
                3. OPERATIONAL TRADEOFFS: Discuss practical edge cases, robust error handling, performance tuning, and debugging strategies.
                """;
            contentLength = "Write 260-360 words focusing on practical production code patterns and tradeoffs.";
            sectionRequirements = """
                Must include exactly these sections:
                - ### ⚙️ Architecture Patterns & Implementation (production-ready design patterns and code structures)
                - ### 🔍 Practical Tradeoffs & Debugging Workflows (common failure modes, performance considerations, and test strategies)
                """;
        }

        String prompt = String.format("""
            You are a Principal Engineering Educator.
            Generate educational study content and a mini-practice exercise for the following micro-learning module:
            
            Module Title: "%s"
            Competency: "%s"
            Skill Level: "%s"
            Learning Objectives: %s
            
            %s
            
            %s
            
            Format your response strictly as JSON with this structure:
            {
              "content": "Clean markdown content tailored strictly to the %s level. %s %s Do not repeat the module title or learning objectives.",
              "exercise": {
                "question": "A multiple-choice question testing understanding tailored precisely for %s level",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctOptionIndex": 0,
                "explanation": "Clear explanation of why this answer is correct."
              }
            }
            Return only valid JSON.
            """, title, competency, level, module.getLearningObjectives(), levelInstructions, sectionRequirements, level, contentLength, sectionRequirements, level);

        String systemInstruction = String.format(
            "You are a Principal Engineering Educator. You strictly calibrate content depth, pedagogical style, and technical vocabulary to match the '%s' skill level. Output strict JSON only.",
            level.toUpperCase()
        );

        String response = aiGatewayService.generateContent(systemInstruction, prompt);
        String json = aiGatewayService.extractJson(response);

        if (json != null && !json.isBlank()) {
            try {
                JsonNode root = objectMapper.readTree(json);
                String content = root.path("content").asText();
                JsonNode exNode = root.path("exercise");

                if (!content.isBlank()) {
                    module.setContent(content);
                    module.setContentVersion(CONTENT_VERSION);
                }

                if (!exNode.isMissingNode()) {
                    String q = exNode.path("question").asText();
                    int correctIdx = exNode.path("correctOptionIndex").asInt(0);
                    String explanation = exNode.path("explanation").asText();
                    JsonNode optsNode = exNode.path("options");

                    List<String> options = List.of("Option A", "Option B", "Option C", "Option D");
                    if (optsNode.isArray() && optsNode.size() >= 2) {
                        options = objectMapper.convertValue(optsNode, List.class);
                    }

                    module.setExercise(new Exercise(q, options, correctIdx, explanation));
                    return;
                }
            } catch (Exception e) {
                logger.warn("Could not parse synthesized content JSON: {}", e.getMessage());
            }
        }

        generateFallbackContent(module);
    }

    private void generateFallbackContent(LearningModule module) {
        String level = (module.getLevel() != null) ? module.getLevel() : "NOVICE";
        String comp = module.getCompetency();

        StringBuilder sb = new StringBuilder();

        if ("NOVICE".equalsIgnoreCase(level)) {
            sb.append("Welcome to ").append(module.getTitle()).append("! In this foundational guide, we break down core ideas into clear definitions and simple analogies.\n\n");
            sb.append("### 📖 Core Definitions & Foundational Concepts\n\n");
            sb.append("- **Input & Output**: Software takes information in (input), processes it with defined rules, and produces a result (output).\n");
            sb.append("- **State**: The current condition or stored data of your application at any given moment.\n");
            sb.append("- **Deterministic Execution**: Given the exact same input, code should reliably produce the exact same outcome every time.\n\n");
            sb.append("### 💡 Real-World Analogy\n\n");
            sb.append("Think of a software module like a kitchen recipe: the ingredients are your inputs, following the recipe steps in order is your algorithm, and the finished dish is your output. Keeping each recipe step simple ensures that anyone can follow it without burning the meal!\n\n");
            sb.append("### 🛠️ Step-by-Step Practical Walkthrough\n\n");
            sb.append("1. **Define the Goal**: State what one specific task your code should accomplish.\n");
            sb.append("2. **Inspect the Data**: Trace variables step-by-step from beginning to end.\n");
            sb.append("3. **Verify Early**: Test small pieces individually before connecting them into larger systems.");
        } else if ("EXPERT".equalsIgnoreCase(level)) {
            sb.append("At the systems architecture level, ").append(module.getTitle()).append(" requires optimizing for tail latency, concurrency safety, and failure isolation under adversarial load.\n\n");
            sb.append("### 🏛️ System Architecture & Runtime Internals\n\n");
            sb.append("- **Cache Locality & Amortized Overhead**: Minimize L1/L2 cache misses by aligning contiguous memory allocations and avoiding pointer-chasing indirections.\n");
            sb.append("- **Non-Blocking I/O & Microtask Queues**: Saturate kernel epoll/kqueue event demultiplexers without blocking the event loop thread.\n");
            sb.append("- **Consensus & State Synchronization**: Reconcile distributed partitions using Raft/Paxos state machines with bounded leader election timeouts.\n\n");
            sb.append("### ⚡ High-Scale Performance Constraints & Failure Modes\n\n");
            sb.append("Enforce strict p99.9 latency budgets by isolating downstream dependencies behind adaptive circuit breakers with exponential backoff and jitter.");
        } else {
            sb.append("For practicing engineers, ").append(module.getTitle()).append(" focuses on production design patterns, clean code principles, and real-world debugging workflows.\n\n");
            sb.append("### ⚙️ Architecture Patterns & Implementation\n\n");
            sb.append("- **Separation of Concerns**: Isolate business logic from presentation and transport layers.\n");
            sb.append("- **Predictable Error Boundaries**: Handle rejected promises and exceptions gracefully with structured logging.\n");
            sb.append("- **Idempotent Operations**: Ensure repeated operations produce identical side effects without corrupting persistent state.\n\n");
            sb.append("### 🔍 Practical Tradeoffs & Debugging Workflows\n\n");
            sb.append("Profile execution bottlenecks using browser DevTools or APM flame graphs before applying speculative micro-optimizations.");
        }

        module.setContent(sb.toString());
        module.setContentVersion(CONTENT_VERSION);

        module.setExercise(new Exercise(
                "NOVICE".equalsIgnoreCase(level)
                        ? "What is the primary benefit of breaking complex software tasks into small, clearly defined steps?"
                        : "EXPERT".equalsIgnoreCase(level)
                        ? "Which mechanism best prevents cascading failure across distributed microservices under high downstream tail latency?"
                        : "What is the key advantage of maintaining separation of concerns in production applications?",
                "NOVICE".equalsIgnoreCase(level)
                        ? List.of(
                                "It makes the system easier to understand, test, and debug",
                                "It makes the computer run out of memory faster",
                                "It forces all functions to be written on a single line",
                                "It eliminates the need for any programming logic"
                        )
                        : "EXPERT".equalsIgnoreCase(level)
                        ? List.of(
                                "Adaptive circuit breaking with exponential backoff and jitter",
                                "Unbounded retries sent in parallel to amplify network throughput",
                                "Disabling health check probes to prevent CPU overhead",
                                "Synchronously locking all threads until the slowest node responds"
                        )
                        : List.of(
                                "Decoupling business logic enables easier maintenance, independent testing, and safer refactoring",
                                "Combining all logic into one giant file increases execution velocity",
                                "It prevents browsers from rendering CSS styles",
                                "It removes the need to write unit or integration tests"
                        ),
                0,
                "NOVICE".equalsIgnoreCase(level)
                        ? "Breaking work down into simple, well-defined steps ensures problems are easy to locate and fix."
                        : "EXPERT".equalsIgnoreCase(level)
                        ? "Adaptive circuit breakers with backoff and jitter trip immediately when downstreams fail, protecting upstream thread pools from exhaustion."
                        : "Separation of concerns isolates components so changes in one area don't trigger unexpected regressions elsewhere."
        ));
    }
}

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
        if ("NOVICE".equalsIgnoreCase(level)) {
            levelInstructions = "Target audience: NOVICE. Use crystal-clear analogies, simplified summaries, step-by-step beginner explanations, clear definitions, and visual ASCII diagrams. Avoid overwhelming jargon.";
            contentLength = "Write 300-400 words so the learner gets enough context and guided explanation.";
        } else if ("EXPERT".equalsIgnoreCase(level)) {
            levelInstructions = "Target audience: EXPERT. Focus on high-level system architecture, engine internals, memory models, concurrency hazards, benchmark tradeoffs, and enterprise production edge cases.";
            contentLength = "Write 140-220 words, assuming strong fundamentals and focusing on tradeoffs and production decisions.";
        } else {
            levelInstructions = "Target audience: INTERMEDIATE. Focus on real-world practical patterns, architectural comparisons, code implementations, best practices, and debugging workflows.";
            contentLength = "Write 200-280 words with practical guidance and one focused implementation example when useful.";
        }

        String prompt = String.format("""
            You are a Principal Engineering Educator.
            Generate concise educational study content and a mini-practice exercise for the following micro-learning module:
            
            Module Title: "%s"
            Competency: "%s"
            Skill Level: "%s"
            Learning Objectives: %s
            
            %s
            The Skill Level is a hard requirement. Do not use content aimed at another level.
            NOVICE content must define terms, explain the why, use a simple analogy, and give step-by-step guidance.
            INTERMEDIATE content must assume fundamentals and focus on practical patterns, implementation choices, debugging, and tradeoffs.
            EXPERT content must skip basic definitions and focus on internals, architecture, performance constraints, failure modes, and production tradeoffs.
            
            Format your response strictly as JSON with this structure:
            {
              "content": "Clean markdown content. %s Start directly with one short explanation, then use exactly two short sections with bullet points. Include one small code example only when it materially improves understanding. Do not repeat the module title, target level, competency, or learning objectives.",
              "exercise": {
                "question": "A multiple-choice question testing understanding of this specific module",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctOptionIndex": 0,
                "explanation": "Clear explanation of why this answer is correct."
              }
            }
            Return only valid JSON.
            """, title, competency, level, module.getLearningObjectives(), levelInstructions, contentLength);

        String response = aiGatewayService.generateContent("You are a technical education author. Output strict JSON only.", prompt);
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
        String level = (module.getLevel() != null) ? module.getLevel() : "INTERMEDIATE";
        String comp = module.getCompetency();

        StringBuilder sb = new StringBuilder();

        if ("NOVICE".equalsIgnoreCase(level)) {
            sb.append("Start with the basics: an API receives a request, performs a small amount of work, and returns a response. Keeping each step simple makes problems easier to find.\n\n");
            sb.append("### Foundations\n\n");
            sb.append("- Define each term before using it.\n");
            sb.append("- Follow one request from input to response.\n");
            sb.append("- Change one small thing at a time and test it.\n\n");
            sb.append("### Guided Practice\n\n");
            sb.append("Draw the request flow for one endpoint. Label where data enters, where it changes, and where the response is returned.");
        } else if ("EXPERT".equalsIgnoreCase(level)) {
            sb.append("At expert level, API latency is a systems problem: queueing, connection reuse, serialization, downstream variance, and tail behavior must be measured together.\n\n");
            sb.append("### Architecture Tradeoffs\n\n");
            sb.append("- Track p95 and p99 latency separately from averages.\n");
            sb.append("- Bound retries and isolate slow downstream dependencies.\n");
            sb.append("- Compare pooling, batching, caching, and serialization changes with production traces.\n\n");
            sb.append("### Production Review\n\n");
            sb.append("Set a latency budget per dependency and verify that timeout, retry, and fallback policies preserve the end-to-end SLO.");
        } else {
            sb.append("For intermediate engineers, improving API latency means measuring the request path and choosing targeted fixes rather than optimizing blindly.\n\n");
            sb.append("### Applied Strategies\n\n");
            sb.append("- Profile controller, database, network, and serialization time separately.\n");
            sb.append("- Reuse connections and avoid repeated work in the request path.\n");
            sb.append("- Add tests for normal, slow, and failed downstream responses.\n\n");
            sb.append("### Practical Exercise\n\n");
            sb.append("Trace one endpoint, record each step’s duration, and identify the single largest contributor before changing code.");
        }

        module.setContent(sb.toString());
        module.setContentVersion(CONTENT_VERSION);

        module.setExercise(new Exercise(
                "Based on the core principles discussed in this module, what is the primary recommendation for production maintainability?",
                List.of(
                        "Couple all logic into a single monolithic function for maximum speed",
                        "Maintain clear separation of concerns, handle edge cases, and decouple state from side effects",
                        "Ignore error boundaries since modern browsers and engines catch all faults",
                        "Avoid writing tests to speed up the release cycle"
                ),
                1,
                "Modular architecture with isolated side effects and clear boundaries is essential for maintainability and scalability."
        ));
    }
}

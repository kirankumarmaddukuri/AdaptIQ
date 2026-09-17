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
public class AssessmentService {

    private static final Logger logger = LoggerFactory.getLogger(AssessmentService.class);

    private final AIGatewayService aiGatewayService;
    private final DataStore dataStore;
    private final ObjectMapper objectMapper;

    public AssessmentService(AIGatewayService aiGatewayService, DataStore dataStore, ObjectMapper objectMapper) {
        this.aiGatewayService = aiGatewayService;
        this.dataStore = dataStore;
        this.objectMapper = objectMapper;
    }

    public Quiz generateDiagnosticQuiz(String userId, String roleId) {
        Role role = dataStore.getRole(roleId);
        if (role == null) {
            role = dataStore.getRoles().values().iterator().next();
        }

        String quizId = "quiz-" + UUID.randomUUID().toString().substring(0, 8);
        Quiz quiz = new Quiz(quizId, userId, role.getId(), role.getName(), "DIAGNOSTIC");

        List<Question> questions = null;

        try {
            questions = generateQuestionsWithAI(role);
        } catch (Exception e) {
            logger.warn("AI generation error: {}. Using structured benchmark questions fallback.", e.getMessage());
        }

        if (questions == null || questions.isEmpty()) {
            questions = generateFallbackQuestions(role);
        }

        quiz.setQuestions(questions);
        dataStore.saveQuiz(quiz);

        // Update user's active role if user exists
        User user = dataStore.getUser(userId);
        if (user != null) {
            user.setRoleId(role.getId());
            user.setRoleName(role.getName());
            dataStore.saveUser(user);
        }

        return quiz;
    }

    private List<Question> generateQuestionsWithAI(Role role) {
        String competenciesList = String.join(", ", role.getCompetencies());
        String roleTopics = getRoleTopics(role);

        String prompt = String.format("""
            You are a Principal Engineering Technical Evaluator.
            Generate a high-precision diagnostic quiz with exactly 6 questions for assessing a candidate for the role: "%s".
            The assessment covers these key competencies: [%s].
            Role-specific topics that must define the quiz: %s
            Every question, answer option, and explanation must be specific to this role and one of these competencies.
            Use the role-specific topics above as the subject boundary. Do not use generic software-engineering questions or topics from any other role.
            
            Requirements:
            1. Include a mix of EASY (novice foundation), MEDIUM (applied engineering), and HARD (internals/architecture/edge cases).
            2. Every question must test one of the specified competencies and set its competency field to that exact competency name.
            3. Provide 4 realistic options per question.
            4. Return strict JSON format with an array of objects matching this schema:
            [
              {
                "id": 1,
                "text": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctOptionIndex": 0,
                "difficulty": "EASY",
                "competency": "Competency Name",
                "explanation": "Why this answer is correct."
              }
            ]
            Do not include any conversational preamble. Return only the JSON array.
            """, role.getName(), competenciesList, roleTopics);

        String aiResponse = aiGatewayService.generateContent("You are an assessment engine. You strictly output valid JSON arrays.", prompt);
        String json = aiGatewayService.extractJson(aiResponse);

        if (json != null && !json.isBlank()) {
            try {
                List<Question> list = objectMapper.readValue(json, new TypeReference<List<Question>>() {});
                if (list != null && !list.isEmpty()) {
                    for (int i = 0; i < list.size(); i++) {
                        list.get(i).setId(i + 1);
                    }
                    return list;
                }
            } catch (Exception e) {
                logger.warn("Could not parse AI quiz JSON: {}. Response was: {}", e.getMessage(), json);
            }
        }

        return null;
    }

    private String getRoleTopics(Role role) {
        return switch (role.getId()) {
            case "role-frontend-engineer" -> "semantic HTML, modern CSS, JavaScript and TypeScript, React, accessibility, responsive UI, and browser performance";
            case "role-fullstack-cloud" -> "React frontend development, REST APIs, Spring Boot services, authentication, Docker, cloud deployment, and microservice communication";
            case "role-ai-engineer" -> "prompt engineering, Gemini and LLM APIs, structured JSON generation, RAG, embeddings, agents, evaluation, and AI safety";
            case "role-backend-engineer" -> "REST API design, Spring Boot or Node.js services, databases, authentication, validation, testing, observability, and scalability";
            case "role-java-developer" -> "Java, Spring Boot, object-oriented design, collections, concurrency, persistence, REST APIs, testing, and JVM performance";
            case "role-devops-engineer" -> "CI/CD pipelines, Docker, Kubernetes, infrastructure as code, cloud operations, monitoring, logging, reliability, and deployment strategies";
            case "role-data-engineer" -> "SQL, data modeling, ETL and ELT, batch and streaming pipelines, Snowflake, cloud data warehouses, Power BI, DAX, and analytics";
            case "role-qa-engineer" -> "test strategy, JavaScript or TypeScript automation, Playwright or Selenium, API testing, fixtures, mocking, regression testing, and CI quality gates";
            case "role-security-engineer" -> "threat modeling, OWASP risks, secure API design, OAuth2 and JWT, secrets management, encryption, vulnerability management, and cloud security";
            case "role-product-engineer" -> "product discovery, user stories, React interfaces, JavaScript, API integration, analytics, experimentation, accessibility, and maintainable delivery";
            default -> role.getDescription();
        };
    }

    public List<Question> generateFallbackQuestions(Role role) {
        List<Question> questions = new ArrayList<>();
        int qId = 1;

        for (String comp : role.getCompetencies()) {
            if (comp.contains("HTML") || comp.contains("CSS")) {
                questions.add(new Question(
                        qId++,
                        "In modern CSS layout, which declaration creates a flexible grid container that automatically wraps items without media queries?",
                        List.of(
                                "grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));",
                                "display: flex; flex-direction: wrap-auto;",
                                "grid-auto-flow: dense-wrap;",
                                "columns: auto 250px;"
                        ),
                        0,
                        "MEDIUM",
                        comp,
                        "repeat(auto-fit, minmax(250px, 1fr)) instructs CSS Grid to create as many 250px columns as fit, expanding them equally to fill remaining space without media queries."
                ));
            } else if (comp.contains("JavaScript") || comp.contains("TypeScript")) {
                questions.add(new Question(
                        qId++,
                        "What is the output of `console.log(typeof null)` and why?",
                        List.of(
                                "'null' because null is its own primitive type",
                                "'object' due to a historical legacy bug in JavaScript's first implementation",
                                "'undefined' because null represents an unassigned reference",
                                "'boolean' because null evaluates to false"
                        ),
                        1,
                        "EASY",
                        comp,
                        "In JavaScript's initial implementation, values were represented with type tags where 0 represented an object reference. Null was NULL pointer (0x00), hence typeof null evaluates to 'object'."
                ));
            } else if (comp.contains("React")) {
                questions.add(new Question(
                        qId++,
                        "When should you use the `useCallback` hook in a React component?",
                        List.of(
                                "On every function to make the entire component faster automatically",
                                "Only when passing callbacks to memoized child components (React.memo) or as dependency in other hooks",
                                "To execute side effects after state has changed",
                                "To replace useState when dealing with objects"
                        ),
                        1,
                        "MEDIUM",
                        comp,
                        "useCallback memoizes a function instance. Its overhead is only beneficial when passing the function to memoized children or dependencies where reference equality prevents re-renders."
                ));
            } else if (comp.contains("Performance") || comp.contains("Vitals")) {
                questions.add(new Question(
                        qId++,
                        "Which Core Web Vital measures visual stability by tracking unexpected layout shifts during page loading?",
                        List.of(
                                "Largest Contentful Paint (LCP)",
                                "Cumulative Layout Shift (CLS)",
                                "Interaction to Next Paint (INP)",
                                "First Contentful Paint (FCP)"
                        ),
                        1,
                        "EASY",
                        comp,
                        "CLS (Cumulative Layout Shift) measures visual stability by tracking content shifts caused by unsized images, dynamic ads, or late-injected fonts."
                ));
                    } else if (comp.contains("SQL") || comp.contains("Data Modeling")) {
                    questions.add(new Question(
                        qId++,
                        "Which database design practice best prevents duplicated customer data across orders and invoices?",
                        List.of(
                            "Normalize shared customer attributes into a customer table and reference it with keys",
                            "Copy all customer fields into every related table",
                            "Store every record as an unstructured text document",
                            "Remove identifiers so tables remain independent"
                        ),
                        0,
                        "EASY",
                        comp,
                        "Normalization stores each business fact in one place and uses keys to relate records, reducing update anomalies and duplication."
                    ));
                    } else if (comp.contains("ETL") || comp.contains("Data Pipelines")) {
                    questions.add(new Question(
                        qId++,
                        "Which pipeline property allows a failed data-load job to be safely rerun without duplicating rows?",
                        List.of(
                            "Idempotency using a stable business key or load identifier",
                            "Increasing the batch size until the job succeeds",
                            "Disabling validation during retries",
                            "Appending every retry to the destination without checks"
                        ),
                        0,
                        "MEDIUM",
                        comp,
                        "An idempotent load produces the same destination state when repeated, commonly by deduplicating on a stable key or run identifier."
                    ));
                    } else if (comp.contains("Snowflake") || comp.contains("Cloud Data Warehouse")) {
                    questions.add(new Question(
                        qId++,
                        "In Snowflake, what is the primary purpose of a virtual warehouse?",
                        List.of(
                            "It provides compute resources for executing queries and data-loading operations",
                            "It permanently stores all table data independently of databases",
                            "It replaces role-based access control",
                            "It converts relational tables into Power BI reports"
                        ),
                        0,
                        "MEDIUM",
                        comp,
                        "Snowflake separates storage and compute; a virtual warehouse supplies the compute cluster used for queries and loads."
                    ));
                    } else if (comp.contains("Power BI") || comp.contains("Analytics")) {
                    questions.add(new Question(
                        qId++,
                        "Which Power BI modeling approach is generally preferred for a clear and performant analytical model?",
                        List.of(
                            "A star schema with fact tables connected to descriptive dimension tables",
                            "One wide table containing every repeated descriptive attribute",
                            "A separate report for every individual row",
                            "Storing measures as screenshots instead of model calculations"
                        ),
                        0,
                        "MEDIUM",
                        comp,
                        "A star schema separates measurable events from descriptive dimensions, making relationships and analytical calculations easier to manage."
                    ));
            } else if (comp.contains("Cloud") || comp.contains("Microservices")) {
                questions.add(new Question(
                        qId++,
                        "Which design pattern prevents an application from repeatedly attempting an operation that is likely to fail, shielding upstream microservices?",
                        List.of(
                                "Circuit Breaker pattern",
                                "CQRS (Command Query Responsibility Segregation)",
                                "Saga pattern",
                                "Strangler Fig pattern"
                        ),
                        0,
                        "HARD",
                        comp,
                        "The Circuit Breaker pattern detects failures and trips the circuit open to immediately return fallbacks, protecting the downstream system from cascade failure."
                ));
            } else {
                questions.add(new Question(
                        qId++,
                        "In Generative AI architectures, what is the primary purpose of Retrieval-Augmented Generation (RAG)?",
                        List.of(
                                "Retrain the model weights during each prompt execution",
                                "Ground LLM responses with relevant domain documents fetched dynamically at inference time",
                                "Compress the neural network into a smaller quantized model",
                                "Generate vector embeddings for image datasets"
                        ),
                        1,
                        "MEDIUM",
                        comp,
                        "RAG queries an external database or vector store for relevant context chunks, injecting them into the prompt to provide accurate, grounded answers without retraining."
                ));
            }

            if (questions.size() >= 6) break;
        }

        return questions;
    }
}

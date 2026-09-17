# AI Integration Guide

## Overview

AdaptIQ uses **Google Gemini** (`gemini-3.1-flash-lite`) as its AI backbone. All AI calls are routed through a single `AIGatewayService` in the backend — the frontend **never calls Gemini directly**.

---

## AI Model

| Property | Value |
|---|---|
| Model | `gemini-3.1-flash-lite` |
| API Version | `v1beta` |
| Base URL | `https://generativelanguage.googleapis.com/v1beta/models` |
| Endpoint | `POST /{model}:generateContent?key={API_KEY}` |
| Timeout | 30 seconds (connection) |
| Output | Raw text (JSON extracted via regex) |

---

## `AIGatewayService`

Located at: `backend/src/main/java/com/adaptivelearning/service/ai/AIGatewayService.java`

### Core Method

```java
public String generateContent(String systemInstruction, String userPrompt)
```

Builds a Gemini API request in the following format and returns the raw text:

```json
{
  "system_instruction": {
    "parts": [{ "text": "<systemInstruction>" }]
  },
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "<userPrompt>" }]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 8192
  }
}
```

### JSON Extraction

Since Gemini sometimes wraps JSON in markdown code fences, `AIGatewayService` uses a regex extractor:

```java
// Strips ```json ... ``` wrappers if present
Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)\\s*```")
```

If no code fence is found, the raw response is returned as-is.

---

## AI-Powered Features

### 1. Diagnostic Assessment Generation

**Service:** `AssessmentService.generateAssessment()`  
**Trigger:** `POST /api/assessment/generate`

**System Instruction:**
```
You are an expert technical assessor for software engineering roles.
Generate a diagnostic assessment quiz in valid JSON format only.
```

**User Prompt includes:**
- Role name and its competencies
- Number of questions per competency
- Difficulty distribution (Easy/Medium/Hard)
- Required JSON schema with `id`, `text`, `options[]`, `correctIndex`, `explanation`, `difficulty`, `competency`

**Output:** A `Quiz` object with 10 questions per role, spread across all competencies.

---

### 2. Checkpoint Quiz Generation

**Service:** `CheckpointService.generateCheckpoint()`  
**Trigger:** `POST /api/checkpoint/generate`

Similar to assessment generation but scoped to a **single competency** with 3–5 targeted questions.

---

### 3. Learning Path Curation

**Service:** `CurriculumService.generateLearningPath()`  
**Trigger:** `POST /api/learning-path/generate`

**System Instruction:**
```
You are an expert curriculum designer for software engineering education.
Generate a personalized learning path in valid JSON format only.
```

**User Prompt includes:**
- User's current competency levels and scores
- Role name and all competencies
- Gap analysis (which competencies scored below threshold)
- Requested ordering logic (weakest first, then intermediate improvement)

**Output:** An ordered list of modules with titles, competency mappings, and estimated durations.

---

### 4. Module Content Synthesis

**Service:** `ContentSynthesisService.generateModuleContent()`  
**Trigger:** Called internally during learning path generation

For each module in the learning path, Gemini generates:

| Section | Description |
|---|---|
| `theory` | Detailed explanation (markdown) of the concept |
| `codeExamples[]` | 2–3 code snippets with titles and language |
| `exercise` | A single MCQ exercise with options, correct answer, and explanation |

**System Instruction:**
```
You are an expert software engineering educator.
Generate comprehensive learning module content in valid JSON format only.
```

---

## Configuration

### Environment Variable

```properties
# .env or system environment
GEMINI_API_KEY=your-api-key-here
```

### `application.properties`

```properties
gemini.api.key=${GEMINI_API_KEY:}
gemini.model=${GEMINI_MODEL:gemini-3.1-flash-lite}
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models
```

The model can be overridden at runtime via the `GEMINI_MODEL` env var without recompiling.

---

## Latency Expectations

| Operation | Typical Latency |
|---|---|
| Assessment generation (10 questions) | 5–15 seconds |
| Checkpoint generation (3–5 questions) | 3–8 seconds |
| Learning path curation | 5–10 seconds |
| Module content synthesis (per module) | 4–12 seconds |
| Full learning path + all modules | 30–90 seconds (async) |

> ℹ️ Learning path generation runs **asynchronously** in the background after assessment submission. The frontend polls or navigates to `/learning-path` where it waits for completion.

---

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the key to your `.env` file as `GEMINI_API_KEY=...`

> The `gemini-3.1-flash-lite` model is available on the **free tier** with generous rate limits.

---

## Error Handling

If Gemini returns an empty response, a non-JSON response, or the API key is invalid, `AIGatewayService` throws a `RuntimeException` which propagates as a `500 Internal Server Error` to the client.

The frontend shows this as an inline error banner on the quiz and learning path pages.

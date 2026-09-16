package com.adaptivelearning.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AIGatewayService {

    private static final Logger logger = LoggerFactory.getLogger(AIGatewayService.class);

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-3.6-flash}")
    private String geminiModel;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiApiUrl;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AIGatewayService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
    }

    /**
     * Calls Google Gemini API with the specified prompt and returns the raw response text.
     */
    public String generateContent(String systemInstruction, String userPrompt) {
        String endpoint = String.format("%s/%s:generateContent?key=%s", geminiApiUrl, geminiModel, geminiApiKey);

        try {
            Map<String, Object> payload = new HashMap<>();

            // Contents array
            Map<String, Object> part = new HashMap<>();
            String combinedPrompt = (systemInstruction != null && !systemInstruction.isBlank())
                    ? systemInstruction + "\n\nTask instructions:\n" + userPrompt
                    : userPrompt;

            part.put("text", combinedPrompt);
            Map<String, Object> contentItem = new HashMap<>();
            contentItem.put("parts", List.of(part));
            payload.put("contents", List.of(contentItem));

            // Generation config
            Map<String, Object> genConfig = new HashMap<>();
            genConfig.put("temperature", 0.4);
            genConfig.put("maxOutputTokens", 4000);
            payload.put("generationConfig", genConfig);

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(50))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            logger.info("Calling Gemini API [{}]...", geminiModel);
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && !parts.isEmpty()) {
                        String generatedText = parts.get(0).path("text").asText();
                        logger.info("Gemini API call succeeded. Generated text length: {}", generatedText.length());
                        return generatedText;
                    }
                }
            } else {
                logger.warn("Gemini API returned status code {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            logger.error("Exception occurred while querying Gemini API: {}", e.getMessage());
        }

        return null;
    }

    /**
     * Extracts structured JSON from model responses which may be surrounded by markdown code blocks.
     */
    public String extractJson(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            return null;
        }

        // Check if markdown code block exists (```json ... ``` or ``` ...)
        Pattern pattern = Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)\\s*```", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(rawResponse);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        // Try looking for first '[' or '{' to last ']' or '}'
        int firstBrace = rawResponse.indexOf('{');
        int firstBracket = rawResponse.indexOf('[');

        int start = -1;
        int end = -1;

        if (firstBracket != -1 && (firstBrace == -1 || firstBracket < firstBrace)) {
            start = firstBracket;
            end = rawResponse.lastIndexOf(']');
        } else if (firstBrace != -1) {
            start = firstBrace;
            end = rawResponse.lastIndexOf('}');
        }

        if (start != -1 && end != -1 && end > start) {
            return rawResponse.substring(start, end + 1).trim();
        }

        return rawResponse.trim();
    }
}

package com.server.letMeCook.service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.server.letMeCook.dto.recipe.RecipeSearchFields;

import io.github.cdimascio.dotenv.Dotenv;

@Service
public class OpenAIService {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String openAiApiKey;

    private final CuisineService cuisineService;
    private final CategoryService categoryService;
    private final DietaryPreferenceService  dietaryPreferenceService;


    public OpenAIService(
            RestTemplate restTemplate,
            CuisineService cuisineService,
            CategoryService categoryService,
            DietaryPreferenceService dietaryPreferenceService
    ) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
        this.cuisineService = cuisineService;
        this.categoryService = categoryService;
        this.dietaryPreferenceService = dietaryPreferenceService;
        Dotenv dotenv = Dotenv.load();
        this.openAiApiKey = dotenv.get("OPENAI_API_KEY");

        if (openAiApiKey == null || openAiApiKey.isEmpty()) {
            throw new IllegalArgumentException("❌ OPENAI_API_KEY is not set in the .env file.");
        }
    }
    private String normalizePromptForSearch(String prompt) {
        prompt = prompt.toLowerCase();

        String[] uselessPhrases = {
                "i want", "let me", "give me", "show me", "find", "get me", "can you", "how to make", "please", "could you"
        };

        for (String phrase : uselessPhrases) {
            prompt = prompt.replace(phrase, "");
        }

        return prompt.replaceAll("\\s+", " ").trim();
    }


    public RecipeSearchFields extractRecipeSearchFields(String prompt){
        List<String> cuisineNames = cuisineService.getAllCuisineNames();
        List<String> categoryNames = categoryService.getAllCategoryNames();
        List<String> dietNames = dietaryPreferenceService.getAllDietaryPreferenceNames();
        if (prompt != null) prompt = normalizePromptForSearch(prompt);

        StringBuilder userContent = new StringBuilder();
        userContent.append("Prompt: ").append(prompt != null ? prompt : "").append("\n");

        String instruction = String.format("""
    Based on the following user prompt, extract and return a valid JSON object with the following fields:
    
    - keyword: A short and clean phrase for searching dish titles, person names, or descriptions.\s
       - ⚠️ Can include a dish name or a person's name **if it appears meaningfully** in the prompt.
       - ⚠️ Remove generic phrases: "I want", "Let me", "Give me", "Show me", "Find", "Get me", "Can you", "How to make", etc.
       - ⚠️ Remove stopwords: "the", "a", "an", "with", "for", "and", "or", "but", etc.
       - ⚠️ Remove generic food words: "dishes", "meal", "food", "recipe", "cooking", etc.
       - ⚠️ Remove words already used in cuisines, ingredients, categories, or dietary preferences.
       - ⚠️ Can be null/"" if no meaningful word remains.
       - ✅ Examples:
         "I want a spicy Vietnamese soup with noodles" → keyword: "spicy soup"
         "Show me Jenny's recipe" → keyword: "Jenny"
         "Give me dishes with avocado without chicken" → keyword: null
    
    - cuisines: Include only if explicitly mentioned in the prompt. Choose only from the following list: [%s]

    - ingredients: Extract up to 5 main ingredients that are clearly stated or strongly implied.

    - allergies: Include specific INGREDIENT NAMES that should be avoided. This includes:
      - Ingredient names the user is allergic to
      - Ingredients to exclude/avoid (words like "without", "no", "avoid", "exclude")
      - ✅ Examples: "allergic to peanuts" → allergies: ["peanuts"], "without chicken" → allergies: ["chicken"], "no dairy" → allergies: ["dairy"]
      - ❌ Do NOT include dietary preferences like "gluten-free", "vegan", "dairy-free" here

    - categories: Include only if mentioned. Choose only from the following list: [%s]. Match exact or closely similar names based on the prompt.

    - dietaryPreferences: Include only if mentioned. Choose only from the following list: [%s]. Match exact or closely similar names based on the prompt.

    IMPORTANT RULES:
    - Only include values that are explicitly present in the user prompt
    - Use null for fields that are not mentioned
    - For "allergies" field, include ingredient names to avoid (both allergies and exclusions)
    - Return only a valid raw JSON object with NO markdown, explanation, or extra text
    
    Example response format:
    {
      "keyword": null,
      "cuisines": null,
      "ingredients": ["avocado"],
      "allergies": ["chicken"],
      "categories": null,
      "dietaryPreferences": null
    }

    Prompt: %s
    """,
                String.join(", ", cuisineNames),
                String.join(", ", categoryNames),
                String.join(", ", dietNames),
                userContent.toString()
        );
        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4.1",
                "temperature", 0,
                "messages", List.of(
                        Map.of("role", "system", "content", "You are an AI assistant that helps extract structured recipe search fields."),
                        Map.of("role", "user", "content", instruction)
                )
        );
        HttpHeaders header = new HttpHeaders();
        header.setContentType(MediaType.APPLICATION_JSON);
        header.setBearerAuth(openAiApiKey);
        // post
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, header);
        ResponseEntity<Map> response = restTemplate.exchange(
                "https://api.openai.com/v1/chat/completions",
                HttpMethod.POST,
                request,
                Map.class
        );
        RecipeSearchFields result = parseResponse(response.getBody());
        return result;
    }

    public List<String> detectIngredientsFromImage(String imageBase64) {
        String mimeType = detectMimeTypeFromBase64(imageBase64);
        String imageDataUrl = "data:" + mimeType + ";base64," + imageBase64;


        Map<String, Object> imageMessage = Map.of(
                "role", "user",
                "content", List.of(
                        Map.of(
                                "type", "text",
                                "text", "List the visible ingredients in the image. Only return a pure JSON array of lowercase ingredient names, with no explanation, no markdown, no extra words. Remove any adjectives or extra descriptions. Example: [\"corn\", \"carrot\"]."
                        ),
                        Map.of(
                                "type", "image_url",
                                "image_url", Map.of("url", imageDataUrl)
                        )
                )
        );


        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4.1",
                "temperature", 0,
                "messages", List.of(imageMessage)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.exchange(
                "https://api.openai.com/v1/chat/completions",
                HttpMethod.POST,
                request,
                Map.class
        );

        try {
            Map<String, Object> choice = ((List<Map<String, Object>>) response.getBody().get("choices")).get(0);
            Map<String, Object> message = (Map<String, Object>) choice.get("message");
            String content = (String) message.get("content");
            return objectMapper.readValue(content, new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
        } catch (Exception e) {
            String fallback = ((List<Map<String, Object>>) response.getBody().get("choices")).get(0)
                    .get("message").toString();

            return Arrays.stream(fallback.split(",|\\n"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(String::toLowerCase)
                    .distinct()
                    .limit(5)
                    .toList();
        }
    }


    private String detectMimeTypeFromBase64(String base64) {
        if (base64 == null || base64.isEmpty()) {
            return "image/jpeg"; // fallback
        }

        String prefix = base64.substring(0, 10);

        if (prefix.startsWith("/9j/")) {
            return "image/jpeg"; // JPEG magic number: FF D8
        } else if (prefix.startsWith("iVBORw0KGgo")) {
            return "image/png"; // PNG magic number: 89 50 4E 47
        } else if (prefix.startsWith("R0lGOD")) {
            return "image/gif"; // GIF magic number: 47 49 46
        } else if (prefix.startsWith("UklGR")) {
            return "image/webp"; // WEBP (RIFF)
        } else if (prefix.startsWith("AAABAA")) {
            return "image/x-icon"; // ICO
        }

        return "image/jpeg"; // default fallback
    }

    @SuppressWarnings("unchecked")
    private RecipeSearchFields parseResponse(Map<String, Object> response) {
        try {
            Map<String, Object> choice = (Map<String, Object>) ((List<?>) response.get("choices")).get(0);
            Map<String, Object> message = (Map<String, Object>) choice.get("message");
            String content = (String) message.get("content");

            return objectMapper.readValue(content, RecipeSearchFields.class);
        } catch (Exception e) {
            throw new RuntimeException("❌ Failed to parse OpenAI response", e);
        }
    }
}

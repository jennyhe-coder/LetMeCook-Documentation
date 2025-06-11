package com.server.letMeCook.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.server.letMeCook.dto.recipe.RecipeSearchFields;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;

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
        System.out.println("Extracting recipe search fields from prompt: " + prompt);
        // Normalize the prompt to remove unnecessary phrases
        prompt = normalizePromptForSearch(prompt);

        String instruction = String.format("""
    Based on the following user prompt, extract and return a valid JSON object with the following fields:
    
    - keyword: A short and clean phrase that represents the **dish name only**.
      - ⚠️ Remove any generic or instructional phrases such as: "I want", "Let me", "Give me", "Show me", "Find", "Get me", "Can you", "How to make", etc.
      - ⚠️ Also remove any words already used in cuisines, ingredients, categories, or dietary preferences.
      - ✅ Example:
        Prompt: "I want a spicy Vietnamese soup with noodles."
        Keyword: "Noodle Soup"
    
    - cuisines: Include only if explicitly mentioned in the prompt. Choose only from the following list: [%s]

    - ingredients: Extract up to 5 main ingredients that are clearly stated or strongly implied.

    - allergies: Include only if clearly mentioned in the prompt.

    - categories: Include only if mentioned. Choose only from the following list: [%s]. Match exact or closely similar names based on the prompt.

    - dietaryPreferences: Include only if mentioned. Choose only from the following list: [%s]. Match exact or closely similar names based on the prompt.

    Only include values that are explicitly present in the user prompt.
    Return only a valid raw JSON object. Do not include any markdown, explanation, or extra text.

    Prompt: %s
    """,
                String.join(", ", cuisineNames),
                String.join(", ", categoryNames),
                String.join(", ", dietNames),
                prompt.toLowerCase()
        );







        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4.1",
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

        return parseResponse(response.getBody());
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

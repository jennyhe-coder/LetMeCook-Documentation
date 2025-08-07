package com.server.letMeCook.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.server.letMeCook.dto.recipe.RecipeSearchFields;
import com.server.letMeCook.service.OpenAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

@Controller
@RequestMapping("/api/opencv/")
class OpenAIController {
    private final OpenAIService openAIService;

    @Autowired
    public OpenAIController(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }


    @PostMapping("/extract_image_ingredients")
    public ResponseEntity<Map<String, Object>> extractIngredients(@RequestBody Map<String, String> body) {
        String imageBase64 = body.get("imageBase64");

        return ResponseEntity.ok(Map.of(
                "ingredients", openAIService.detectIngredientsFromImage(imageBase64)
        ));
    }
    @PostMapping("/extract_search_fields")
    public ResponseEntity<RecipeSearchFields> extractFieldsFromPrompt(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");

        if (prompt == null || prompt.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            RecipeSearchFields fields = openAIService.extractRecipeSearchFields(prompt);
            System.out.println("✅ [DEBUG] Extracted fields: " + fields);
            return ResponseEntity.ok(fields);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

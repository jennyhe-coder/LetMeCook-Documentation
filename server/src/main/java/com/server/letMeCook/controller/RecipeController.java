package com.server.letMeCook.controller;


import com.server.letMeCook.dto.recipe.RecipeCardDTO;
import com.server.letMeCook.dto.recipe.RecipeDTO;
import com.server.letMeCook.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService recipeService;

    @Autowired
    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @GetMapping
    public List<RecipeDTO> getAllRecipes(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        return recipeService.getAllRecipeDTOs(pageable);
    }

    @GetMapping("/{id}")
    public RecipeDTO getRecipeById(@PathVariable UUID id) {
        return recipeService.getRecipeById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recipe not found with ID: " + id));
    }




    @GetMapping("/search")
    public List<RecipeCardDTO> advancedSearch(
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size,
            @RequestParam(required = false) List<String> cuisines,
            @RequestParam(required = false) List<String> ingredients,
            @RequestParam(required = false) List<String> allergies,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) List<String> dietaryPreferences,

            @RequestParam(required = false, defaultValue = "true") Boolean isPublic
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return recipeService.advancedSearch(keyword, cuisines, ingredients, allergies,categories, dietaryPreferences,  isPublic, pageable);
    }

}

package com.server.letMeCook.controller;

import com.server.letMeCook.dto.recipe.RecipeCardDTO;
import com.server.letMeCook.dto.recipe.RecipeDTO;
import com.server.letMeCook.model.Recipe;
import com.server.letMeCook.repository.RecipeRepository;
import com.server.letMeCook.service.RecipeService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {
    @Autowired
    private RecipeService recipeService;


    @GetMapping(value = {"","/"})
    public List<RecipeDTO> getAllRecipes(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size){
        return recipeService.getAllRecipeDTOs(page, size);
    }

    @GetMapping("/{id}")
    public RecipeDTO getRecipeById(@PathVariable String id) {
        UUID uuid = UUID.fromString(id);
        RecipeDTO recipeDto = recipeService.getRecipeById(uuid);

        return recipeDto;
    }


    @GetMapping("/search")
    public List<RecipeCardDTO> advancedSearch(
            @RequestParam String keyword,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) List<String> cuisines,
            @RequestParam(required = false) List<String> ingredients,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) List<String> dietaryPreferences,
            @RequestParam(required = false, defaultValue = "true") Boolean isPublic
    ) {
        Integer defaultPage = page != null ? page : 0;
        Integer defaultSize = size != null ? size : 20;
        Pageable pageable = Pageable.ofSize(defaultSize).withPage(defaultPage);
        return recipeService.advancedSearch(keyword, cuisines, ingredients, categories, dietaryPreferences, isPublic, pageable);
    }




}

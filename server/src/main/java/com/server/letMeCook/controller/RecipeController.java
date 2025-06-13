package com.server.letMeCook.controller;


import com.auth0.jwt.JWT;
import com.server.letMeCook.dto.recipe.RecipeCardDTO;
import com.server.letMeCook.dto.recipe.RecipeDTO;
import com.server.letMeCook.dto.recipe.RecipeSearchFields;
import com.server.letMeCook.model.DietaryPreference;
import com.server.letMeCook.service.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService recipeService;
    private final OpenAIService openAIService;

    @Autowired
    public RecipeController(RecipeService recipeService, OpenAIService openAIService) {
        this.recipeService = recipeService;
        this.openAIService = openAIService;
    }


    @GetMapping
    public Page<RecipeDTO> getAllRecipes(
            @PageableDefault(size = 20, page = 0, sort = "title", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        // Map lowercase sort keys → actual entity field names
        Map<String, String> allowedSortFieldMap = Map.of(
                "title", "title",
                "createdat", "createdAt",
                "viewcount", "viewCount",
                "cooktime", "cookTime"
        );

        List<Sort.Order> sanitizedOrders = new ArrayList<>();

        for (Sort.Order order : pageable.getSort()) {
            String requestedField = order.getProperty().toLowerCase();

            if (!allowedSortFieldMap.containsKey(requestedField)) {
                throw new IllegalArgumentException("Invalid sort field: " + order.getProperty());
            }

            String actualField = allowedSortFieldMap.get(requestedField);
            sanitizedOrders.add(new Sort.Order(order.getDirection(), actualField));
        }

        Pageable sanitizedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(sanitizedOrders)
        );

        return recipeService.getAllRecipeDTOs(sanitizedPageable);
    }


    @GetMapping("/{id}")
    public RecipeDTO getRecipeById(@PathVariable UUID id) {
        return recipeService.getRecipeById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recipe not found with ID: " + id));
    }



    private Set<String> mergeSet(Set<String> original, Set<String> aiSuggested) {
        Set<String> result = new HashSet<>();
        if (original != null) result.addAll(original);
        if (aiSuggested != null) result.addAll(aiSuggested);
        return result.isEmpty() ? null : result;
    }
    @GetMapping("/search")
    public List<RecipeCardDTO> advancedSearch(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Set<String> cuisines,
            @RequestParam(required = false) Set<String> ingredients,
            @RequestParam(required = false) Set<String> allergies,
            @RequestParam(required = false) Set<String> categories,
            @RequestParam(required = false) Set<String> dietaryPreferences,
            @RequestParam(required = false, defaultValue = "true") Boolean isPublic,
            @PageableDefault(size = 20, page = 0, sort = "title", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        if (keyword!=null && keyword.length()>20) {
            RecipeSearchFields fields = openAIService.extractRecipeSearchFields(keyword);
            keyword = fields.getKeyword();
            cuisines = mergeSet(cuisines, fields.getCuisines());
            ingredients = mergeSet(ingredients, fields.getIngredients());
            allergies = mergeSet(allergies, fields.getAllergies());
            categories = mergeSet(categories, fields.getCategories());
            dietaryPreferences = mergeSet(dietaryPreferences, fields.getDietaryPreferences());
        }

        //print the search parameters for debugging
        System.out.println("Advanced Search Parameters:");
        System.out.println("Keyword: " + keyword);
        System.out.println("Cuisines: " + (cuisines != null ? String.join(", ", cuisines) : "null"));
        System.out.println("Ingredients: " + (ingredients != null ? String.join(", ", ingredients) : "null"));
        System.out.println("Allergies: " + (allergies != null ? String.join(", ", allergies) : "null"));
        System.out.println("Categories: " + (categories != null ? String.join(", ", categories) : "null"));
        System.out.println("Dietary Preferences: " + (dietaryPreferences != null ? String.join(", ", dietaryPreferences) : "null"));
        System.out.println("Is Public: " + isPublic);

        return recipeService.advancedSearch(keyword, cuisines, ingredients, allergies,categories, dietaryPreferences, isPublic, pageable);
    }

    @GetMapping("/recommended")
    public List<RecipeCardDTO> recommended(@AuthenticationPrincipal JWT jwt,
                                           @RequestParam(required = false, defaultValue = "0") int page,
                                           @RequestParam(required = false, defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (jwt == null ) {
            return recipeService.getTopView(pageable);
        }
        else{
            return recipeService.getTopView(pageable);
        }

    }
}

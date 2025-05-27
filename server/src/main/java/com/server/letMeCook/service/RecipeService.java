package com.server.letMeCook.service;

import com.server.letMeCook.dto.recipe.RecipeCardDTO;
import com.server.letMeCook.dto.recipe.RecipeDTO;
import com.server.letMeCook.model.Recipe;
import com.server.letMeCook.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
@Service
public class RecipeService {
    @Autowired
    private RecipeRepository recipeRepository;


    public List<RecipeDTO> getAllRecipeDTOs() {
        return recipeRepository.findAllPublic().stream()
                .map(RecipeDTO::from)
                .collect(Collectors.toList());
    }

    public RecipeDTO getRecipeById(UUID id) {
        Recipe recipe = recipeRepository.findById(id).orElse(null);
        if (recipe != null) {
            return RecipeDTO.from(recipe);
        }
        return null;
    }

    public List<RecipeCardDTO> getAllRecipeCardDTOs() {
        return recipeRepository.findAll().stream()
                .map(RecipeCardDTO::from)
                .collect(Collectors.toList());
    }

    public List<RecipeCardDTO> searchRecipes(String keyword) {
        return recipeRepository.findByTitleOrAuthorPartNameContainsIgnoreCase(keyword).stream()
                .map(RecipeCardDTO::from)
                .collect(Collectors.toList());
    }
    public List<RecipeCardDTO> searchPublicRecipesByAuthorId(UUID id) {
        return recipeRepository.findByAuthorId(id).stream()
                .map(RecipeCardDTO::from)
                .collect(Collectors.toList());
    }


    public List<RecipeCardDTO> advancedSearch(String keyword, String cuisine, List<String> inputIngredients, List<String> inputCategories, String dietaryPreference, Boolean isPublic) {
//        System.out.println("isPublic = " + isPublic);
//        System.out.println("keyword = " + keyword);
//        System.out.println("cuisine = " + cuisine);
//        System.out.println("ingredients = " + ingredients);
//        System.out.println("categories = " + categories);
//        System.out.println("dietaryPreference = " + dietaryPreference);
        var categories = (inputCategories == null || inputCategories.isEmpty()) ? null : inputCategories;
        var ingredients = (inputIngredients == null || inputIngredients.isEmpty()) ? null : inputIngredients;


        return recipeRepository.advancedSearch(keyword, cuisine, ingredients, categories, dietaryPreference, isPublic).stream()
                .map(RecipeCardDTO::from)
                .collect(Collectors.toList());
    }
}

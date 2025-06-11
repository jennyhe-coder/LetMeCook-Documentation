package com.server.letMeCook.mapper;

import com.server.letMeCook.dto.recipe.RecipeCardDTO;
import com.server.letMeCook.dto.recipe.RecipeDTO;
import com.server.letMeCook.dto.recipe.RecipeIngredientDTO;
import com.server.letMeCook.model.*;

import java.util.List;
import java.util.stream.Collectors;

public class RecipeMapper {

    public static RecipeDTO toDTO(Recipe recipe) {
        RecipeDTO dto = new RecipeDTO();
        dto.setId(recipe.getId());
        dto.setTitle(recipe.getTitle());
        dto.setDescription(recipe.getDescription());
        dto.setServings(recipe.getServings());
        dto.setImageUrl(recipe.getImageUrl());
        dto.setPublic(recipe.isPublic());
        dto.setAuthorName(recipe.getAuthor() != null
                ? recipe.getAuthor().getFirstName() + " " + recipe.getAuthor().getLastName()
                : "Unknown");
        dto.setCreatedAt(recipe.getCreatedAt());
        dto.setDirections(recipe.getDirections());
        dto.setCookingTime(recipe.getTime());

        dto.setCategories(recipe.getCategories().stream()
                .map(Category::getName)
                .collect(Collectors.toList()));

        dto.setDietaryPreferences(recipe.getDietaryPreferences().stream()
                .map(DietaryPreference::getName)
                .collect(Collectors.toList()));

        dto.setCuisines(recipe.getCuisines().stream()
                .map(Cuisine::getName)
                .collect(Collectors.toList()));

        dto.setIngredients(recipe.getRecipeIngredients().stream()
                .map(RecipeIngredientDTO::new)
                .collect(Collectors.toList()));

        return dto;
    }

    public static RecipeCardDTO toCardDTO(Recipe recipe) {
        RecipeCardDTO dto = new RecipeCardDTO();
        dto.setId(recipe.getId());
        dto.setTitle(recipe.getTitle());
        dto.setDescription(recipe.getDescription());
        dto.setServings(recipe.getServings());
        dto.setImageUrl(recipe.getImageUrl());
        dto.setCookingTime(recipe.getTime());
        dto.setAuthorName(recipe.getAuthor() != null
                ? recipe.getAuthor().getFirstName() + " " + recipe.getAuthor().getLastName()
                : "Unknown");
        return dto;
    }
}

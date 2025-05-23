package com.server.letMeCook.dto.recipe;

import com.server.letMeCook.model.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Getter @Setter
public class RecipeDTO {

    private UUID id;
    private String title;
    private String description;
    private float servings;
    private String imageUrl;
    private boolean isPublic;
    private String authorName;
    private LocalDateTime createdAt;
    private String directions;
    private int cookingTime;
    private List<String> categories;
    private List<String> dietaryPreferences;
    private List<String> cuisines;
    private List<RecipeIngredientDTO> ingredients;





    public static RecipeDTO from(Recipe recipe) {
        RecipeDTO recipeDTO = new RecipeDTO();
        recipeDTO.setId(recipe.getId());
        recipeDTO.setTitle(recipe.getTitle());
        recipeDTO.setDescription(recipe.getDescription());
        recipeDTO.setServings(recipe.getServings());
        recipeDTO.setImageUrl(recipe.getImageUrl());
        recipeDTO.setPublic(recipe.isPublic());
        recipeDTO.setAuthorName(recipe.getAuthor() != null ? recipe.getAuthor().getFirstName() + " " + recipe.getAuthor().getLastName() : "Unknown");
        recipeDTO.setCreatedAt(recipe.getCreatedAt());
        recipeDTO.setDirections(recipe.getDirections());
        recipeDTO.setCookingTime(recipe.getTime());
        recipeDTO.setCategories(
                recipe.getCategories()
                        .stream()
                        .map(Category::getName)
                        .collect(Collectors.toList())
        );
        recipeDTO.setDietaryPreferences(
                recipe.getDietaryPreferences()
                        .stream()
                        .map(DietaryPreference::getName)
                        .collect(Collectors.toList())
        );
        recipeDTO.setCuisines(
                recipe.getCuisines()
                        .stream()
                        .map(Cuisine::getName)
                        .collect(Collectors.toList())
        );
        recipeDTO.setIngredients(
                recipe.getRecipeIngredients()
                        .stream()
                        .map(RecipeIngredientDTO::new)
                        .collect(Collectors.toList())
        );
        return recipeDTO;
    }
}

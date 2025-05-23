package com.server.letMeCook.dto.recipe;

import com.server.letMeCook.model.Recipe;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;
import org.jsoup.Jsoup;


@Getter @Setter
public class RecipeCardDTO {

    private UUID id;
    private String title;
    private String description;
    private String authorName;
    private float servings;
    private String imageUrl;
    private int cookingTime;
    private int stepCount;

    public static RecipeCardDTO from(Recipe recipe) {
        RecipeCardDTO recipeCardDTO = new RecipeCardDTO();
        recipeCardDTO.setId(recipe.getId());
        recipeCardDTO.setTitle(recipe.getTitle());
        recipeCardDTO.setDescription(recipe.getDescription());
        recipeCardDTO.setServings(recipe.getServings());
        recipeCardDTO.setImageUrl(recipe.getImageUrl());
        recipeCardDTO.setCookingTime(recipe.getTime());
        recipeCardDTO.setAuthorName(recipe.getAuthor() != null ? recipe.getAuthor().getFirstName() + " " + recipe.getAuthor().getLastName() : "Unknown");
        int stepCount = Jsoup.parse(recipe.getDirections()).select("ol > li").size();
        recipeCardDTO.setStepCount(stepCount);
        return recipeCardDTO;
    }
}

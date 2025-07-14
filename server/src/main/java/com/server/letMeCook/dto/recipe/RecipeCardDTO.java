package com.server.letMeCook.dto.recipe;

import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecipeCardDTO {

    private UUID id;
    private String title;
    private String description;
    private String authorName;
    private float servings;
    private String imageUrl;
    private int cookingTime;

}
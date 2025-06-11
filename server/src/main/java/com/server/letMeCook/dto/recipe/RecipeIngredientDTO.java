package com.server.letMeCook.dto.recipe;

import com.server.letMeCook.model.RecipeIngredient;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecipeIngredientDTO {

    private String ingredientName;
    private String quantity;
    private String unit;

    public RecipeIngredientDTO(RecipeIngredient recipeIngredient) {
        this.ingredientName = recipeIngredient.getIngredient() != null
                ? recipeIngredient.getIngredient().getName()
                : "Unknown";
        this.quantity = recipeIngredient.getQuantity();
        this.unit = recipeIngredient.getUnit();
    }
}

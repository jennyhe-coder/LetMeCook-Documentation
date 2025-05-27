package com.server.letMeCook.dto.ingredient;

import com.server.letMeCook.model.Ingredient;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter @Setter
public class IngredientDTO {
    private UUID id;
    private String name;

    public static IngredientDTO from(Ingredient ingredient) {
        IngredientDTO ingredientDTO = new IngredientDTO();
        ingredientDTO.setId(ingredient.getId());
        ingredientDTO.setName(ingredient.getName());
        return ingredientDTO;
    }

}

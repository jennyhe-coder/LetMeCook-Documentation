package com.server.letMeCook.dto.recipe;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter @Setter
public class RecipeSearchFields {
    private String keyword;
    private Set<String> cuisines;
    private Set<String> ingredients;
    private Set<String> allergies;
    private Set<String> categories;
    private Set<String> dietaryPreferences;

}

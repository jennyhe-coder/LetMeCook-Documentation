package com.example.letmecook.controller;

import com.example.letmecook.dto.recipe.RecipeCardDTO;
import com.example.letmecook.dto.recipe.RecipeDTO;
import com.example.letmecook.model.Recipe;
import com.example.letmecook.repository.RecipeRepository;
import com.example.letmecook.service.RecipeService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {
    @Autowired
    private RecipeService recipeService;
    @Autowired
    private RecipeRepository recipeRepository;

    @GetMapping(value = {"","/"})
    public List<RecipeDTO> getAllRecipes() {
        return recipeService.getAllRecipeDTOs();
    }

    @GetMapping("/{id}")
    public RecipeDTO getRecipeById(@PathVariable String id) {
        UUID uuid = UUID.fromString(id);
        Recipe recipe = recipeRepository.findById(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Recipe not found with id: " + id));

        return RecipeDTO.from(recipe);
    }



    @GetMapping("/search")
    public List<RecipeCardDTO> searchRecipes(String keyword) {
        return recipeService.searchRecipes(keyword);
    }
}

package com.server.letMeCook.controller;

import com.server.letMeCook.dto.recipe.RecipeCardDTO;
import com.server.letMeCook.dto.recipe.RecipeDTO;
import com.server.letMeCook.model.Recipe;
import com.server.letMeCook.repository.RecipeRepository;
import com.server.letMeCook.service.RecipeService;
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


    @GetMapping(value = {"","/"})
    public List<RecipeDTO> getAllRecipes(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size){
        return recipeService.getAllRecipeDTOs(page, size);
    }

    @GetMapping("/{id}")
    public RecipeDTO getRecipeById(@PathVariable String id) {
        UUID uuid = UUID.fromString(id);
        RecipeDTO recipeDto = recipeService.getRecipeById(uuid);

        return recipeDto;
    }


    @GetMapping("search")
    public List<RecipeCardDTO> searchRecipes(
            @RequestParam String keyword,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String cuisine,
            @RequestParam(required = false) List<String> ingredients,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) String dietaryPreference,
            @RequestParam(required = false, defaultValue = "true") Boolean isPublic,
            @RequestParam(required = false) Integer pageNumber,
            @RequestParam(required = false) Integer pageSize
                                             ) {

        return recipeService.searchRecipes(keyword);
    }


//    @GetMapping("/search/")
//    public List<RecipeCardDTO> advanceSearch(
//            @RequestParam(required = false, defaultValue = "") String keyword,
//            @RequestParam(required = false, defaultValue = "") String cuisine,
//            @RequestParam(required = false) List<String> ingredients,
//            @RequestParam(required = false) List<String> categories,
//            @RequestParam(required = false, defaultValue = "") String dietaryPreference,
//            @RequestParam(required = false, defaultValue = "true") Boolean isPublic
//    ) {
//        return recipeService.advancedSearch(keyword, cuisine, ingredients, categories, dietaryPreference, isPublic);
//    }


}

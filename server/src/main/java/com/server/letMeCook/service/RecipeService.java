package com.server.letMeCook.service;

import com.server.letMeCook.dto.recipe.RecipeCardDTO;
import com.server.letMeCook.dto.recipe.RecipeDTO;
import com.server.letMeCook.model.Recipe;
import com.server.letMeCook.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
@Service
public class RecipeService {
    @Autowired
    private RecipeRepository recipeRepository;


    public List<RecipeDTO> getAllRecipeDTOs(Integer page, Integer size) {
        if (page != null && size != null) {
            Pageable pageable = PageRequest.of(page, size);
            return recipeRepository.findAllPublic(pageable).stream()
                    .map(RecipeDTO::from)
                    .collect(Collectors.toList());
        } else {
            return recipeRepository.findAllPublic().stream()
                    .map(RecipeDTO::from)
                    .collect(Collectors.toList());
        }
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


}

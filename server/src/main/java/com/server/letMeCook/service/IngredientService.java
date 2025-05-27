package com.server.letMeCook.service;

import com.server.letMeCook.dto.ingredient.IngredientDTO;
import com.server.letMeCook.model.Ingredient;
import com.server.letMeCook.repository.IngredientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IngredientService {
    @Autowired
    private IngredientRepository ingredientRepository;

    // Get all ingredients
    public List<IngredientDTO> getAllIngredients() {
        return ingredientRepository.findAll().stream().map(IngredientDTO::from).collect(Collectors.toList());
    }
}

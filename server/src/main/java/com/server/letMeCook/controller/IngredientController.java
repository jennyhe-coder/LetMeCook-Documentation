package com.server.letMeCook.controller;

import com.server.letMeCook.service.IngredientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/ingredients")
@RestController
class IngredientController {
    @Autowired
    private IngredientService ingredientService;

    @GetMapping(value = {"", "/"})
    public Object getAllIngredients() {
        return ingredientService.getAllIngredients();
    }

}

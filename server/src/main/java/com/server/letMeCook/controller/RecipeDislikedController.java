package com.server.letMeCook.controller;

import com.server.letMeCook.service.RecipeDislikedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/dislikes")
@RequiredArgsConstructor
public class RecipeDislikedController {

    private final RecipeDislikedService service;

    @PostMapping
    public ResponseEntity<String> dislikeRecipe(
            @RequestParam UUID userId,
            @RequestParam UUID recipeId
    ) {
        service.addDislike(userId, recipeId);
        return ResponseEntity.ok("Disliked successfully.");
    }
}

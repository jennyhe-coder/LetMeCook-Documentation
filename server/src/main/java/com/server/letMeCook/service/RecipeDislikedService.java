package com.server.letMeCook.service;

import com.server.letMeCook.model.RecipeDisliked;
import com.server.letMeCook.repository.RecipeDislikedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.springframework.http.HttpStatus.CONFLICT;

@Service
@RequiredArgsConstructor
public class RecipeDislikedService {

    private final RecipeDislikedRepository repository;

    public void addDislike(UUID userId, UUID recipeId) {
        // Check if already disliked
        boolean alreadyDisliked = repository.findDislikedRecipeIdsByUserId(userId)
                .contains(recipeId);

        if (alreadyDisliked) {
            throw new ResponseStatusException(CONFLICT, "User already disliked this recipe.");
        }

        RecipeDisliked dislike = new RecipeDisliked();
        dislike.setUserId(userId);
        dislike.setRecipeId(recipeId);

        repository.save(dislike);
    }
}
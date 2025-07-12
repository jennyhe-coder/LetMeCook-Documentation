package com.server.letMeCook.service;

import com.server.letMeCook.dto.recipe.RecipeCardDTO;
import com.server.letMeCook.mapper.RecipeMapper;
import com.server.letMeCook.repository.RecipeBrowsingHistoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
@Service
public class RecipeBrowsingHistoryService {

    private final RecipeBrowsingHistoryRepository recipeBrowsingHistoryRepository;

    public RecipeBrowsingHistoryService(RecipeBrowsingHistoryRepository recipeBrowsingHistoryRepository) {
        this.recipeBrowsingHistoryRepository = recipeBrowsingHistoryRepository;
    }

    public Page<RecipeCardDTO> getRecentlyViewedRecipeCards(UUID userId, Pageable pageable) {
        return recipeBrowsingHistoryRepository
                .findByUserIdOrderByViewedAtDesc(userId, pageable)
                .map(history -> RecipeMapper.toCardDTO(history.getRecipe()));
    }
}

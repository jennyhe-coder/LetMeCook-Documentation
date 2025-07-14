package com.server.letMeCook.controller;

import com.server.letMeCook.dto.recipe.RecipeCardDTO;
import com.server.letMeCook.service.RecipeBrowsingHistoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.SortDefault;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.io.Console;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recently-viewed")
public class RecipeBrowsingHistoryController {

    private final RecipeBrowsingHistoryService browsingHistoryService;

    public RecipeBrowsingHistoryController(RecipeBrowsingHistoryService browsingHistoryService) {
        this.browsingHistoryService = browsingHistoryService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Page<RecipeCardDTO>> getRecentlyViewed(
            @PathVariable UUID userId,
            @PageableDefault(size = 10)
            @SortDefault.SortDefaults({
                    @SortDefault(sort = "viewedAt", direction = Sort.Direction.DESC)
            }) Pageable pageable
    ) {

        Page<RecipeCardDTO> recipes = browsingHistoryService.getRecentlyViewedRecipeCards(userId, pageable);
        return ResponseEntity.ok(recipes);
    }
}

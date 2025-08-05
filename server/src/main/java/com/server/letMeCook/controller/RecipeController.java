package com.server.letMeCook.controller;


import com.server.letMeCook.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.oauth2.jwt.Jwt;
import com.server.letMeCook.dto.recipe.RecipeCardDTO;
import com.server.letMeCook.dto.recipe.RecipeDTO;
import com.server.letMeCook.dto.recipe.RecipeSearchFields;
import com.server.letMeCook.model.DietaryPreference;
import com.server.letMeCook.model.User;
import com.server.letMeCook.service.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;


import java.util.*;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService recipeService;
    private final OpenAIService openAIService;
    @Autowired
    private UserRepository userRepository;
    @Value("${recommendation.url}")
    private String recommendationUrl;
    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    public RecipeController(RecipeService recipeService, OpenAIService openAIService) {
        this.recipeService = recipeService;
        this.openAIService = openAIService;
    }
    @GetMapping("/all")
    public List<RecipeDTO> getAllRecipes() {
        return recipeService.getAllRecipesWithFullRelations();
    }



    @GetMapping
    public Page<RecipeDTO> getAllRecipes(
            @PageableDefault(size = 20, page = 0, sort = "title", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        // Map lowercase sort keys → actual entity field names
        Map<String, String> allowedSortFieldMap = Map.of(
                "title", "title",
                "createdat", "createdAt",
                "viewcount", "viewCount",
                "cooktime", "cookTime"
        );

        List<Sort.Order> sanitizedOrders = new ArrayList<>();

        for (Sort.Order order : pageable.getSort()) {
            String requestedField = order.getProperty().toLowerCase();

            if (!allowedSortFieldMap.containsKey(requestedField)) {
                throw new IllegalArgumentException("Invalid sort field: " + order.getProperty());
            }

            String actualField = allowedSortFieldMap.get(requestedField);
            sanitizedOrders.add(new Sort.Order(order.getDirection(), actualField));
        }

        Pageable sanitizedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(sanitizedOrders)
        );

        return recipeService.getAllRecipeDTOs(sanitizedPageable);
    }


    @GetMapping("/{id}")
    public RecipeDTO getRecipeById(@PathVariable UUID id) {
        return recipeService.getRecipeById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recipe not found with ID: " + id));
    }


    private Set<String> mergeSet(Set<String> original, Set<String> aiSuggested) {
        Set<String> result = new HashSet<>();
        if (original != null) result.addAll(original);
        if (aiSuggested != null) result.addAll(aiSuggested);
        return result.isEmpty() ? null : result;
    }



    @GetMapping("/search")
    public Page<RecipeCardDTO> advancedSearch(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Set<String> cuisines,
            @RequestParam(required = false) Set<String> ingredients,
            @RequestParam(required = false) Set<String> allergies,
            @RequestParam(required = false) Set<String> categories,
            @RequestParam(required = false) Set<String> dietaryPreferences,
            @RequestParam(defaultValue = "true") boolean isPublic,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "title,asc") String[] sort,
            @RequestParam(required = false) String imageBase64
    ) {
        // Sort mapping
        Map<String, String> allowedSortFields = Map.of(
                "title", "title",
                "cooktime", "time",
                "viewcount", "viewCount",
                "createdat", "createdAt"
        );

        Sort sortObj = Sort.by(Arrays.stream(sort).map(s -> {
            String[] parts = s.split(",");
            String field = parts[0].toLowerCase();
            Sort.Direction direction = (parts.length > 1 && parts[1].equalsIgnoreCase("desc")) ? Sort.Direction.DESC : Sort.Direction.ASC;
            if (!allowedSortFields.containsKey(field)) {
                throw new IllegalArgumentException("Invalid sort field: " + field);
            }
            return new Sort.Order(direction, allowedSortFields.get(field));
        }).toList());

        Pageable pageable = PageRequest.of(page, size, sortObj);

        // Extract fields via OpenAI if keyword/image provided
        if ((keyword != null && keyword.length() > 10) || imageBase64 != null) {
            RecipeSearchFields fields = openAIService.extractRecipeSearchFields(keyword, imageBase64);
            keyword = fields.getKeyword();
            cuisines = mergeSet(cuisines, fields.getCuisines());
            ingredients = mergeSet(ingredients, fields.getIngredients());
            allergies = mergeSet(allergies, fields.getAllergies());
            categories = mergeSet(categories, fields.getCategories());
            dietaryPreferences = mergeSet(dietaryPreferences, fields.getDietaryPreferences());
        }

        return recipeService.advancedSearch(keyword, cuisines, ingredients, allergies, categories, dietaryPreferences, isPublic, pageable);
    }

    @GetMapping("/recommend")
    public ResponseEntity<?> recommend(
            @RequestParam(required = false, name = "recipeid") UUID recipeId,
            @RequestParam(required = false, name = "userid") UUID userId) {
        if (recipeId != null) {
            Page<RecipeCardDTO> list = recipeService.recommendedByRecipeId(recipeId);
            return ResponseEntity.ok(list);
        }

        if (userId != null) {
            Page<RecipeCardDTO> page = recipeService.recommendedByUserId(userId);
            return ResponseEntity.ok(page);
        }

        return ResponseEntity.badRequest().body("");
    }

    @GetMapping("/flask-update-embed")
    public ResponseEntity<?> updateEmbedFromFlask() {
        String flaskUrl = recommendationUrl + "/update/embed";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(flaskUrl, HttpMethod.POST, entity, String.class);
            return ResponseEntity.ok("Flask update/embed triggered successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error connecting to Flask: " + e.getMessage());
        }
    }
}

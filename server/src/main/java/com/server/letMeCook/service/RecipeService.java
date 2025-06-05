package com.server.letMeCook.service;

import com.server.letMeCook.dto.recipe.RecipeCardDTO;
import com.server.letMeCook.dto.recipe.RecipeDTO;
import com.server.letMeCook.model.*;
import com.server.letMeCook.repository.RecipeRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
@Service
public class RecipeService {
    @Autowired
    private RecipeRepository recipeRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public List<RecipeCardDTO> getAllRecipeCardDTOs() {
        return recipeRepository.findAll().stream()
                .map(RecipeCardDTO::from)
                .collect(Collectors.toList());
    }

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

    public List<RecipeCardDTO> advancedSearch(
            String keyword,
            List<String> cuisines,
            List<String> ingredients,
            List<String> categories,
            List<String> dietaryPreferences,
            Boolean isPublic,
            Pageable pageable) {


        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Recipe> query = cb.createQuery(Recipe.class);
        Root<Recipe> recipe = query.from(Recipe.class);
        List<Predicate> predicates = new ArrayList<>();

        // --- Join ---
        Join<Recipe, User> authorJoin = recipe.join("author", JoinType.LEFT);
        Join<Recipe, Cuisine> cuisineJoin = recipe.join("cuisines", JoinType.LEFT);
        Join<Recipe, Category> categoryJoin = recipe.join("categories", JoinType.LEFT);
        Join<Recipe, RecipeIngredient> riJoin = recipe.join("recipeIngredients", JoinType.LEFT);
        Join<RecipeIngredient, Ingredient> ingredientJoin = riJoin.join("ingredient", JoinType.LEFT);
        Join<Recipe, DietaryPreference> dpJoin = recipe.join("dietaryPreferences", JoinType.LEFT);


        // --- Keyword Search ---
        if (keyword != null && !keyword.isBlank()) {
            String likePattern = "%" + keyword.toLowerCase() + "%";
            Predicate titleMatch = cb.like(cb.lower(recipe.get("title")), likePattern);
            Predicate authorMatch = cb.like(cb.lower(cb.concat(authorJoin.get("firstName"), cb.concat(" ", authorJoin.get("lastName")))), likePattern);
            predicates.add(cb.or(titleMatch, authorMatch));
        }

        // --- isPublic ---
        if (isPublic != null) {
            predicates.add(cb.equal(recipe.get("isPublic"), isPublic));
        }

        // --- HAVING group conditions ---
        List<Predicate> havingPredicates = new ArrayList<>();
        boolean hasGroupBy = false;

        // --- Cuisines ---
        if (cuisines != null && !cuisines.isEmpty()) {
            predicates.add(cb.lower(cuisineJoin.get("name")).in(cuisines.stream().map(String::toLowerCase).toList()));
            havingPredicates.add(cb.equal(cb.countDistinct(cuisineJoin.get("name")), (long) cuisines.size()));
            hasGroupBy = true;
        }

        // --- Ingredients ---
        if (ingredients != null && !ingredients.isEmpty()) {
            predicates.add(cb.lower(ingredientJoin.get("name")).in(ingredients.stream().map(String::toLowerCase).toList()));
            havingPredicates.add(cb.equal(cb.countDistinct(ingredientJoin.get("name")), (long) ingredients.size()));
            hasGroupBy = true;
        }

        // --- Categories ---
        if (categories != null && !categories.isEmpty()) {
            predicates.add(cb.lower(categoryJoin.get("name")).in(categories.stream().map(String::toLowerCase).toList()));
            havingPredicates.add(cb.equal(cb.countDistinct(categoryJoin.get("name")), (long) categories.size()));
            hasGroupBy = true;
        }

        // --- Dietary Preferences ---
        if (dietaryPreferences != null && !dietaryPreferences.isEmpty()) {
            predicates.add(cb.lower(dpJoin.get("name")).in(dietaryPreferences.stream().map(String::toLowerCase).toList()));
            havingPredicates.add(cb.equal(cb.countDistinct(dpJoin.get("name")), (long) dietaryPreferences.size()));
            hasGroupBy = true;
        }

        // --- Apply WHERE + GROUP BY + HAVING ---
        query.select(recipe).where(predicates.toArray(new Predicate[0])).distinct(true);

        if (hasGroupBy) {
            query.groupBy(recipe.get("id"));
            if (!havingPredicates.isEmpty()) {
                query.having(cb.and(havingPredicates.toArray(new Predicate[0])));
            }
        }

        // --- Build Query ---
        query.select(recipe).where(cb.and(predicates.toArray(new Predicate[0]))).distinct(true);
        if (hasGroupBy) {
            query.groupBy(recipe.get("id"));
            if (!havingPredicates.isEmpty()) {
                query.having(cb.and(havingPredicates.toArray(new Predicate[0])));
            }
        }

        // --- Execute query ---
        TypedQuery<Recipe> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<Recipe> results = typedQuery.getResultList();


        return results.stream()
                .map(RecipeCardDTO::from)
                .collect(Collectors.toList());

    }


}

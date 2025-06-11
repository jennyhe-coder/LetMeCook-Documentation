package com.server.letMeCook.service;

import com.server.letMeCook.dto.recipe.RecipeCardDTO;
import com.server.letMeCook.dto.recipe.RecipeDTO;
import com.server.letMeCook.mapper.RecipeMapper;
import com.server.letMeCook.model.*;
import com.server.letMeCook.repository.RecipeRepository;
import jakarta.persistence.*;
import jakarta.persistence.criteria.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;


@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;

    @Autowired
    public RecipeService(RecipeRepository recipeRepository) {
        this.recipeRepository = recipeRepository;
    }


    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<RecipeDTO> getAllRecipeDTOs(Pageable pageable) {
        return recipeRepository.findAllPublic(pageable).stream()
                .map(RecipeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<RecipeDTO> getRecipeById(UUID id) {
        return recipeRepository.findById(id)
                .map(RecipeMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public List<RecipeCardDTO> searchRecipes(String keyword) {
        return recipeRepository.findByTitleOrAuthorPartNameContainsIgnoreCase(keyword).stream()
                .map(RecipeMapper::toCardDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RecipeCardDTO> searchPublicRecipesByAuthorId(UUID authorId) {
        return recipeRepository.findByAuthorId(authorId).stream()
                .map(RecipeMapper::toCardDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RecipeCardDTO> advancedSearch(
            String keyword,
            List<String> cuisines,
            List<String> ingredients,
            List<String> allergies,
            List<String> categories,
            List<String> dietaryPreferences,
            boolean isPublic,
            Pageable pageable) {

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Recipe> query = cb.createQuery(Recipe.class);
        Root<Recipe> root = query.from(Recipe.class);

        Join<Recipe, User> authorJoin = root.join("author", JoinType.LEFT);
        Join<Recipe, Cuisine> cuisineJoin = root.join("cuisines", JoinType.LEFT);
        Join<Recipe, Category> categoryJoin = root.join("categories", JoinType.LEFT);
        Join<Recipe, RecipeIngredient> riJoin = root.join("recipeIngredients", JoinType.LEFT);
        Join<RecipeIngredient, Ingredient> ingredientJoin = riJoin.join("ingredient", JoinType.LEFT);
        Join<Recipe, DietaryPreference> dpJoin = root.join("dietaryPreferences", JoinType.LEFT);

        List<Predicate> predicates = new ArrayList<>();
        List<Predicate> havingPredicates = new ArrayList<>();
        boolean hasGroupBy = false;

        if (keyword != null && !keyword.isBlank()) {
            String pattern = "%" + keyword.toLowerCase() + "%";
            Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
            Predicate authorLike = cb.like(cb.lower(cb.concat(authorJoin.get("firstName"), cb.concat(" ", authorJoin.get("lastName")))), pattern);
            Predicate descriptionLike = cb.like(cb.lower(root.get("description")), pattern);
            predicates.add(cb.or(titleLike, authorLike, descriptionLike));
        }

        predicates.add(cb.equal(root.get("isPublic"), isPublic));

        if (cuisines != null && !cuisines.isEmpty()) {
            predicates.add(cb.lower(cuisineJoin.get("name")).in(cuisines.stream().map(String::toLowerCase).toList()));
            havingPredicates.add(cb.equal(cb.countDistinct(cuisineJoin.get("name")), (long) cuisines.size()));
            hasGroupBy = true;
        }

        if (ingredients != null && !ingredients.isEmpty()) {
            predicates.add(cb.lower(ingredientJoin.get("name")).in(ingredients.stream().map(String::toLowerCase).toList()));
            havingPredicates.add(cb.equal(cb.countDistinct(ingredientJoin.get("name")), (long) ingredients.size()));
            hasGroupBy = true;
        }

        if (categories != null && !categories.isEmpty()) {
            predicates.add(cb.lower(categoryJoin.get("name")).in(categories.stream().map(String::toLowerCase).toList()));
            havingPredicates.add(cb.equal(cb.countDistinct(categoryJoin.get("name")), (long) categories.size()));
            hasGroupBy = true;
        }

        if (dietaryPreferences != null && !dietaryPreferences.isEmpty()) {
            predicates.add(cb.lower(dpJoin.get("name")).in(dietaryPreferences.stream().map(String::toLowerCase).toList()));
            havingPredicates.add(cb.equal(cb.countDistinct(dpJoin.get("name")), (long) dietaryPreferences.size()));
            hasGroupBy = true;
        }

        if (allergies != null && !allergies.isEmpty()) {
            Expression<Long> allergenCount = cb.sum(
                    cb.<Long>selectCase()
                            .when(cb.lower(ingredientJoin.get("name")).in(allergies.stream().map(String::toLowerCase).toList()), 1L)
                            .otherwise(0L)
            );
            havingPredicates.add(cb.equal(allergenCount, 0L));
            hasGroupBy = true;
        }

        query.select(root).where(predicates.toArray(new Predicate[0])).distinct(true);

        if (hasGroupBy) {
            query.groupBy(root.get("id"));
            if (!havingPredicates.isEmpty()) {
                query.having(cb.and(havingPredicates.toArray(new Predicate[0])));
            }
        }

        TypedQuery<Recipe> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        return typedQuery.getResultList().stream()
                .map(RecipeMapper::toCardDTO)
                .collect(Collectors.toList());
    }
}
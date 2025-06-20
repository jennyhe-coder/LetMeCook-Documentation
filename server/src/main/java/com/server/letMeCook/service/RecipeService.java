package com.server.letMeCook.service;

import com.server.letMeCook.dto.recipe.RecipeCardDTO;
import com.server.letMeCook.dto.recipe.RecipeDTO;
import com.server.letMeCook.mapper.RecipeMapper;
import com.server.letMeCook.model.*;
import com.server.letMeCook.repository.RecipeRepository;
import jakarta.persistence.*;
import jakarta.persistence.criteria.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    public Page<RecipeDTO> getAllRecipeDTOs(Pageable pageable) {
        return recipeRepository.findAllPublic(pageable)
                .map(RecipeMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public Optional<RecipeDTO> getRecipeById(UUID id) {
        return recipeRepository.findById(id)
                .map(RecipeMapper::toDTO);
    }


    @Transactional(readOnly = true)
    public List<RecipeCardDTO> getTopView(Pageable pageable) {
        if (pageable == null) {
            pageable = Pageable.ofSize(20).withPage(0); // Default to first page with 20 items
        }

        return recipeRepository.findTopByViews(pageable).stream()
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
    public Page<RecipeCardDTO> advancedSearch(
            String keyword,
            Set<String> cuisines,
            Set<String> ingredients,
            Set<String> allergies,
            Set<String> categories,
            Set<String> dietaryPreferences,
            boolean isPublic,
            Pageable pageable) {

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Recipe> query = cb.createQuery(Recipe.class);
        Root<Recipe> root = query.from(Recipe.class);

        // Always join author for keyword search
        Join<Recipe, User> authorJoin = root.join("author", JoinType.LEFT);

        List<Predicate> predicates = new ArrayList<>();
        List<Predicate> havingPredicates = new ArrayList<>();
        boolean hasGroupBy = false;

        // Keyword search
        if (keyword != null && !keyword.isBlank()) {
            String pattern = "%" + keyword.toLowerCase() + "%";
            Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
            Predicate authorLike = cb.like(cb.lower(cb.concat(authorJoin.get("firstName"), cb.concat(" ", authorJoin.get("lastName")))), pattern);
            Predicate descriptionLike = cb.like(cb.lower(root.get("description")), pattern);
            predicates.add(cb.or(titleLike, authorLike, descriptionLike));
        }

        // Public filter
        predicates.add(cb.equal(root.get("isPublic"), isPublic));

        // Conditional joins
        Join<Recipe, Cuisine> cuisineJoin = null;
        if (cuisines != null && !cuisines.isEmpty()) {
            cuisineJoin = root.join("cuisines", JoinType.LEFT);
            predicates.add(cb.lower(cuisineJoin.get("name")).in(cuisines.stream().map(String::toLowerCase).toList()));
            havingPredicates.add(cb.equal(cb.countDistinct(cuisineJoin.get("name")), (long) cuisines.size()));
            hasGroupBy = true;
        }

        Join<Recipe, Category> categoryJoin = null;
        if (categories != null && !categories.isEmpty()) {
            categoryJoin = root.join("categories", JoinType.LEFT);
            predicates.add(cb.lower(categoryJoin.get("name")).in(categories.stream().map(String::toLowerCase).toList()));
            havingPredicates.add(cb.equal(cb.countDistinct(categoryJoin.get("name")), (long) categories.size()));
            hasGroupBy = true;
        }

        Join<Recipe, RecipeIngredient> riJoin = null;
        Join<RecipeIngredient, Ingredient> ingredientJoin = null;
        if ((ingredients != null && !ingredients.isEmpty()) || (allergies != null && !allergies.isEmpty())) {
            riJoin = root.join("recipeIngredients", JoinType.LEFT);
            ingredientJoin = riJoin.join("ingredient", JoinType.LEFT);
            if (ingredients != null && !ingredients.isEmpty()) {
                predicates.add(cb.lower(ingredientJoin.get("name")).in(ingredients.stream().map(String::toLowerCase).toList()));
                havingPredicates.add(cb.greaterThanOrEqualTo(cb.countDistinct(ingredientJoin.get("name")), 1L));
                hasGroupBy = true;
            }
            if (allergies != null && !allergies.isEmpty()) {
                Expression<Long> allergenCount = cb.sum(
                        cb.<Long>selectCase()
                                .when(cb.lower(ingredientJoin.get("name")).in(allergies.stream().map(String::toLowerCase).toList()), 1L)
                                .otherwise(0L)
                );
                havingPredicates.add(cb.lessThanOrEqualTo(allergenCount, (long) Math.floor(allergies.size() / 2.0)));
                hasGroupBy = true;
            }
        }

        Join<Recipe, DietaryPreference> dpJoin = null;
        if (dietaryPreferences != null && !dietaryPreferences.isEmpty()) {
            dpJoin = root.join("dietaryPreferences", JoinType.LEFT);
            predicates.add(cb.lower(dpJoin.get("name")).in(dietaryPreferences.stream().map(String::toLowerCase).toList()));
            havingPredicates.add(cb.equal(cb.countDistinct(dpJoin.get("name")), (long) dietaryPreferences.size()));
            hasGroupBy = true;
        }

        // Build the query
        query.select(root).where(predicates.toArray(new Predicate[0])).distinct(true);
        if (hasGroupBy) {
            query.groupBy(root.get("id"));
            if (!havingPredicates.isEmpty()) {
                query.having(cb.and(havingPredicates.toArray(new Predicate[0])));
            }
        }

        // Sorting
        Map<String, String> sortFieldMap = Map.of(
                "title", "title",
                "createdat", "createdAt",
                "viewcount", "viewCount",
                "cooktime", "cookTime"
        );

        if (pageable.getSort().isSorted()) {
            List<Order> orders = new ArrayList<>();
            for (Sort.Order s : pageable.getSort()) {
                String sortKey = s.getProperty().toLowerCase();
                String entityField = sortFieldMap.get(sortKey);
                if (entityField == null) {
                    throw new IllegalArgumentException("Invalid sort field: " + sortKey);
                }
                orders.add(s.isAscending() ? cb.asc(root.get(entityField)) : cb.desc(root.get(entityField)));
            }
            query.orderBy(orders);
        }

        // Execute the query
        TypedQuery<Recipe> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<Recipe> resultList = typedQuery.getResultList();
        List<RecipeCardDTO> results = resultList.stream()
                .map(RecipeMapper::toCardDTO)
                .collect(Collectors.toList());

        // Count query with conditional joins
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Recipe> countRoot = countQuery.from(Recipe.class);
        Join<Recipe, User> countAuthorJoin = countRoot.join("author", JoinType.LEFT);

        List<Predicate> countPredicates = new ArrayList<>();
        List<Predicate> countHavingPredicates = new ArrayList<>();
        boolean countHasGroupBy = false;

        if (keyword != null && !keyword.isBlank()) {
            String pattern = "%" + keyword.toLowerCase() + "%";
            Predicate titleLike = cb.like(cb.lower(countRoot.get("title")), pattern);
            Predicate authorLike = cb.like(cb.lower(cb.concat(countAuthorJoin.get("firstName"), cb.concat(" ", countAuthorJoin.get("lastName")))), pattern);
            Predicate descriptionLike = cb.like(cb.lower(countRoot.get("description")), pattern);
            countPredicates.add(cb.or(titleLike, authorLike, descriptionLike));
        }

        countPredicates.add(cb.equal(countRoot.get("isPublic"), isPublic));

        Join<Recipe, Cuisine> countCuisineJoin = null;
        if (cuisines != null && !cuisines.isEmpty()) {
            countCuisineJoin = countRoot.join("cuisines", JoinType.LEFT);
            countPredicates.add(cb.lower(countCuisineJoin.get("name")).in(cuisines.stream().map(String::toLowerCase).toList()));
            countHavingPredicates.add(cb.equal(cb.countDistinct(countCuisineJoin.get("name")), (long) cuisines.size()));
            countHasGroupBy = true;
        }

        Join<Recipe, Category> countCategoryJoin = null;
        if (categories != null && !categories.isEmpty()) {
            countCategoryJoin = countRoot.join("categories", JoinType.LEFT);
            countPredicates.add(cb.lower(countCategoryJoin.get("name")).in(categories.stream().map(String::toLowerCase).toList()));
            countHavingPredicates.add(cb.equal(cb.countDistinct(countCategoryJoin.get("name")), (long) categories.size()));
            countHasGroupBy = true;
        }

        Join<Recipe, RecipeIngredient> countRIJoin = null;
        Join<RecipeIngredient, Ingredient> countIngredientJoin = null;
        if ((ingredients != null && !ingredients.isEmpty()) || (allergies != null && !allergies.isEmpty())) {
            countRIJoin = countRoot.join("recipeIngredients", JoinType.LEFT);
            countIngredientJoin = countRIJoin.join("ingredient", JoinType.LEFT);
            if (ingredients != null && !ingredients.isEmpty()) {
                countPredicates.add(cb.lower(countIngredientJoin.get("name")).in(ingredients.stream().map(String::toLowerCase).toList()));
                countHavingPredicates.add(cb.greaterThanOrEqualTo(cb.countDistinct(countIngredientJoin.get("name")), 1L));
                countHasGroupBy = true;
            }
            if (allergies != null && !allergies.isEmpty()) {
                Expression<Long> allergenCount = cb.sum(
                        cb.<Long>selectCase()
                                .when(cb.lower(countIngredientJoin.get("name")).in(allergies.stream().map(String::toLowerCase).toList()), 1L)
                                .otherwise(0L)
                );
                countHavingPredicates.add(cb.lessThanOrEqualTo(allergenCount, (long) Math.floor(allergies.size() / 2.0)));
                countHasGroupBy = true;
            }
        }

        Join<Recipe, DietaryPreference> countDPJoin = null;
        if (dietaryPreferences != null && !dietaryPreferences.isEmpty()) {
            countDPJoin = countRoot.join("dietaryPreferences", JoinType.LEFT);
            countPredicates.add(cb.lower(countDPJoin.get("name")).in(dietaryPreferences.stream().map(String::toLowerCase).toList()));
            countHavingPredicates.add(cb.equal(cb.countDistinct(countDPJoin.get("name")), (long) dietaryPreferences.size()));
            countHasGroupBy = true;
        }

        // Execute count query
        long total;
        if (countHasGroupBy) {
            CriteriaQuery<Recipe> countBaseQuery = cb.createQuery(Recipe.class);
            Root<Recipe> countBaseRoot = countBaseQuery.from(Recipe.class);
            Join<Recipe, User> countBaseAuthorJoin = countBaseRoot.join("author", JoinType.LEFT);
            if (cuisines != null && !cuisines.isEmpty()) {
                countBaseRoot.join("cuisines", JoinType.LEFT);
            }
            if (categories != null && !categories.isEmpty()) {
                countBaseRoot.join("categories", JoinType.LEFT);
            }
            if ((ingredients != null && !ingredients.isEmpty()) || (allergies != null && !allergies.isEmpty())) {
                Join<Recipe, RecipeIngredient> countBaseRIJoin = countBaseRoot.join("recipeIngredients", JoinType.LEFT);
                countBaseRIJoin.join("ingredient", JoinType.LEFT);
            }
            if (dietaryPreferences != null && !dietaryPreferences.isEmpty()) {
                countBaseRoot.join("dietaryPreferences", JoinType.LEFT);
            }
            countBaseQuery.select(countBaseRoot).where(countPredicates.toArray(new Predicate[0])).distinct(true);
            countBaseQuery.groupBy(countBaseRoot.get("id"));
            if (!countHavingPredicates.isEmpty()) {
                countBaseQuery.having(cb.and(countHavingPredicates.toArray(new Predicate[0])));
            }
            total = entityManager.createQuery(countBaseQuery).getResultList().size();
        } else {
            countQuery.select(cb.countDistinct(countRoot));
            countQuery.where(countPredicates.toArray(new Predicate[0]));
            total = entityManager.createQuery(countQuery).getSingleResult();
        }

        return new PageImpl<>(results, pageable, total);
    }
}
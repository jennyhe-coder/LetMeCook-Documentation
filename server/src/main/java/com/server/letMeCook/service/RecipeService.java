package com.server.letMeCook.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.server.letMeCook.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.server.letMeCook.dto.recipe.RecipeCardDTO;
import com.server.letMeCook.dto.recipe.RecipeDTO;
import com.server.letMeCook.mapper.RecipeMapper;
import com.server.letMeCook.model.Category;
import com.server.letMeCook.model.Cuisine;
import com.server.letMeCook.model.DietaryPreference;
import com.server.letMeCook.model.Ingredient;
import com.server.letMeCook.model.Recipe;
import com.server.letMeCook.model.RecipeIngredient;
import com.server.letMeCook.model.User;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecommendationService recommendationService;
    private final RecipeMapper recipeMapper;
    @Autowired
    private RecipeFavouritesRepository favouritesRepository;
    @Autowired
    private RecipeBrowsingHistoryRepository browsingHistoryRepository;
    @Autowired
    private UserAllergyRepository userAllergyRepository;

    @Autowired
    private RecipeDislikedRepository recipeDislikedRepository;

    @Value("${recommendation.url}")
    private String recommendationUrl;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    public RecipeService(
            RecipeRepository recipeRepository,
            RecommendationService recommendationService,
            RecipeMapper recipeMapper
    ) {
        this.recipeRepository = recipeRepository;
        this.recommendationService = recommendationService;
        this.recipeMapper = recipeMapper;
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

        List<Predicate> predicates = new ArrayList<>();
        List<Predicate> havingPredicates = new ArrayList<>();
        boolean hasGroupBy = false;

        // Base predicate for public recipes
        predicates.add(cb.equal(root.get("isPublic"), isPublic));

        // 1. KEYWORD SEARCH - Count elements, require all keywords to appear at least once
        if (keyword != null && !keyword.isBlank()) {
            String[] keywords = keyword.trim().toLowerCase().split("\\s+");

            Join<Recipe, User> authorJoin = root.join("author", JoinType.LEFT);

            // Create subquery to count keyword occurrences
            Subquery<Long> keywordCountSubquery = query.subquery(Long.class);
            Root<Recipe> keywordRoot = keywordCountSubquery.from(Recipe.class);
            Join<Recipe, User> keywordAuthorJoin = keywordRoot.join("author", JoinType.LEFT);

            // Create CASE WHEN for each keyword
            List<Expression<Long>> keywordExpressions = new ArrayList<>();
            for (String kw : keywords) {
                String pattern = "%" + kw + "%";

                Predicate titleMatch = cb.like(cb.lower(keywordRoot.get("title")), pattern);
                Predicate descriptionMatch = cb.like(cb.lower(keywordRoot.get("description")), pattern);
                Predicate authorFirstNameMatch = cb.like(cb.lower(keywordAuthorJoin.get("firstName")), pattern);
                Predicate authorLastNameMatch = cb.like(cb.lower(keywordAuthorJoin.get("lastName")), pattern);

                Predicate anyMatch = cb.or(titleMatch, descriptionMatch, authorFirstNameMatch, authorLastNameMatch);

                Expression<Long> keywordCount = cb.<Long>selectCase()
                        .when(anyMatch, 1L)
                        .otherwise(0L);
                keywordExpressions.add(keywordCount);
            }

            // Total number of keywords found
            Expression<Long> totalKeywordCount = keywordExpressions.stream()
                    .reduce(cb.literal(0L), (acc, expr) -> cb.sum(acc, expr));

            keywordCountSubquery.select(totalKeywordCount);
            keywordCountSubquery.where(cb.equal(keywordRoot.get("id"), root.get("id")));

            // Require all keywords to appear (total >= number of keywords)
            predicates.add(cb.greaterThanOrEqualTo(keywordCountSubquery, (long) keywords.length));
        }

        // 2. CATEGORIES - Use OR operator
        if (categories != null && !categories.isEmpty()) {
            Join<Recipe, Category> categoryJoin = root.join("categories", JoinType.LEFT);
            predicates.add(cb.lower(categoryJoin.get("name")).in(
                    categories.stream().map(String::toLowerCase).collect(Collectors.toList())
            ));
            hasGroupBy = true;
        }

        // 3. CUISINES - Use OR operator
        if (cuisines != null && !cuisines.isEmpty()) {
            Join<Recipe, Cuisine> cuisineJoin = root.join("cuisines", JoinType.LEFT);
            predicates.add(cb.lower(cuisineJoin.get("name")).in(
                    cuisines.stream().map(String::toLowerCase).collect(Collectors.toList())
            ));
            hasGroupBy = true;
        }

        // 4. INGREDIENTS - Require ALL ingredients to match
        if (ingredients != null && !ingredients.isEmpty()) {
            Join<Recipe, RecipeIngredient> riJoin = root.join("recipeIngredients", JoinType.LEFT);
            Join<RecipeIngredient, Ingredient> ingredientJoin = riJoin.join("ingredient", JoinType.LEFT);

            // Create OR condition for all ingredients with LIKE pattern matching
            List<Predicate> ingredientPredicates = new ArrayList<>();
            for (String ingredient : ingredients) {
                String pattern = "%" + ingredient.toLowerCase() + "%";
                ingredientPredicates.add(cb.like(cb.lower(ingredientJoin.get("name")), pattern));
            }
            predicates.add(cb.or(ingredientPredicates.toArray(new Predicate[0])));

            // Count distinct ingredients matched - REQUIRE ALL
            Expression<Long> distinctIngredientMatches = cb.countDistinct(
                    cb.<String>selectCase()
                            .when(cb.or(ingredientPredicates.toArray(new Predicate[0])), ingredientJoin.get("name"))
                            .otherwise(cb.nullLiteral(String.class))
            );

            // REQUIRE: number of distinct ingredient matches >= number of ingredients in input
            havingPredicates.add(cb.greaterThanOrEqualTo(distinctIngredientMatches, (long) ingredients.size()));
            hasGroupBy = true;
        }

        // 5. DIETARY PREFERENCES - Require all dietary preferences to be present
        if (dietaryPreferences != null && !dietaryPreferences.isEmpty()) {
            Join<Recipe, DietaryPreference> dpJoin = root.join("dietaryPreferences", JoinType.LEFT);
            predicates.add(cb.lower(dpJoin.get("name")).in(
                    dietaryPreferences.stream().map(String::toLowerCase).collect(Collectors.toList())
            ));
            havingPredicates.add(cb.equal(cb.countDistinct(dpJoin.get("name")), (long) dietaryPreferences.size()));
            hasGroupBy = true;
        }

        // 6. ALLERGIES - Exclude recipes containing ANY allergen (original logic - OR)
        if (allergies != null && !allergies.isEmpty()) {
            Subquery<UUID> allergySubquery = query.subquery(UUID.class);
            Root<Recipe> allergyRoot = allergySubquery.from(Recipe.class);
            Join<Recipe, RecipeIngredient> allergyRIJoin = allergyRoot.join("recipeIngredients", JoinType.LEFT);
            Join<RecipeIngredient, Ingredient> allergyIngredientJoin = allergyRIJoin.join("ingredient", JoinType.LEFT);

            // Create OR condition for all allergies with LIKE pattern matching
            List<Predicate> allergyPredicates = new ArrayList<>();
            for (String allergy : allergies) {
                String pattern = "%" + allergy.toLowerCase() + "%";
                allergyPredicates.add(cb.like(cb.lower(allergyIngredientJoin.get("name")), pattern));
            }

            allergySubquery.select(allergyRoot.get("id"));
            allergySubquery.where(cb.or(allergyPredicates.toArray(new Predicate[0])));

            predicates.add(cb.not(root.get("id").in(allergySubquery)));
        }

        // Build query
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

        // Execute query with pagination
        TypedQuery<Recipe> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<Recipe> resultList = typedQuery.getResultList();
        List<RecipeCardDTO> results = resultList.stream()
                .map(RecipeMapper::toCardDTO)
                .collect(Collectors.toList());

        // Count total results
        long total = countAdvancedSearchResults(keyword, cuisines, ingredients, allergies, categories, dietaryPreferences, isPublic);

        return new PageImpl<>(results, pageable, total);
    }

    private long countAdvancedSearchResults(
            String keyword,
            Set<String> cuisines,
            Set<String> ingredients,
            Set<String> allergies,
            Set<String> categories,
            Set<String> dietaryPreferences,
            boolean isPublic) {

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Recipe> root = countQuery.from(Recipe.class);

        List<Predicate> predicates = new ArrayList<>();
        List<Predicate> havingPredicates = new ArrayList<>();
        boolean hasGroupBy = false;

        predicates.add(cb.equal(root.get("isPublic"), isPublic));

        // Keyword search logic (same as above)
        if (keyword != null && !keyword.isBlank()) {
            String[] keywords = keyword.trim().toLowerCase().split("\\s+");

            Subquery<Long> keywordCountSubquery = countQuery.subquery(Long.class);
            Root<Recipe> keywordRoot = keywordCountSubquery.from(Recipe.class);
            Join<Recipe, User> keywordAuthorJoin = keywordRoot.join("author", JoinType.LEFT);

            List<Expression<Long>> keywordExpressions = new ArrayList<>();
            for (String kw : keywords) {
                String pattern = "%" + kw + "%";

                Predicate titleMatch = cb.like(cb.lower(keywordRoot.get("title")), pattern);
                Predicate descriptionMatch = cb.like(cb.lower(keywordRoot.get("description")), pattern);
                Predicate authorFirstNameMatch = cb.like(cb.lower(keywordAuthorJoin.get("firstName")), pattern);
                Predicate authorLastNameMatch = cb.like(cb.lower(keywordAuthorJoin.get("lastName")), pattern);

                Predicate anyMatch = cb.or(titleMatch, descriptionMatch, authorFirstNameMatch, authorLastNameMatch);

                Expression<Long> keywordCount = cb.<Long>selectCase()
                        .when(anyMatch, 1L)
                        .otherwise(0L);
                keywordExpressions.add(keywordCount);
            }

            Expression<Long> totalKeywordCount = keywordExpressions.stream()
                    .reduce(cb.literal(0L), (acc, expr) -> cb.sum(acc, expr));

            keywordCountSubquery.select(totalKeywordCount);
            keywordCountSubquery.where(cb.equal(keywordRoot.get("id"), root.get("id")));

            predicates.add(cb.greaterThanOrEqualTo(keywordCountSubquery, (long) keywords.length));
        }

        // Categories (OR logic)
        if (categories != null && !categories.isEmpty()) {
            Join<Recipe, Category> categoryJoin = root.join("categories", JoinType.LEFT);
            predicates.add(cb.lower(categoryJoin.get("name")).in(
                    categories.stream().map(String::toLowerCase).collect(Collectors.toList())
            ));
            hasGroupBy = true;
        }

        // Cuisines (OR logic)
        if (cuisines != null && !cuisines.isEmpty()) {
            Join<Recipe, Cuisine> cuisineJoin = root.join("cuisines", JoinType.LEFT);
            predicates.add(cb.lower(cuisineJoin.get("name")).in(
                    cuisines.stream().map(String::toLowerCase).collect(Collectors.toList())
            ));
            hasGroupBy = true;
        }

        // Ingredients (ALL must match - AND logic)
        if (ingredients != null && !ingredients.isEmpty()) {
            Join<Recipe, RecipeIngredient> riJoin = root.join("recipeIngredients", JoinType.LEFT);
            Join<RecipeIngredient, Ingredient> ingredientJoin = riJoin.join("ingredient", JoinType.LEFT);

            List<Predicate> ingredientPredicates = new ArrayList<>();
            for (String ingredient : ingredients) {
                String pattern = "%" + ingredient.toLowerCase() + "%";
                ingredientPredicates.add(cb.like(cb.lower(ingredientJoin.get("name")), pattern));
            }
            predicates.add(cb.or(ingredientPredicates.toArray(new Predicate[0])));

            Expression<Long> distinctIngredientMatches = cb.countDistinct(
                    cb.<String>selectCase()
                            .when(cb.or(ingredientPredicates.toArray(new Predicate[0])), ingredientJoin.get("name"))
                            .otherwise(cb.nullLiteral(String.class))
            );

            havingPredicates.add(cb.greaterThanOrEqualTo(distinctIngredientMatches, (long) ingredients.size()));
            hasGroupBy = true;
        }

        // Dietary preferences (AND logic)
        if (dietaryPreferences != null && !dietaryPreferences.isEmpty()) {
            Join<Recipe, DietaryPreference> dpJoin = root.join("dietaryPreferences", JoinType.LEFT);
            predicates.add(cb.lower(dpJoin.get("name")).in(
                    dietaryPreferences.stream().map(String::toLowerCase).collect(Collectors.toList())
            ));
            havingPredicates.add(cb.equal(cb.countDistinct(dpJoin.get("name")), (long) dietaryPreferences.size()));
            hasGroupBy = true;
        }

        // Allergies (exclude recipes with ANY allergens - OR logic)
        if (allergies != null && !allergies.isEmpty()) {
            Subquery<UUID> allergySubquery = countQuery.subquery(UUID.class);
            Root<Recipe> allergyRoot = allergySubquery.from(Recipe.class);
            Join<Recipe, RecipeIngredient> allergyRIJoin = allergyRoot.join("recipeIngredients", JoinType.LEFT);
            Join<RecipeIngredient, Ingredient> allergyIngredientJoin = allergyRIJoin.join("ingredient", JoinType.LEFT);

            List<Predicate> allergyPredicates = new ArrayList<>();
            for (String allergy : allergies) {
                String pattern = "%" + allergy.toLowerCase() + "%";
                allergyPredicates.add(cb.like(cb.lower(allergyIngredientJoin.get("name")), pattern));
            }

            allergySubquery.select(allergyRoot.get("id"));
            allergySubquery.where(cb.or(allergyPredicates.toArray(new Predicate[0])));

            predicates.add(cb.not(root.get("id").in(allergySubquery)));
        }

        if (hasGroupBy) {
            countQuery.select(cb.countDistinct(root.get("id")));
            countQuery.where(predicates.toArray(new Predicate[0]));
            countQuery.groupBy(root.get("id"));
            if (!havingPredicates.isEmpty()) {
                countQuery.having(cb.and(havingPredicates.toArray(new Predicate[0])));
            }

            // For GROUP BY queries, we need to count the results
            return entityManager.createQuery(countQuery).getResultList().size();
        } else {
            countQuery.select(cb.countDistinct(root.get("id")));
            countQuery.where(predicates.toArray(new Predicate[0]));
            return entityManager.createQuery(countQuery).getSingleResult();
        }
    }


    @Transactional(readOnly = true)
    public Page<RecipeCardDTO> recommendedByRecipeId(UUID recipeId) {
        List<UUID> ids = recommendationService.recommendByRecipeId(recipeId, 10);
        List<RecipeCardDTO> content = recipeRepository.findAllById(ids)
                .stream()
                .map(RecipeMapper::toCardDTO)
                .toList();
        Pageable pageable = PageRequest.of(0, 10);
        return new PageImpl<>(content, pageable, content.size());
    }

    @Transactional(readOnly = true)
    public Page<RecipeCardDTO> recommendedByUserId(UUID userId) {
        List<UUID> favIds = favouritesRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(fav -> fav.getRecipe().getId())
                .limit(5)
                .toList();

        List<UUID> historyIds = browsingHistoryRepository.findByUserIdOrderByViewedAtDesc(userId)
                .stream()
                .map(history -> history.getRecipe().getId())
                .distinct()
                .limit(5)
                .toList();

        // uuid of 50 recommendations Recipe base on 5 history browsing and 5 favourites
        List<UUID> recommendedIds = recommendationService.recommendForUser(favIds, historyIds, 50);
        // uuid of all user allergy ingredient
        List<UUID> user_allergy_ingredients = userAllergyRepository.findAllAllergyIngredientIdsByUserId(userId);
        List<Recipe> recommendedRecipes = recipeRepository.findAllWithFullRelationsByIds(recommendedIds);
        Map<UUID, Recipe> idToRecipe = recommendedRecipes.stream()
                .collect(Collectors.toMap(Recipe::getId, Function.identity()));
        List<Recipe> orderedRecipes = recommendedIds.stream()
                .map(idToRecipe::get)
                .filter(Objects::nonNull)
                .toList();
        // filter with allergy
        Set<UUID> allergySet = new HashSet<>(user_allergy_ingredients);

        // filter with user disklike recipe
        List<UUID> dislikeRecipe = recipeDislikedRepository.findDislikedRecipeIdsByUserId(userId);

        List<RecipeCardDTO> content = orderedRecipes.stream()
                .filter(recipe -> recipe.getRecipeIngredients().stream()
                        .map(ri -> ri.getIngredient().getId())
                        .noneMatch(allergySet::contains))
                .filter(recipe -> !dislikeRecipe.contains(recipe.getId()))
                .map(RecipeMapper::toCardDTO)
                .limit(10)
                .toList();
        Pageable pageable = PageRequest.of(0, content.size() == 0 ? 1 : content.size());
        return new PageImpl<>(content, pageable, content.size());
    }

    public List<RecipeDTO> getAllRecipesWithFullRelations() {
        List<Recipe> recipes = recipeRepository.findAllWithFullRelations();
        return recipes.stream()
                .map(RecipeMapper::toDTO)
                .toList();
    }
}

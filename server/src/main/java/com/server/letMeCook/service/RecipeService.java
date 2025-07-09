package com.server.letMeCook.service;

import com.server.letMeCook.dto.recipe.RecipeCardDTO;
import com.server.letMeCook.dto.recipe.RecipeDTO;
import com.server.letMeCook.mapper.RecipeMapper;
import com.server.letMeCook.model.*;
import com.server.letMeCook.repository.RecipeBrowsingHistoryRepository;
import com.server.letMeCook.repository.RecipeFavouritesRepository;
import com.server.letMeCook.repository.RecipeRepository;
import jakarta.persistence.*;
import jakarta.persistence.criteria.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecommendationService recommendationService;
    private final RecipeMapper recipeMapper;
    @Autowired
    private RecipeFavouritesRepository favouritesRepository;

    @Autowired
    private RecipeBrowsingHistoryRepository browsingHistoryRepository;


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

        Join<Recipe, User> authorJoin = null;
        if (keyword != null && !keyword.isBlank()) {
            authorJoin = root.join("author", JoinType.LEFT);
        }

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
            Predicate authorLike = cb.or(
                    cb.like(cb.lower(authorJoin.get("firstName")), pattern),
                    cb.like(cb.lower(authorJoin.get("lastName")), pattern)
            );
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
            havingPredicates.add(cb.greaterThanOrEqualTo(cb.countDistinct(ingredientJoin.get("name")), 1L));
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
            havingPredicates.add(cb.lessThanOrEqualTo(allergenCount, (long) Math.floor(allergies.size() / 2.0)));
            hasGroupBy = true;
        }

        query.select(root).where(predicates.toArray(new Predicate[0])).distinct(true);

        if (hasGroupBy) {
            query.groupBy(root.get("id"));
            if (!havingPredicates.isEmpty()) {
                query.having(cb.and(havingPredicates.toArray(new Predicate[0])));
            }
        }

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

        TypedQuery<Recipe> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<Recipe> resultList = typedQuery.getResultList();
        List<RecipeCardDTO> results = resultList.stream()
                .map(RecipeMapper::toCardDTO)
                .collect(Collectors.toList());

        // Count logic simplified for keyword-only search
        if (
                (cuisines == null || cuisines.isEmpty()) &&
                        (ingredients == null || ingredients.isEmpty()) &&
                        (categories == null || categories.isEmpty()) &&
                        (dietaryPreferences == null || dietaryPreferences.isEmpty()) &&
                        (allergies == null || allergies.isEmpty())
        ) {
            CriteriaQuery<Long> simpleCount = cb.createQuery(Long.class);
            Root<Recipe> simpleCountRoot = simpleCount.from(Recipe.class);
            Join<Recipe, User> simpleAuthorJoin = null;
            if (keyword != null && !keyword.isBlank()) {
                simpleAuthorJoin = simpleCountRoot.join("author", JoinType.LEFT);
            }
            List<Predicate> countPreds = new ArrayList<>();
            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(simpleCountRoot.get("title")), pattern);
                Predicate authorLike = cb.or(
                        cb.like(cb.lower(simpleAuthorJoin.get("firstName")), pattern),
                        cb.like(cb.lower(simpleAuthorJoin.get("lastName")), pattern)
                );
                Predicate descriptionLike = cb.like(cb.lower(simpleCountRoot.get("description")), pattern);
                countPreds.add(cb.or(titleLike, authorLike, descriptionLike));
            }
            countPreds.add(cb.equal(simpleCountRoot.get("isPublic"), isPublic));
            simpleCount.select(cb.countDistinct(simpleCountRoot));
            simpleCount.where(countPreds.toArray(new Predicate[0]));
            long total = entityManager.createQuery(simpleCount).getSingleResult();
            return new PageImpl<>(results, pageable, total);
        }

        // Else fallback to group/having count
        CriteriaQuery<Recipe> countBaseQuery = cb.createQuery(Recipe.class);
        Root<Recipe> countRoot = countBaseQuery.from(Recipe.class);
        Join<Recipe, User> countAuthorJoin = null;
        if (keyword != null && !keyword.isBlank()) {
            countAuthorJoin = countRoot.join("author", JoinType.LEFT);
        }
        Join<Recipe, Cuisine> countCuisineJoin = countRoot.join("cuisines", JoinType.LEFT);
        Join<Recipe, Category> countCategoryJoin = countRoot.join("categories", JoinType.LEFT);
        Join<Recipe, RecipeIngredient> countRIJoin = countRoot.join("recipeIngredients", JoinType.LEFT);
        Join<RecipeIngredient, Ingredient> countIngredientJoin = countRIJoin.join("ingredient", JoinType.LEFT);
        Join<Recipe, DietaryPreference> countDPJoin = countRoot.join("dietaryPreferences", JoinType.LEFT);

        List<Predicate> countPredicates = new ArrayList<>();
        List<Predicate> countHavingPredicates = new ArrayList<>();
        boolean countHasGroupBy = false;

        if (keyword != null && !keyword.isBlank()) {
            String pattern = "%" + keyword.toLowerCase() + "%";
            Predicate titleLike = cb.like(cb.lower(countRoot.get("title")), pattern);
            Predicate authorLike = cb.or(
                    cb.like(cb.lower(countAuthorJoin.get("firstName")), pattern),
                    cb.like(cb.lower(countAuthorJoin.get("lastName")), pattern)
            );
            Predicate descriptionLike = cb.like(cb.lower(countRoot.get("description")), pattern);
            countPredicates.add(cb.or(titleLike, authorLike, descriptionLike));
        }

        countPredicates.add(cb.equal(countRoot.get("isPublic"), isPublic));

        if (cuisines != null && !cuisines.isEmpty()) {
            countPredicates.add(cb.lower(countCuisineJoin.get("name")).in(cuisines.stream().map(String::toLowerCase).toList()));
            countHavingPredicates.add(cb.equal(cb.countDistinct(countCuisineJoin.get("name")), (long) cuisines.size()));
            countHasGroupBy = true;
        }

        if (ingredients != null && !ingredients.isEmpty()) {
            countPredicates.add(cb.lower(countIngredientJoin.get("name")).in(ingredients.stream().map(String::toLowerCase).toList()));
            countHavingPredicates.add(cb.greaterThanOrEqualTo(cb.countDistinct(countIngredientJoin.get("name")), 1L));
            countHasGroupBy = true;
        }

        if (categories != null && !categories.isEmpty()) {
            countPredicates.add(cb.lower(countCategoryJoin.get("name")).in(categories.stream().map(String::toLowerCase).toList()));
            countHavingPredicates.add(cb.equal(cb.countDistinct(countCategoryJoin.get("name")), (long) categories.size()));
            countHasGroupBy = true;
        }

        if (dietaryPreferences != null && !dietaryPreferences.isEmpty()) {
            countPredicates.add(cb.lower(countDPJoin.get("name")).in(dietaryPreferences.stream().map(String::toLowerCase).toList()));
            countHavingPredicates.add(cb.equal(cb.countDistinct(countDPJoin.get("name")), (long) dietaryPreferences.size()));
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

        countBaseQuery.select(countRoot).where(countPredicates.toArray(new Predicate[0])).distinct(true);

        if (countHasGroupBy) {
            countBaseQuery.groupBy(countRoot.get("id"));
            if (!countHavingPredicates.isEmpty()) {
                countBaseQuery.having(cb.and(countHavingPredicates.toArray(new Predicate[0])));
            }
            long total = entityManager.createQuery(countBaseQuery).getResultList().size();
            return new PageImpl<>(results, pageable, total);
        } else {
            CriteriaQuery<Long> simpleCount = cb.createQuery(Long.class);
            Root<Recipe> simpleCountRoot = simpleCount.from(Recipe.class);
            simpleCount.select(cb.countDistinct(simpleCountRoot));
            simpleCount.where(countPredicates.toArray(new Predicate[0]));
            long total = entityManager.createQuery(simpleCount).getSingleResult();
            return new PageImpl<>(results, pageable, total);
        }
    }

    @Transactional(readOnly = true)
    public List<RecipeCardDTO> recommendedByRecipeId(UUID recipeId) {
        List<UUID> ids = recommendationService.recommendByRecipeId(recipeId, 10);
        return recipeRepository.findAllById(ids)
                .stream()
                .map(RecipeMapper::toCardDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RecipeCardDTO> recommendedByUserId(UUID userId) {
        List<UUID> favIds = favouritesRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(fav -> fav.getRecipe().getId())
                .toList();

        List<UUID> historyIds = browsingHistoryRepository.findByUserIdOrderByViewedAtDesc(userId)
                .stream()
                .map(history -> history.getRecipe().getId())
                .distinct()
                .toList();
        System.out.println("🟦 Favorite Recipe IDs: " + favIds);
        System.out.println("🟨 Browsing History Recipe IDs: " + historyIds);
        // ✅ Gọi service đã chuẩn hóa logic gọi REST
        List<UUID> recommendedIds = recommendationService.recommendForUser(favIds, historyIds, 10);

        if (recommendedIds.isEmpty()) {
            return List.of();
        }

        return recipeRepository.findAllById(recommendedIds)
                .stream()
                .map(RecipeMapper::toCardDTO)
                .toList();
    }
}
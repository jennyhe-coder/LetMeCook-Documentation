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

        // Join ở query chính
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

        // Sort
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

        // Thực hiện query chính
        TypedQuery<Recipe> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<Recipe> resultList = typedQuery.getResultList();
        List<RecipeCardDTO> results = resultList.stream()
                .map(RecipeMapper::toCardDTO)
                .collect(Collectors.toList());

        // === ❗ Tạo countQuery mới hoàn toàn ===
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Recipe> countRoot = countQuery.from(Recipe.class);
        countRoot.join("author", JoinType.LEFT);
        countRoot.join("cuisines", JoinType.LEFT);
        countRoot.join("categories", JoinType.LEFT);
        Join<Recipe, RecipeIngredient> riCountJoin = countRoot.join("recipeIngredients", JoinType.LEFT);
        riCountJoin.join("ingredient", JoinType.LEFT);
        countRoot.join("dietaryPreferences", JoinType.LEFT);

        List<Predicate> countPredicates = new ArrayList<>();

        if (keyword != null && !keyword.isBlank()) {
            String pattern = "%" + keyword.toLowerCase() + "%";
            Predicate titleLike = cb.like(cb.lower(countRoot.get("title")), pattern);
            Predicate authorLike = cb.like(cb.lower(cb.concat(
                    countRoot.join("author", JoinType.LEFT).get("firstName"),
                    cb.concat(" ", countRoot.join("author", JoinType.LEFT).get("lastName"))
            )), pattern);
            Predicate descriptionLike = cb.like(cb.lower(countRoot.get("description")), pattern);
            countPredicates.add(cb.or(titleLike, authorLike, descriptionLike));
        }

        countPredicates.add(cb.equal(countRoot.get("isPublic"), isPublic));

        countQuery.select(cb.countDistinct(countRoot)).where(countPredicates.toArray(new Predicate[0]));
        long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(results, pageable, total);
    }

}
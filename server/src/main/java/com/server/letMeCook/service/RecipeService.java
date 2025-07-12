package com.server.letMeCook.service;

import com.server.letMeCook.dto.recipe.RecipeCardDTO;
import com.server.letMeCook.dto.recipe.RecipeDTO;
import com.server.letMeCook.mapper.RecipeMapper;
import com.server.letMeCook.model.*;
import com.server.letMeCook.repository.RecipeBrowsingHistoryRepository;
import com.server.letMeCook.repository.RecipeFavouritesRepository;
import com.server.letMeCook.repository.RecipeRepository;
import com.server.letMeCook.repository.UserAllergyRepository;
import jakarta.persistence.*;
import jakarta.persistence.criteria.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.function.Function;
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
    @Autowired
    private UserAllergyRepository userAllergyRepository;

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



    public String buildAdvancedSearchSQL(
            Set<String> ingredients,
            Set<String> allergies,
            Set<String> cuisines,
            Set<String> categories,
            Set<String> dietaryPreferences,
            String keyword,
            boolean isPublic
    ) {
        List<String> wheres = new ArrayList<>();
        List<String> subQueries = new ArrayList<>();

        // 1. Ingredients
        if (ingredients != null && !ingredients.isEmpty()) {
            List<String> likeConds = ingredients.stream()
                    .map(s -> "LOWER(i.name) LIKE '%" + s.toLowerCase().replace("'", "''") + "%'")
                    .collect(Collectors.toList());
            List<String> havingConds = ingredients.stream()
                    .map(s -> "SUM(CASE WHEN LOWER(i.name) LIKE '%" + s.toLowerCase().replace("'", "''") + "%' THEN 1 ELSE 0 END) > 0")
                    .collect(Collectors.toList());
            subQueries.add(
                    "SELECT ri.recipe_id FROM recipe_ingredients ri " +
                            "JOIN ingredients i ON ri.ingredient_id = i.id " +
                            "WHERE " + String.join(" OR ", likeConds) + " " +
                            "GROUP BY ri.recipe_id HAVING " + String.join(" AND ", havingConds)
            );
        }
        // 2. Cuisine
        if (cuisines != null && !cuisines.isEmpty()) {
            String cond = cuisines.stream()
                    .map(s -> "'" + s.toLowerCase().replace("'", "''") + "'")
                    .collect(Collectors.joining(","));
            subQueries.add(
                    "SELECT rc.recipe_id FROM recipe_cuisines rc " +
                            "JOIN cuisines cu ON rc.cuisine_id = cu.id " +
                            "WHERE LOWER(cu.name) IN (" + cond + ")"
            );
        }
        // 3. Category
        if (categories != null && !categories.isEmpty()) {
            String cond = categories.stream()
                    .map(s -> "'" + s.toLowerCase().replace("'", "''") + "'")
                    .collect(Collectors.joining(","));
            subQueries.add(
                    "SELECT rcat.recipe_id FROM recipe_categories rcat " +
                            "JOIN categories cat ON rcat.category_id = cat.id " +
                            "WHERE LOWER(cat.name) IN (" + cond + ")"
            );
        }
        // 4. Dietary
        if (dietaryPreferences != null && !dietaryPreferences.isEmpty()) {
            String cond = dietaryPreferences.stream()
                    .map(s -> "'" + s.toLowerCase().replace("'", "''") + "'")
                    .collect(Collectors.joining(","));
            subQueries.add(
                    "SELECT rdp.recipe_id FROM recipe_dietary_pref rdp " +
                            "JOIN dietary_pref dp ON rdp.preference_id = dp.id " +
                            "WHERE LOWER(dp.name) IN (" + cond + ")"
            );
        }
        // 5. Keyword
        if (keyword != null && !keyword.isBlank()) {
            String[] keywords = keyword.trim().toLowerCase().split("\\s+");
            for (String kw : keywords) {
                String safeKw = kw.replace("'", "''");
                subQueries.add(
                        "SELECT r.id as recipe_id FROM recipe r " +
                                "LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id " +
                                "LEFT JOIN ingredients i ON ri.ingredient_id = i.id " +
                                "WHERE LOWER(r.title) LIKE '%" + safeKw + "%' " +
                                "   OR LOWER(r.description) LIKE '%" + safeKw + "%' " +
                                "   OR LOWER(i.name) LIKE '%" + safeKw + "%'"
                );
            }
        }

        // 6. isPublic
        if (isPublic) {
            subQueries.add("SELECT id as recipe_id FROM recipe WHERE is_public = TRUE");
        }

        String sql = String.join("\nINTERSECT\n", subQueries);

        if (allergies != null && !allergies.isEmpty()) {
            List<String> allergyConds = allergies.stream()
                    .map(a -> "LOWER(i2.name) LIKE '%" + a.toLowerCase().replace("'", "''") + "%'")
                    .collect(Collectors.toList());

            String notInAllergy = "r.id NOT IN (" +
                    "SELECT ri2.recipe_id FROM recipe_ingredients ri2 " +
                    "JOIN ingredients i2 ON ri2.ingredient_id = i2.id " +
                    "WHERE " + String.join(" OR ", allergyConds) +
                    ")";

            wheres.add(notInAllergy);
        }

        return sql;
    }
    @Transactional(readOnly = true)
    public Page<RecipeCardDTO> advancedSearch_demo(
            String keyword,
            Set<String> ingredients,
            Set<String> allergies,
            Set<String> cuisines,
            Set<String> categories,
            Set<String> dietaryPreferences,

            boolean isPublic,
            Pageable pageable
    ) {
        // Build INTERSECT SQL
        String sql = buildAdvancedSearchSQL(
                ingredients,
                allergies,
                cuisines,
                categories,
                dietaryPreferences,
                keyword,
                isPublic
        );


        String orderBy = "ORDER BY r.created_at DESC";
        if (pageable.getSort().isSorted()) {

            List<String> orders = new ArrayList<>();
            pageable.getSort().forEach(s ->
                    orders.add("r." + s.getProperty() + (s.isAscending() ? " ASC" : " DESC"))
            );
            orderBy = "ORDER BY " + String.join(", ", orders);
        }

        String pagedSql =
                "SELECT r.id FROM recipe r WHERE r.id IN (\n" +
                        sql + "\n)\n" +
                        orderBy + "\n" +
                        "LIMIT " + pageable.getPageSize() + " OFFSET " + pageable.getOffset();

        // Query danh sách id
        Query nativeQuery = entityManager.createNativeQuery(pagedSql);
        List<?> recipeIds = nativeQuery.getResultList();
        if (recipeIds.isEmpty()) return Page.empty();

        // Query detail (JPA)
        List<UUID> idList = recipeIds.stream()
                .map(id -> (UUID) (id instanceof UUID ? id : UUID.fromString(id.toString())))
                .collect(Collectors.toList());
        List<Recipe> recipes = recipeRepository.findAllById(idList);

        // Map sang DTO
        List<RecipeCardDTO> dtos = recipes.stream()
                .map(RecipeMapper::toCardDTO)
                .collect(Collectors.toList());


        String countSql = "SELECT COUNT(DISTINCT id) FROM recipe WHERE id IN (\n" + sql + "\n)";
        Query countQuery = entityManager.createNativeQuery(countSql);
        long total = ((Number) countQuery.getSingleResult()).longValue();

        return new PageImpl<>(dtos, pageable, total);
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
        List<RecipeCardDTO> content = orderedRecipes.stream()
                .filter(recipe -> recipe.getRecipeIngredients().stream()
                        .map(ri -> ri.getIngredient().getId())
                        .noneMatch(allergySet::contains))
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
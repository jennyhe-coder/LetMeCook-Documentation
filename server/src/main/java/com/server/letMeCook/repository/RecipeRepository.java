package com.server.letMeCook.repository;

import com.server.letMeCook.model.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface RecipeRepository extends JpaRepository<Recipe, UUID> {


    @Query("SELECT r FROM Recipe r WHERE r.isPublic = true")
    Page<Recipe> findAllPublic(Pageable pageable);

    @Query("SELECT r FROM Recipe r WHERE r.isPublic = true ORDER BY r.viewCount DESC")
    Page<Recipe> findTopByViews(Pageable pageable);

    @Query("""
        SELECT DISTINCT r FROM Recipe r
        LEFT JOIN FETCH r.recipeIngredients ri
        LEFT JOIN FETCH ri.ingredient i
        LEFT JOIN FETCH r.categories
        LEFT JOIN FETCH r.dietaryPreferences
        LEFT JOIN FETCH r.cuisines
        LEFT JOIN FETCH r.author
        """)
    List<Recipe> findAllWithFullRelations();

    @Query("""
        SELECT DISTINCT r FROM Recipe r
        LEFT JOIN FETCH r.recipeIngredients ri
        LEFT JOIN FETCH ri.ingredient
        LEFT JOIN FETCH r.categories
        LEFT JOIN FETCH r.dietaryPreferences
        LEFT JOIN FETCH r.cuisines
        LEFT JOIN FETCH r.author
        WHERE r.id IN :ids
        """)
    List<Recipe> findAllWithFullRelationsByIds(@Param("ids") List<UUID> ids);




    // Find recipes by author ID
    List<Recipe> findByAuthorId(UUID authorId);
}

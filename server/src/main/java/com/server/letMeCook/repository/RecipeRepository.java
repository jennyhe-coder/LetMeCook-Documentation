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

    // Search for recipes by author full name
    @Query("SELECT r FROM Recipe r JOIN r.author a " +
            "WHERE LOWER(CONCAT(a.firstName, ' ', a.lastName)) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Recipe> findByAuthorFullNameContainsIgnoreCase(@Param("name") String name);

    // Search for recipes by title
    @Query("SELECT r FROM Recipe r WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    List<Recipe> findByTitleContainsIgnoreCase(@Param("title") String title);

    // Normal search for recipes by title or author part name
    @Query("SELECT r FROM Recipe r JOIN r.author a " +
            "WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
            "LOWER(CONCAT(a.firstName, ' ', a.lastName)) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Recipe> findByTitleOrAuthorPartNameContainsIgnoreCase(@Param("name") String name);

    // Find all public recipes
    @Query("SELECT r FROM Recipe r WHERE r.isPublic = true")
    List<Recipe> findAllPublic();

    @Query("SELECT r FROM Recipe r WHERE r.isPublic = true")
    Page<Recipe> findAllPublic(Pageable pageable);

    @Query("SELECT r FROM Recipe r WHERE r.isPublic = true ORDER BY r.viewCount DESC")
    Page<Recipe> findTopByViews(Pageable pageable);


    // Find recipes by author ID
    List<Recipe> findByAuthorId(UUID authorId);
}

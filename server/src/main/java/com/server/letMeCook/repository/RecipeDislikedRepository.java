package com.server.letMeCook.repository;

import com.server.letMeCook.model.Recipe;
import com.server.letMeCook.model.RecipeDisliked;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.util.List;
import java.util.UUID;

public interface RecipeDislikedRepository extends JpaRepository<RecipeDisliked, UUID> {

    @Query("SELECT r.recipeId FROM RecipeDisliked r WHERE r.userId = :userId")
    List<UUID> findDislikedRecipeIdsByUserId(UUID userId);
}

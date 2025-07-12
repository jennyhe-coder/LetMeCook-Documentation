package com.server.letMeCook.repository;

import com.server.letMeCook.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IngredientRepository extends JpaRepository<Ingredient, UUID> {
    @Query("SELECT i FROM Ingredient i WHERE LOWER(i.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Ingredient> searchByNameLike(@Param("name") String name);

    Optional<Ingredient> findByNameIgnoreCase(String name);

}

package com.example.letmecook.repositories;

import com.example.letmecook.models.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeRepository extends JpaRepository<Recipe, Integer> {

}

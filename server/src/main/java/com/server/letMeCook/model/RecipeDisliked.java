package com.server.letMeCook.model;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "recipe_disliked")
public class RecipeDisliked {
    @Id
    @GeneratedValue(generator =  "UUID")
    @Column(name="id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "recipe_id",nullable = false )
    private UUID recipeId;

    @Column(name="user_id", nullable = false)
    private UUID userId;
}

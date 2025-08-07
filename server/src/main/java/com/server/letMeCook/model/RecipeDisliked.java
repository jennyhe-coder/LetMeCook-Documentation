package com.server.letMeCook.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "recipe_disliked")
@Getter @Setter
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

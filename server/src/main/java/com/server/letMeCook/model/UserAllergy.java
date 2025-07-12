// UserAllergy.java
package com.server.letMeCook.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="user_allergy")
@Getter
@Setter
public class UserAllergy {
    @EmbeddedId
    private UserAllergyId id;

    @ManyToOne
    @MapsId("user")
    @JoinColumn(name="user_id")
    private User user;

    @ManyToOne
    @MapsId("ingredient")
    @JoinColumn(name="ingredient_id")
    private Ingredient ingredient;
}

package com.server.letMeCook.repository;

import com.server.letMeCook.model.User;
import com.server.letMeCook.model.UserAllergy;
import com.server.letMeCook.model.UserAllergyId;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface UserAllergyRepository extends Repository<UserAllergy, UserAllergyId> {

    @Query("SELECT ua.ingredient.id FROM UserAllergy ua WHERE ua.user.id = :userId")
    List<UUID> findAllAllergyIngredientIdsByUserId(@Param("userId") UUID userId);
}

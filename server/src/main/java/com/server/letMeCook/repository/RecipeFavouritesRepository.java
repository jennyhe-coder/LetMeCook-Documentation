package com.server.letMeCook.repository;

import com.server.letMeCook.model.RecipeFavourites;
import com.server.letMeCook.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RecipeFavouritesRepository extends JpaRepository<RecipeFavourites, UUID> {
    List<RecipeFavourites> findByUserIdOrderByCreatedAtDesc(UUID userId);
}

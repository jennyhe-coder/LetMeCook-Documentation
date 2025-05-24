package com.server.letMeCook.repository;

import com.server.letMeCook.model.Cuisine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CuisinesRepository extends JpaRepository<Cuisine, UUID> {

}

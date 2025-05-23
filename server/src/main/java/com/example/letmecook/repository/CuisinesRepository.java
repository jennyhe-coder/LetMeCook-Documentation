package com.example.letmecook.repository;

import com.example.letmecook.model.Cuisine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CuisinesRepository extends JpaRepository<Cuisine, UUID> {

}

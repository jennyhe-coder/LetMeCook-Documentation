package com.example.letmecook.repository;

import com.example.letmecook.model.DietaryPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

interface DietaryPreferenceRepository extends JpaRepository<DietaryPreference, UUID> {
}

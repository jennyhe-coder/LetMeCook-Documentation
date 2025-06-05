package com.server.letMeCook.repository;

import com.server.letMeCook.model.DietaryPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DietaryPreferenceRepository extends JpaRepository<DietaryPreference, UUID> {

}

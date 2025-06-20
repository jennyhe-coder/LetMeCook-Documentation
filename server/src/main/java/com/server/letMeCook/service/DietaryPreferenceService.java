package com.server.letMeCook.service;

import com.server.letMeCook.dto.dietarypreference.DietaryPreferenceDTO;
import com.server.letMeCook.model.DietaryPreference;
import com.server.letMeCook.repository.DietaryPreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class DietaryPreferenceService  {
    @Autowired
    DietaryPreferenceRepository dietaryPreferenceRepository;

    public List<DietaryPreferenceDTO> getAllDietaryPreferences() {
        return dietaryPreferenceRepository.findAll().stream().map(DietaryPreferenceDTO::from).collect(Collectors.toList());
    }
    public List<String> getAllDietaryPreferenceNames() {
        return dietaryPreferenceRepository.findAll().stream()
                .map(DietaryPreference::getName)
                .toList();
    }



}

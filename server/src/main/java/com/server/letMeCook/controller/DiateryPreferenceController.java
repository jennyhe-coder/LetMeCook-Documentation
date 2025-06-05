package com.server.letMeCook.controller;

import com.server.letMeCook.service.DiateryPreferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.Mapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dietary-preferences")
public class DiateryPreferenceController {
    @Autowired
    private DiateryPreferenceService dietaryPreferenceService;

    @GetMapping(value = {"", "/"})
    public Object getAllDietaryPreferences() {
        return dietaryPreferenceService.getAllDietaryPreferences();
    }
}

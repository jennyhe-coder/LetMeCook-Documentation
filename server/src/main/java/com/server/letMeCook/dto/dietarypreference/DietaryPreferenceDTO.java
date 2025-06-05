package com.server.letMeCook.dto.dietarypreference;

import com.server.letMeCook.model.DietaryPreference;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DietaryPreferenceDTO {
    private String id;
    private String name;

    public static DietaryPreferenceDTO from(DietaryPreference dietaryPreference) {
        DietaryPreferenceDTO dietaryPreferenceDTO = new DietaryPreferenceDTO();
        dietaryPreferenceDTO.setId(dietaryPreference.getId() != null ? dietaryPreference.getId().toString() : null);
        dietaryPreferenceDTO.setName(dietaryPreference.getName());
        return dietaryPreferenceDTO;
    }

}

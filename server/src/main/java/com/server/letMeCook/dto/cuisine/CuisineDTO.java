package com.server.letMeCook.dto.cuisine;

import com.server.letMeCook.model.Cuisine;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CuisineDTO {
    private String id;
    private String name;

    public static CuisineDTO from(Cuisine cuisine) {
        CuisineDTO cuisineDTO = new CuisineDTO();
        cuisineDTO.setId(cuisine.getId() != null ? cuisine.getId().toString() : null);
        cuisineDTO.setName(cuisine.getName());
        return cuisineDTO;
    }

}

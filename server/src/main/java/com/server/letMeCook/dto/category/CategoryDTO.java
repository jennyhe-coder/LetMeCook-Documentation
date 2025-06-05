package com.server.letMeCook.dto.category;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CategoryDTO {
    private String id;
    private String name;

    public static CategoryDTO from(com.server.letMeCook.model.Category category) {
        CategoryDTO categoryDTO = new CategoryDTO();
        categoryDTO.setId(category.getId() != null ? category.getId().toString() : null);
        categoryDTO.setName(category.getName());
        return categoryDTO;
    }

}

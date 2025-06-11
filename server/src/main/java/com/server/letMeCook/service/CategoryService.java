package com.server.letMeCook.service;

import com.server.letMeCook.dto.category.CategoryDTO;
import com.server.letMeCook.repository.CategoryRespository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    @Autowired
    private CategoryRespository categoryRespository;

    public List<CategoryDTO> getAllCategories() {
        return categoryRespository.findAll().stream()
                .map(CategoryDTO::from)
                .collect(Collectors.toList());
    }

    public List<String> getAllCategoryNames() {
        return categoryRespository.findAll().stream()
                .map(category -> category.getName().toLowerCase())
                .toList();
    }


}

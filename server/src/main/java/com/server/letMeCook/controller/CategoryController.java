package com.server.letMeCook.controller;

import com.server.letMeCook.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping(value ={"", "/"})
    public Object getAllCategories() {
        return categoryService.getAllCategories();
    }

}

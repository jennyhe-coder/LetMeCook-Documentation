package com.server.letMeCook.controller;

import com.server.letMeCook.dto.cuisine.CuisineDTO;
import com.server.letMeCook.service.CuisineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/cuisines")
public class CuisineController {
    @Autowired
    private CuisineService cuisineService;

    @GetMapping(value = {"", "/"})
    public List<CuisineDTO> getAllCuisines() {
        return cuisineService.getAllCuisines();
    }

}

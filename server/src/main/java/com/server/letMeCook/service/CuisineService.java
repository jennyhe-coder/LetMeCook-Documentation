package com.server.letMeCook.service;

import com.server.letMeCook.dto.cuisine.CuisineDTO;
import com.server.letMeCook.repository.CuisinesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CuisineService{
    @Autowired
    private CuisinesRepository cuisineRepository;

    public List<CuisineDTO> getAllCuisines() {
        return cuisineRepository.findAll().stream()
                .map(CuisineDTO::from)
                .toList();
    }
    public List<String> getAllCuisineNames() {
        return cuisineRepository.findAll().stream()
                .map(cuisine -> cuisine.getName())
                .toList();
    }
}

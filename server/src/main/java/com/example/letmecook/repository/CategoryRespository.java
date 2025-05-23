package com.example.letmecook.repository;

import com.example.letmecook.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CategoryRespository extends JpaRepository<Category, UUID> {

}

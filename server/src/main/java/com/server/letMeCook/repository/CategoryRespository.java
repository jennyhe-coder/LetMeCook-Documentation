package com.server.letMeCook.repository;

import com.server.letMeCook.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CategoryRespository extends JpaRepository<Category, UUID> {

}

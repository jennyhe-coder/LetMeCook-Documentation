package com.server.letMeCook.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.server.letMeCook.model.User;

public interface UserRepository extends JpaRepository<User, UUID> {
    User findByEmail(String email);
}

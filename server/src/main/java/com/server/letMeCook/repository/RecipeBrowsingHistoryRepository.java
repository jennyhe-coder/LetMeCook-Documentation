package com.server.letMeCook.repository;

import com.server.letMeCook.model.RecipeBrowsingHistory;
import com.server.letMeCook.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RecipeBrowsingHistoryRepository extends JpaRepository<RecipeBrowsingHistory, UUID> {
    List<RecipeBrowsingHistory> findByUserIdOrderByViewedAtDesc(UUID userId);
}

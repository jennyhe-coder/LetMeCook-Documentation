package com.server.letMeCook.service;

import com.server.letMeCook.config.RecommendationProperties;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class RecommendationService {

    private final RestTemplate restTemplate;
    private final RecommendationProperties properties;

    public RecommendationService(RestTemplate restTemplate, RecommendationProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;
    }

    @SuppressWarnings("unchecked")
    public List<UUID> recommendByRecipeId(UUID recipeId, int topK) {
        String url = String.format("%s/recommend/id?recipeId=%s&topK=%d",
                properties.getUrl(), recipeId.toString(), topK);

        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<List<Object>> results = (List<List<Object>>) response.getBody().get("recommendations");

                List<UUID> ids = new ArrayList<>();
                for (List<Object> pair : results) {
                    ids.add(UUID.fromString((String) pair.get(0)));
                }
                return ids;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return Collections.emptyList();
    }

    @SuppressWarnings("unchecked")
    public List<UUID> recommendForUser(List<UUID> favorites, List<UUID> history, int topK) {
        String favStr = String.join(",", favorites.stream().map(UUID::toString).toList());
        String hisStr = String.join(",", history.stream().map(UUID::toString).toList());
        String url = String.format("%s/recommend/user?favorites=%s&history=%s&topK=%d",
                properties.getUrl(), favStr, hisStr, topK);
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<List<Object>> recommendations = (List<List<Object>>) response.getBody().get("recommendations");

                List<UUID> ids = recommendations.stream()
                        .map(pair -> UUID.fromString((String) pair.get(0)))
                        .toList();

                System.out.println("Recommendations from Flask: " + ids);
                return ids;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Collections.emptyList();
    }

}

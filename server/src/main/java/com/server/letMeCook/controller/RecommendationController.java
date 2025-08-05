package com.server.letMeCook.controller;

import com.server.letMeCook.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recipes/recommendation")
public class RecommendationController {

    @Value("${recommendation.url}")
    private String recommendationUrl;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private RecommendationService recommendationService;

    @PostMapping("/embed/update")
    public ResponseEntity<?> updateEmbeddingFromFlask() {
        String url = recommendationUrl + "/update/embed";
        try {
            restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(new HttpHeaders()), String.class);
            return ResponseEntity.ok("⏳ Pipeline started in background.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/embed/status")
    public ResponseEntity<?> getEmbeddingStatusFromFlask() {
        String url = recommendationUrl + "/update/embed/status";
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/embed/add")
    public ResponseEntity<?> addEmbedding(@RequestBody Map<String, String> body) {
        String id = body.get("id");
        if (id == null) return ResponseEntity.badRequest().body("Missing id");
        String url = recommendationUrl + "/embedding/add";
        try {
            restTemplate.postForEntity(url, body, String.class);
            return ResponseEntity.ok("✅ Embedding added.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/embed/remove")
    public ResponseEntity<?> removeEmbedding(@RequestBody Map<String, List<String>> body) {
        if (!body.containsKey("ids")) return ResponseEntity.badRequest().body("Missing ids");
        String url = recommendationUrl + "/embedding/remove";
        try {
            restTemplate.postForEntity(url, body, String.class);
            return ResponseEntity.ok("🧹 Embeddings removed.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/pipeline/run")
    public ResponseEntity<?> runPipeline() {
        String result = recommendationService.triggerPipeline();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/cache/info")
    public ResponseEntity<?> getCacheStatus() {
        Map<String, Object> info = recommendationService.getCacheInfo();
        return ResponseEntity.ok(info);
    }

}

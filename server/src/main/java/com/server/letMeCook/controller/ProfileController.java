package com.server.letMeCook.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.server.letMeCook.model.User;
import com.server.letMeCook.repository.UserRepository;

@RestController
@RequestMapping("/api")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaim("email");

        User user = userRepository.findByEmail(email);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", "User not found"));
        }

        Map<String, Object> response = Map.of(
            "full_name", user.getFirstName() + " " + user.getLastName(),
            "email", user.getEmail(),
            "cooking_skill", user.getCookingLvl(),
            "dietary_preg", user.getDietaryPref(),
            "about_me", user.getAboutMe(),
            "image_url", user.getImageUrl()
        );
        
        return ResponseEntity.ok(response);
    }
    
}

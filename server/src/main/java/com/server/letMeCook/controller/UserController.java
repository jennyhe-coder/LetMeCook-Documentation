package com.server.letMeCook.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;    
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.server.letMeCook.dto.user.UserPublicDTO;
import com.server.letMeCook.service.UserService;
@RequestMapping("/api")
@RestController
public class UserController {

    @Autowired
    private UserService userService;
    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> outMap = new HashMap<>();
        outMap.put("userId", jwt.getSubject());
        outMap.put("email", jwt.getClaim("email"));
        outMap.put("role", jwt.getClaim("role"));
        return outMap;
    }

    @GetMapping("/users/{id}")
    public UserPublicDTO getUserById(@PathVariable String id) {
        UUID uuid = UUID.fromString(id);
        return userService.getUserById(uuid);
    }
}

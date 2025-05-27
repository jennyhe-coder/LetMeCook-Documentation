package com.server.letMeCook.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import com.server.letMeCook.dto.user.UserPublicDTO;
import com.server.letMeCook.model.User;
import com.server.letMeCook.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;    
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;
@RequestMapping("/api")
@RestController
public class UserController {

    // @GetMapping("/req/me")
    // public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal OidcUser oidcUser) {
    //     return ResponseEntity.ok(oidcUser.getClaims());
    // }
    @Autowired
    private UserService userService;
    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> outMap = new HashMap<>();
        outMap.put("sub", jwt.getSubject());
        return outMap;
    }

    @GetMapping("/logout")
    public void logout(HttpServletResponse response) throws IOException {
        String domain    = "dev-k6juacqfcvxnltbr.us.auth0.com";
        String clientId  = "Em74YDN8OzYHWk8Oxc4PGenze73LaSW1";
        String returnTo  = "http://localhost:8080/";
        String logoutUrl = "https://" + domain +
                           "/v2/logout?client_id=" + clientId +
                           "&returnTo=" + returnTo;
        response.sendRedirect(logoutUrl);
    }

    @GetMapping("/users/{id}")
    public UserPublicDTO getUserById(@PathVariable String id) {
        UUID uuid = UUID.fromString(id);
        UserPublicDTO user = userService.getUserById(uuid);
        return user;
    }

}

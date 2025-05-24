package com.server.letMeCook.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;    
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;

@RestController
public class UserController {

    @GetMapping("/req/me")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal OidcUser oidcUser) {
        return ResponseEntity.ok(oidcUser.getClaims());
    }

    @GetMapping("/req/logout")
    public void logout(HttpServletResponse response) throws IOException {
        String domain    = "dev-k6juacqfcvxnltbr.us.auth0.com";
        String clientId  = "byS97bHUWgafGd7V76sERtE18Ykhw20W";
        String returnTo  = "http://localhost:8080/";
        String logoutUrl = "https://" + domain +
                           "/v2/logout?client_id=" + clientId +
                           "&returnTo=" + returnTo;
        response.sendRedirect(logoutUrl);
    }
}

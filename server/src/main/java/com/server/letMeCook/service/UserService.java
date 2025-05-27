package com.server.letMeCook.service;

import com.server.letMeCook.dto.user.UserPublicDTO;
import com.server.letMeCook.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public UserPublicDTO getUserById(UUID id) {
        return userRepository.findById(id)
                .map(UserPublicDTO::from)
                .orElse(null);
    }
}

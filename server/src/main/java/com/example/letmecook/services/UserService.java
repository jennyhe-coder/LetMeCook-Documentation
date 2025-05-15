package com.example.letmecook.services;


import com.example.letmecook.models.User;
import com.example.letmecook.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;


    public User register(String firstName, String lastName, String email, String password) {
        User existingUser = userRepository.findByEmail(email);
        if (existingUser != null) {
            throw new RuntimeException("User already exists");
        }

        String hashedPassword = passwordEncoder.encode(password);

        User user = new User(firstName, lastName, email, hashedPassword);
        return userRepository.save(user);
    }



}

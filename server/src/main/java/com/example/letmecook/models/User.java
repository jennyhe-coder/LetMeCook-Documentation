package com.example.letmecook.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "first_name")
    private String firstName = "";

    @Column(name = "last_name")
    private String lastName = "";

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "hash_password", nullable = false)
    private String hashPassword;

    @Column(name = "phone_number")
    private String phoneNumber = "";

    @Column(name = "cooking_level")
    private String cookingLevel = "Beginner"; // hoặc dùng Enum

    @Column(name = "about_me")
    private String aboutMe = "";

    @Column(nullable = false)
    private String image = "";

    // Constructors
    public User() {
    }

    public User(String firstName, String lastName, String email, String hashPassword) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.hashPassword = hashPassword;
        this.phoneNumber = "";
        this.cookingLevel = "Beginner";
        this.aboutMe = "";
        this.image = "";
    }
}

package com.server.letMeCook.model;


import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue
    @GenericGenerator(name="UUID",strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name="first_name")
    private String firstName = "";

    @Column(name = "last_name")
    private String lastName = "";

    @Column(name = "registration_date")
    private String registrationDate = "";

    @Column(name = "role")
    private String role = "user";

    @Column(name = "email", unique = true)
    private String email = "";
//
//    @Column(name = "auth0_id", unique = true)
//    private String auth0Id = "";

    public User() {    }
    public User(String email, String firstName, String lastName, String auth0Id, String role) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.registrationDate = java.time.LocalDate.now().toString();
        this.role = (role != null) ? role : "user";
//        this.auth0Id = auth0Id;
    }
}

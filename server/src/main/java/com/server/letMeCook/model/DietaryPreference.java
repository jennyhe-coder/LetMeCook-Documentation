package com.example.letmecook.model;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "dietary_pref")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DietaryPreference {

    @Id
    @GeneratedValue
    private UUID id;
    private String name = "";

    public DietaryPreference(String name) {
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DietaryPreference)) return false;

        DietaryPreference that = (DietaryPreference) o;

        return id != null ? id.equals(that.id) : that.id == null;
    }
    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}

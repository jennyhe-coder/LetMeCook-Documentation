// UserAllergyId.java
package com.server.letMeCook.model;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserAllergyId implements Serializable {
    private UUID user;
    private UUID ingredient;
}

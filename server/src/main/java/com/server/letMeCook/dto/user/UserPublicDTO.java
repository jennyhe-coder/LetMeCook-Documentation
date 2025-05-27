package com.server.letMeCook.dto.user;

import com.server.letMeCook.model.User;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UserPublicDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String aboutMe;
    private String imageUrl;

    public static UserPublicDTO from(User user) {
        UserPublicDTO userPublicDTO = new UserPublicDTO();
        userPublicDTO.setFirstName(user.getFirstName());
        userPublicDTO.setLastName(user.getLastName());
        userPublicDTO.setEmail(user.getEmail());
        userPublicDTO.setAboutMe(user.getAboutMe());
        userPublicDTO.setImageUrl(user.getImageUrl());
        return userPublicDTO;
    }
}

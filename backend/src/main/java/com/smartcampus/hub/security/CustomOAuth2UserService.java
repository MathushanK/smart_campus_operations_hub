package com.smartcampus.hub.security;

import com.smartcampus.hub.service.UserService;
import org.springframework.security.oauth2.client.userinfo.*;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import java.util.List;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;

    public CustomOAuth2UserService(UserService userService) {
        this.userService = userService;
    }

    @Override
public OAuth2User loadUser(OAuth2UserRequest request) {
    OAuth2User user = super.loadUser(request);

    String name = user.getAttribute("name");
    String email = user.getAttribute("email");

    var savedUser = userService.saveUser(name, email);

    // 🔥 IMPORTANT: pass role to Spring
    return new DefaultOAuth2User(
            List.of(new SimpleGrantedAuthority(savedUser.getRole())),
            user.getAttributes(),
            "email"
    );
}
}
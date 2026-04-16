package com.smartcampus.hub.security;

import com.smartcampus.hub.model.Role;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.RoleRepository;
import com.smartcampus.hub.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.*;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public CustomOAuth2UserService(UserRepository userRepository,
                                  RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
public OAuth2User loadUser(OAuth2UserRequest request)
        throws OAuth2AuthenticationException {

    OAuth2User oauthUser = super.loadUser(request);

    String email = oauthUser.getAttribute("email");
    String name = oauthUser.getAttribute("name");
    logger.info("Processing OAuth2 user: email={}, name={}", email, name);

    User user = userRepository.findByEmail(email)
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setName(name);

                Role role = roleRepository.findByName("ROLE_USER")
                        .orElseThrow(() -> new RuntimeException("Role not found"));

                newUser.getRoles().add(role);
                logger.info("Creating new local user for {}", email);

                return userRepository.save(newUser);
            });

    logger.info("Resolved local user id={} with roles={}", user.getId(),
            user.getRoles().stream().map(Role::getName).toList());

    List<SimpleGrantedAuthority> authorities = user.getRoles()
            .stream()
            .map(role -> new SimpleGrantedAuthority(role.getName()))
            .toList();

    return new DefaultOAuth2User(
            authorities,
            oauthUser.getAttributes(),
            "email"
    );
}
}

package com.smartcampus.hub.controller;

import com.smartcampus.hub.model.Role;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard")
    public String userDashboard() {
        return "Welcome User!";
    }

    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(Authentication authentication) {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        String email = principal.getAttribute("email");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        Role primaryRole = user.getRoles().stream().findFirst().orElse(null);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", user.getId());
        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("roleId", primaryRole != null ? primaryRole.getId() : null);
        response.put("roleName", primaryRole != null ? primaryRole.getName() : null);
        response.put(
                "role",
                primaryRole != null ? primaryRole.getName().replace("ROLE_", "").toLowerCase() : null
        );
        response.put(
                "roles",
                user.getRoles().stream().map(role -> {
                    Map<String, Object> roleData = new LinkedHashMap<>();
                    roleData.put("id", role.getId());
                    roleData.put("name", role.getName());
                    return roleData;
                }).toList()
        );

        return response;
    }
}

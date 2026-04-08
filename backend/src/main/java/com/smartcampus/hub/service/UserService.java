package com.smartcampus.hub.service;

import com.smartcampus.hub.model.Role;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.RoleRepository;
import com.smartcampus.hub.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repo;
    private final RoleRepository roleRepository;

    public UserService(UserRepository repo, RoleRepository roleRepository) {
        this.repo = repo;
        this.roleRepository = roleRepository;
    }

    public User saveUser(String name, String email) {
        return repo.findByEmail(email)
                .orElseGet(() -> {
                    User user = new User();
                    user.setName(name);
                    user.setEmail(email);

                    // ✅ FIX: assign role properly
                    Role role = roleRepository.findByName("ROLE_USER")
                            .orElseThrow(() -> new RuntimeException("Role not found"));

                    user.getRoles().add(role);

                    return repo.save(user);
                });
    }
}
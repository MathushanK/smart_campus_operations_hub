package com.smartcampus.hub.config;

import com.smartcampus.hub.model.Role;
import com.smartcampus.hub.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RoleInitializer {

    @Bean
    public CommandLineRunner seedRoles(RoleRepository roleRepository) {
        return args -> {
            createRoleIfMissing(roleRepository, "ROLE_ADMIN");
            createRoleIfMissing(roleRepository, "ROLE_TECHNICIAN");
            createRoleIfMissing(roleRepository, "ROLE_USER");
        };
    }

    private void createRoleIfMissing(RoleRepository roleRepository, String roleName) {
        roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));
    }
}

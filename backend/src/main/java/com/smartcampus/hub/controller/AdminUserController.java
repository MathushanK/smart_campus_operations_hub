package com.smartcampus.hub.controller;

import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/technicians")
    public List<Map<String, Object>> getTechnicians() {
        return userRepository.findAllTechnicians().stream().map(u -> {
            Map<String, Object> out = new LinkedHashMap<>();
            out.put("id", u.getId());
            out.put("name", u.getName());
            out.put("email", u.getEmail());
            return out;
        }).toList();
    }
}


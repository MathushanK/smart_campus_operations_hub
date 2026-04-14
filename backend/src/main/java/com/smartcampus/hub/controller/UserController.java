package com.smartcampus.hub.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @GetMapping("/dashboard")
    public String userDashboard() {
        return "Welcome User!";
    }
    @GetMapping("/me")
public Object getCurrentUser(Authentication authentication) {
    return authentication.getPrincipal();
}
}
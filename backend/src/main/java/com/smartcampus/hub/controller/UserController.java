package com.smartcampus.hub.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @GetMapping("/dashboard")
    public String userDashboard() {
        return "Welcome User!";
    }
}
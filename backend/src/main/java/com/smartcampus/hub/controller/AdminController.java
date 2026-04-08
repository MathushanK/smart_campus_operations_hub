package com.smartcampus.hub.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @GetMapping("/dashboard")
    public String adminOnly() {
        return "Welcome Admin!";
    }
}
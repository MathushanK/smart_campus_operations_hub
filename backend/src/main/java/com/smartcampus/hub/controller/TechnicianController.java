package com.smartcampus.hub.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/technician")
public class TechnicianController {

    @GetMapping("/dashboard")
    public String technicianDashboard() {
        return "Welcome Technician!";
    }
}
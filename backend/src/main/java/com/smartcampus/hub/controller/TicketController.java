package com.smartcampus.hub.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.hub.service.TicketService;
import com.smartcampus.hub.model.*;
import com.smartcampus.hub.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.File;
import java.util.List;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService service;
    private final UserRepository userRepository;

    // =========================
    // CREATE TICKET
    // =========================
    @PostMapping
    public Ticket create(@RequestBody Ticket ticket, Authentication authentication) {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ticket.setUserId(user.getId());

        return service.createTicket(ticket);
    }

    // =========================
    // GET MY TICKETS
    // =========================
    @GetMapping("/my")
    public List<Ticket> myTickets(Authentication authentication) {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return service.getUserTickets(user.getId());
    }

    // =========================
    // GET ALL TICKETS
    // =========================
    @GetMapping
    public List<Ticket> allTickets() {
        return service.getAllTickets();
    }

    // =========================
    // UPDATE STATUS
    // =========================
    @PutMapping("/{id}/status")
    public Ticket updateStatus(@PathVariable Long id, @RequestParam String status) {
        return service.updateStatus(id, status);
    }

    // =========================
    // COMMENT
    // =========================
    @PostMapping("/{id}/comment")
    public TicketComment comment(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam String comment) {
        return service.addComment(id, userId, comment);
    }

    // =========================
    // ASSIGN TECHNICIAN
    // =========================
    @PostMapping("/{id}/assign")
    public TicketAssignment assign(
            @PathVariable Long id,
            @RequestParam Long techId) {
        return service.assign(id, techId);
    }

    // =========================
    // GET SINGLE TICKET
    // =========================
    @GetMapping("/{id}")
    public Ticket getById(@PathVariable Long id) {
        return service.getTicketById(id);
    }

    // =========================
    // ⭐ IMAGE UPLOAD (NEW FEATURE)
    // =========================
    @PostMapping("/{id}/upload")
    public TicketImage uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        try {
            // folder
            String uploadDir = "uploads/";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // unique filename
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            Path path = Paths.get(uploadDir + fileName);
            Files.write(path, file.getBytes());

            // URL to access image
            String imageUrl = "http://localhost:8080/api/v1/uploads/" + fileName;

            return service.addImage(id, imageUrl);

        } catch (Exception e) {
            throw new RuntimeException("Image upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/images")
    public List<TicketImage> getImages(@PathVariable Long id) {
        return service.getImagesByTicketId(id);
    }
}
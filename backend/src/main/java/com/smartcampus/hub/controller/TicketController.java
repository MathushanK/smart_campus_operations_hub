package com.smartcampus.hub.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.hub.model.*;
import com.smartcampus.hub.service.TicketService;
import com.smartcampus.hub.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.File;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService service;
    private final UserRepository userRepository;

    // ✅ CREATE TICKET (AUTO USER ID)
    @PostMapping
    public Ticket create(@RequestBody Ticket ticket, Authentication authentication) {

        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        String email = principal.getAttribute("email");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ticket.setUserId(user.getId()); // ✅ IMPORTANT

        return service.createTicket(ticket);
    }

    // GET ALL
    @GetMapping
    public List<Ticket> getAll() {
        return service.getAllTickets();
    }

    // GET ONE
    @GetMapping("/{id}")
    public Ticket getOne(@PathVariable Long id) {
        return service.getTicketById(id);
    }

    // GET ASSIGNMENT (technician + notes) for a ticket
    @GetMapping("/{id}/assignment")
    public Map<String, Object> getAssignment(@PathVariable Long id) {
        TicketAssignment assign = service.getAssignment(id);
        if (assign == null) {
            return Map.of();
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", assign.getId());
        out.put("ticketId", assign.getTicketId());
        out.put("technicianId", assign.getTechnicianId());
        out.put("assignedAt", assign.getAssignedAt());
        out.put("resolutionNotes", assign.getResolutionNotes());

        if (assign.getTechnicianId() != null) {
            userRepository.findById(assign.getTechnicianId()).ifPresent(u -> {
                out.put("technicianName", u.getName());
                out.put("technicianEmail", u.getEmail());
            });
        }

        return out;
    }

    // UPDATE STATUS
    @PutMapping("/{id}/status")
    public Ticket updateStatus(@PathVariable Long id, @RequestParam String status) {
        return service.updateStatus(id, status);
    }

    // TECHNICIAN: add/update resolution notes
    @PutMapping("/{id}/resolution-notes")
    public TicketAssignment updateResolutionNotes(
        @PathVariable Long id,
        @RequestParam String notes,
        Authentication authentication
    ) {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        String email = principal.getAttribute("email");

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return service.updateResolutionNotes(id, user.getId(), notes);
    }

    // ✅ IMAGE UPLOAD (WORKING)
    // Note: do not restrict consumes; some clients omit/override Content-Type for FormData.
    @PostMapping(value = "/{id}/upload")
    public TicketImage uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            String uploadDir = "uploads/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            Path path = Paths.get(uploadDir + fileName);
            Files.write(path, file.getBytes());

            // served via WebConfig resource handler (see /uploads/** mapping)
            String imageUrl = "http://localhost:8080/api/v1/uploads/" + fileName;

            return service.addImage(id, imageUrl);

        } catch (Exception e) {
            e.printStackTrace(); // 🔥 important for debugging
            throw new RuntimeException("Image upload failed");
        }
    }

    // GET IMAGES
    @GetMapping("/{id}/images")
    public List<TicketImage> getImages(@PathVariable Long id) {
        return service.getImagesByTicketId(id);
    }

    // ✅ GET MY TICKETS (AUTO USER)
    @GetMapping("/my")
    public List<Ticket> getMyTickets(Authentication authentication) {

        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        String email = principal.getAttribute("email");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return service.getUserTickets(user.getId());
    }

    // ✅ GET MY ASSIGNED TICKETS (TECHNICIAN)
    @GetMapping("/assigned")
    public List<Ticket> getAssignedTickets(Authentication authentication) {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        String email = principal.getAttribute("email");

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return service.getAssignedTickets(user.getId());
    }

    @PutMapping("/{id}/admin-status")
    public Ticket adminUpdateStatus(
        @PathVariable Long id,
        @RequestParam String status,
        @RequestParam(required = false) String reason
    ) {
        return service.adminUpdateStatus(id, status, reason);
    }

    @PostMapping("/{id}/assign")
    public TicketAssignment assignTechnician(
        @PathVariable Long id,
        @RequestParam Long technicianId
    ) {
        return service.assignTechnician(id, technicianId);
    }

    // ===================== COMMENTS =====================

    @GetMapping("/{id}/comments")
    public List<Map<String, Object>> getComments(@PathVariable Long id) {
        return service.getComments(id).stream().map(c -> {
            Map<String, Object> out = new LinkedHashMap<>();
            out.put("id", c.getId());
            out.put("ticketId", c.getTicketId());
            out.put("userId", c.getUserId());
            out.put("comment", c.getComment());
            out.put("createdAt", c.getCreatedAt());

            if (c.getUserId() != null) {
                userRepository.findById(c.getUserId()).ifPresent(u -> {
                    out.put("userName", u.getName());
                    out.put("userEmail", u.getEmail());
                });
            }

            return out;
        }).toList();
    }

    @PostMapping("/{id}/comments")
    public TicketComment addComment(
        @PathVariable Long id,
        @RequestParam String comment,
        Authentication authentication
    ) {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        String email = principal.getAttribute("email");

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return service.addComment(id, user.getId(), comment);
    }

    @PutMapping("/comments/{commentId}")
    public TicketComment updateComment(
        @PathVariable Long commentId,
        @RequestParam String comment,
        Authentication authentication
    ) {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        String email = principal.getAttribute("email");

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        return service.updateComment(commentId, user.getId(), isAdmin, comment);
    }

    @DeleteMapping("/comments/{commentId}")
    public void deleteComment(
        @PathVariable Long commentId,
        Authentication authentication
    ) {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        String email = principal.getAttribute("email");

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        service.deleteComment(commentId, user.getId(), isAdmin);
    }

    
}


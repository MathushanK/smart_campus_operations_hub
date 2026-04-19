package com.smartcampus.hub.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.smartcampus.hub.service.TicketService;
import com.smartcampus.hub.model.*;

import java.util.List;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService service;

    // ✅ CREATE TICKET
    @PostMapping
    public Ticket create(@RequestBody Ticket ticket) {
        return service.createTicket(ticket);
    }

    // ✅ GET USER TICKETS
    @GetMapping("/user/{id}")
    public List<Ticket> userTickets(@PathVariable Long id) {
        return service.getUserTickets(id);
    }

    // ✅ UPDATE STATUS
    @PutMapping("/{id}/status")
    public Ticket updateStatus(@PathVariable Long id, @RequestParam String status) {
        return service.updateStatus(id, status);
    }

    // ✅ ADD COMMENT
    @PostMapping("/{id}/comment")
    public TicketComment comment(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam String comment) {
        return service.addComment(id, userId, comment);
    }

    // ✅ ASSIGN TECHNICIAN
    @PostMapping("/{id}/assign")
    public TicketAssignment assign(
            @PathVariable Long id,
            @RequestParam Long techId) {
        return service.assign(id, techId);
    }

    // ✅ GET TECHNICIAN TICKETS
    @GetMapping("/technician/{id}")
    public List<TicketAssignment> techTickets(@PathVariable Long id) {
        return service.getTechTickets(id);
    }

    // ✅ ADD IMAGE
    @PostMapping("/{id}/image")
    public TicketImage addImage(
            @PathVariable Long id,
            @RequestParam String url) {
        return service.addImage(id, url);
    }
}
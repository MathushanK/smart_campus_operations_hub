package com.smartcampus.hub.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.smartcampus.hub.model.*;
import com.smartcampus.hub.repository.*;

import java.sql.Timestamp;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepo;
    private final TicketCommentRepository commentRepo;
    private final TicketAssignmentRepository assignRepo;
    private final TicketImageRepository imageRepo;

    // ✅ CREATE TICKET
    public Ticket createTicket(Ticket ticket) {
        ticket.setStatus(Ticket.Status.OPEN);
        ticket.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        return ticketRepo.save(ticket);
    }

    // ✅ GET USER TICKETS
    public List<Ticket> getUserTickets(Long userId) {
        return ticketRepo.findByUserId(userId);
    }

    // ✅ SAFE STATUS UPDATE
    public Ticket updateStatus(Long id, String status) {
        Ticket t = ticketRepo.findById(id).orElseThrow();

        try {
            t.setStatus(Ticket.Status.valueOf(status.toUpperCase()));
        } catch (Exception e) {
            throw new RuntimeException("Invalid status value");
        }

        return ticketRepo.save(t);
    }

    // ✅ ADD COMMENT
    public TicketComment addComment(Long ticketId, Long userId, String text) {
        TicketComment c = new TicketComment();
        c.setTicketId(ticketId);
        c.setUserId(userId);
        c.setComment(text);
        c.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        return commentRepo.save(c);
    }

    // ✅ ASSIGN TECHNICIAN
    public TicketAssignment assign(Long ticketId, Long techId) {
        TicketAssignment a = new TicketAssignment();
        a.setTicketId(ticketId);
        a.setTechnicianId(techId);
        a.setAssignedAt(new Timestamp(System.currentTimeMillis()));
        return assignRepo.save(a);
    }

    // ✅ GET TECHNICIAN TICKETS
    public List<TicketAssignment> getTechTickets(Long techId) {
        return assignRepo.findByTechnicianId(techId);
    }

    // ✅ ADD IMAGE
    public TicketImage addImage(Long ticketId, String url) {
        TicketImage img = new TicketImage();
        img.setTicketId(ticketId);
        img.setImageUrl(url);
        return imageRepo.save(img);
    }
}
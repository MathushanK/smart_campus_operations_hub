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

    // CREATE
    public Ticket createTicket(Ticket ticket) {
        ticket.setStatus(Ticket.Status.OPEN);
        ticket.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        return ticketRepo.save(ticket);
    }

    // USER TICKETS
    public List<Ticket> getUserTickets(Long userId) {
        return ticketRepo.findByUserId(userId);
    }

    // TECHNICIAN ASSIGNED TICKETS
    public List<Ticket> getAssignedTickets(Long technicianId) {
        List<TicketAssignment> assigns = assignRepo.findByTechnicianId(technicianId);
        List<Long> ticketIds = assigns.stream()
            .map(TicketAssignment::getTicketId)
            .distinct()
            .toList();

        if (ticketIds.isEmpty()) {
            return List.of();
        }

        return ticketRepo.findAllById(ticketIds);
    }

    // UPDATE STATUS
    public Ticket updateStatus(Long id, String status) {
        Ticket t = ticketRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        t.setStatus(Ticket.Status.valueOf(status.toUpperCase()));
        return ticketRepo.save(t);
    }

    // ADD IMAGE
    public TicketImage addImage(Long ticketId, String url) {
        TicketImage img = new TicketImage();
        img.setTicketId(ticketId);
        img.setImageUrl(url);
        return imageRepo.save(img);
    }

    // GET ALL
    public List<Ticket> getAllTickets() {
        return ticketRepo.findAll();
    }

    // GET ONE
    public Ticket getTicketById(Long id) {
        return ticketRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    // GET IMAGES
    public List<TicketImage> getImagesByTicketId(Long ticketId) {
        return imageRepo.findByTicketId(ticketId);
    }

    public Ticket adminUpdateStatus(Long id, String status, String reason) {

        Ticket t = ticketRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Ticket.Status newStatus = Ticket.Status.valueOf(status.toUpperCase());

        t.setStatus(newStatus);

        if (newStatus == Ticket.Status.REJECTED) {
            t.setRejectionReason(reason);
        }

        return ticketRepo.save(t);
    }

    public TicketAssignment assignTechnician(Long ticketId, Long technicianId) {

        // enforce one active assignment row per ticket (update if exists)
        List<TicketAssignment> existing = assignRepo.findByTicketId(ticketId);
        TicketAssignment assign = existing.isEmpty() ? new TicketAssignment() : existing.get(0);

        assign.setTicketId(ticketId);
        assign.setTechnicianId(technicianId);
        assign.setAssignedAt(new Timestamp(System.currentTimeMillis()));

        return assignRepo.save(assign);
    }

    public TicketAssignment updateResolutionNotes(Long ticketId, Long technicianId, String notes) {
        List<TicketAssignment> existing = assignRepo.findByTicketId(ticketId);
        if (existing.isEmpty()) {
            throw new RuntimeException("Ticket is not assigned");
        }

        TicketAssignment assign = existing.get(0);
        if (assign.getTechnicianId() == null || !assign.getTechnicianId().equals(technicianId)) {
            throw new RuntimeException("Not allowed to update resolution notes");
        }

        assign.setResolutionNotes(notes);
        return assignRepo.save(assign);
    }

    public TicketAssignment getAssignment(Long ticketId) {
        List<TicketAssignment> existing = assignRepo.findByTicketId(ticketId);
        return existing.isEmpty() ? null : existing.get(0);
    }

    // ===================== COMMENTS =====================

    public List<TicketComment> getComments(Long ticketId) {
        return commentRepo.findByTicketId(ticketId);
    }

    public TicketComment addComment(Long ticketId, Long userId, String comment) {
        TicketComment c = new TicketComment();
        c.setTicketId(ticketId);
        c.setUserId(userId);
        c.setComment(comment);
        c.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        return commentRepo.save(c);
    }

    public TicketComment updateComment(Long commentId, Long userId, boolean isAdmin, String newText) {
        TicketComment c = commentRepo.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!isAdmin && (c.getUserId() == null || !c.getUserId().equals(userId))) {
            throw new RuntimeException("Not allowed to edit this comment");
        }

        c.setComment(newText);
        return commentRepo.save(c);
    }

    public void deleteComment(Long commentId, Long userId, boolean isAdmin) {
        TicketComment c = commentRepo.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!isAdmin && (c.getUserId() == null || !c.getUserId().equals(userId))) {
            throw new RuntimeException("Not allowed to delete this comment");
        }

        commentRepo.deleteById(commentId);
    }
}

package com.smartcampus.hub.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.smartcampus.hub.model.*;
import com.smartcampus.hub.repository.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepo;
    private final TicketCommentRepository commentRepo;
    private final TicketAssignmentRepository assignRepo;
    private final TicketImageRepository imageRepo;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // CREATE
    public Ticket createTicket(Ticket ticket) {
        ticket.setStatus(Ticket.Status.OPEN);
        ticket.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        Ticket savedTicket = ticketRepo.save(ticket);

        notifyAdmins(
            "TICKET_CREATED",
            "New ticket #" + savedTicket.getId() + " created: " + ticketLabel(savedTicket)
        );

        return savedTicket;
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
        Ticket savedTicket = ticketRepo.save(t);

        notifyUser(
            savedTicket.getUserId(),
            "TICKET_STATUS_UPDATED",
            "Your ticket #" + savedTicket.getId() + " is now " + savedTicket.getStatus() + "."
        );

        return savedTicket;
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

        Ticket savedTicket = ticketRepo.save(t);

        String message = "Your ticket #" + savedTicket.getId() + " was updated to " + savedTicket.getStatus() + ".";
        if (savedTicket.getStatus() == Ticket.Status.REJECTED && reason != null && !reason.isBlank()) {
            message += " Reason: " + reason;
        }

        notifyUser(savedTicket.getUserId(), "TICKET_ADMIN_STATUS_UPDATED", message);

        return savedTicket;
    }

    public TicketAssignment assignTechnician(Long ticketId, Long technicianId) {

        // enforce one active assignment row per ticket (update if exists)
        List<TicketAssignment> existing = assignRepo.findByTicketId(ticketId);
        TicketAssignment assign = existing.isEmpty() ? new TicketAssignment() : existing.get(0);

        assign.setTicketId(ticketId);
        assign.setTechnicianId(technicianId);
        assign.setAssignedAt(new Timestamp(System.currentTimeMillis()));

        TicketAssignment savedAssignment = assignRepo.save(assign);

        ticketRepo.findById(ticketId).ifPresent(ticket -> {
            notifyUser(
                technicianId,
                "TICKET_ASSIGNED",
                "You were assigned ticket #" + ticketId + ": " + ticketLabel(ticket)
            );

            notifyUser(
                ticket.getUserId(),
                "TICKET_ASSIGNED",
                "Your ticket #" + ticketId + " has been assigned to a technician."
            );
        });

        return savedAssignment;
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
        TicketAssignment savedAssignment = assignRepo.save(assign);

        notifyTicketStakeholders(
            ticketId,
            technicianId,
            "TICKET_RESOLUTION_UPDATED",
            "Resolution notes were updated for ticket #" + ticketId + "."
        );

        return savedAssignment;
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
        TicketComment savedComment = commentRepo.save(c);

        notifyTicketStakeholders(
            ticketId,
            userId,
            "TICKET_COMMENT_ADDED",
            "A new comment was added to ticket #" + ticketId + "."
        );

        return savedComment;
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

    private void notifyAdmins(String type, String message) {
        userRepository.findAllAdmins().forEach(admin -> notifyUser(admin.getId(), type, message));
    }

    private void notifyTicketStakeholders(Long ticketId, Long actorUserId, String type, String message) {
        Ticket ticket = ticketRepo.findById(ticketId).orElse(null);
        if (ticket == null) {
            return;
        }

        notifyUserIfDifferent(ticket.getUserId(), actorUserId, type, message);

        TicketAssignment assignment = getAssignment(ticketId);
        if (assignment != null) {
            notifyUserIfDifferent(assignment.getTechnicianId(), actorUserId, type, message);
        }

        userRepository.findAllAdmins().forEach(admin ->
            notifyUserIfDifferent(admin.getId(), actorUserId, type, message)
        );
    }

    private void notifyUserIfDifferent(Long targetUserId, Long actorUserId, String type, String message) {
        if (targetUserId == null || Objects.equals(targetUserId, actorUserId)) {
            return;
        }
        notifyUser(targetUserId, type, message);
    }

    private void notifyUser(Long userId, String type, String message) {
        if (userId == null) {
            return;
        }

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setMessage(message);
        notificationService.createNotification(notification);
    }

    private String ticketLabel(Ticket ticket) {
        if (ticket.getTitle() != null && !ticket.getTitle().isBlank()) {
            return ticket.getTitle();
        }
        if (ticket.getCategory() != null && !ticket.getCategory().isBlank()) {
            return ticket.getCategory();
        }
        return "Ticket";
    }
}

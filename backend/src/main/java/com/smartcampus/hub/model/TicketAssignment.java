package com.smartcampus.hub.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.sql.Timestamp;

@Entity
@Table(name = "ticket_assignments")
@Getter
@Setter
public class TicketAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id")
    private Long ticketId;

    @Column(name = "technician_id")
    private Long technicianId;

    @Column(name = "assigned_at")
    private Timestamp assignedAt;

    @Column(name = "resolution_notes")
    private String resolutionNotes;
}
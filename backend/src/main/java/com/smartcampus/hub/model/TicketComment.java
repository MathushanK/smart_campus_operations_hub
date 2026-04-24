package com.smartcampus.hub.model;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.sql.Timestamp;

@Entity
@Table(name = "ticket_comments")
@Getter
@Setter
public class TicketComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id")
    private Long ticketId;

    @Column(name = "user_id")
    private Long userId;

    private String comment;

    @Column(name = "created_at")
    private Timestamp createdAt;
}
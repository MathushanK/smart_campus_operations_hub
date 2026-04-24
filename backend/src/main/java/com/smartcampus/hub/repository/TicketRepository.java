package com.smartcampus.hub.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import com.smartcampus.hub.model.Ticket;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByUserId(Long userId);
}
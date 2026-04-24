package com.smartcampus.hub.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import com.smartcampus.hub.model.TicketImage;

import java.util.List;

public interface TicketImageRepository extends JpaRepository<TicketImage, Long> {
    List<TicketImage> findByTicketId(Long ticketId);
}
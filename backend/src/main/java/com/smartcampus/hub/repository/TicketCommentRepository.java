package com.smartcampus.hub.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import com.smartcampus.hub.model.TicketComment;

import java.util.List;

public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    List<TicketComment> findByTicketId(Long ticketId);
}
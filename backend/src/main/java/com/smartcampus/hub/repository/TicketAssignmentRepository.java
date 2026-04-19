package com.smartcampus.hub.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import com.smartcampus.hub.model.TicketAssignment;

import java.util.List;

public interface TicketAssignmentRepository extends JpaRepository<TicketAssignment, Long> {
    List<TicketAssignment> findByTechnicianId(Long technicianId);
}

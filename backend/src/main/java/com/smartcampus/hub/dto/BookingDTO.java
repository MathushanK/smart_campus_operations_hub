package com.smartcampus.hub.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {

    private Integer bookingId;
    private Long userId;
    private String userName;
    private String userEmail;
    private Integer resourceId;
    private String resourceName;
    private String resourceType;
    private Integer resourceCapacity;
    private String resourceLocation;
    private LocalTime resourceAvailabilityStart;
    private LocalTime resourceAvailabilityEnd;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer attendees;
    private String status;
    private String adminReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

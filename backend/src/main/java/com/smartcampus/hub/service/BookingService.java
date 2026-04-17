package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.BookingDTO;
import com.smartcampus.hub.model.Booking;
import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.BookingRepository;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    // ============ VALIDATION METHODS ============

    /**
     * Validates if date is today or in the future
     */
    private void validateFutureDate(LocalDate date) {
        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Booking date must be today or in the future");
        }
    }

    /**
     * Validates if end time is after start time
     */
    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
    }

    /**
     * Validates if resource exists and is active
     */
    private Resource validateResourceExists(Integer resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        if (!resource.getStatus().equals(Resource.Status.ACTIVE)) {
            throw new IllegalArgumentException("Resource is not available for booking");
        }

        return resource;
    }

    /**
     * Validates if user exists
     */
    private User validateUserExists(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    /**
     * Validates booking time is within resource availability window
     */
    private void validateAvailabilityWindow(Resource resource, LocalTime startTime, LocalTime endTime) {
        if (resource.getAvailabilityStart() == null || resource.getAvailabilityEnd() == null) {
            throw new IllegalArgumentException("Resource does not have availability window defined");
        }

        if (startTime.isBefore(resource.getAvailabilityStart()) || 
            endTime.isAfter(resource.getAvailabilityEnd())) {
            throw new IllegalArgumentException(
                    "Booking time must be within resource availability window (" +
                    resource.getAvailabilityStart() + " - " +
                    resource.getAvailabilityEnd() + ")"
            );
        }
    }

    /**
     * Validates attendees do not exceed resource capacity
     */
    private void validateCapacity(Resource resource, Integer attendees) {
        // If attendees is null, skip validation
        if (attendees == null) {
            return;
        }

        // If resource has no capacity defined, attendees should not be filled
        if (resource.getCapacity() == null) {
            throw new IllegalArgumentException("This resource does not support capacity booking. Attendees field is not applicable");
        }

        if (attendees > resource.getCapacity()) {
            throw new IllegalArgumentException(
                    "Number of attendees (" + attendees + ") exceeds resource capacity (" +
                    resource.getCapacity() + "). Please book another resource or slot"
            );
        }
    }

    /**
     * Checks for conflicting bookings - same resource, same date, overlapping times
     */
    private void validateNoConflicts(Integer resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, Integer excludeBookingId) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(resourceId, date, startTime, endTime);

        // Exclude the current booking being edited
        if (excludeBookingId != null) {
            conflicts = conflicts.stream()
                    .filter(b -> !b.getBookingId().equals(excludeBookingId))
                    .collect(Collectors.toList());
        }

        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException(
                    "Resource is already booked during this time slot. Available slots may be limited. Please choose a different time"
            );
        }
    }

    // ============ BOOKING OPERATIONS ============

    /**
     * Create a new booking with full validation
     */
    @Transactional
    public BookingDTO createBooking(Long userId, Integer resourceId, LocalDate date, 
                                   LocalTime startTime, LocalTime endTime, String purpose, 
                                   Integer attendees) {
        // Validate all requirements
        validateFutureDate(date);
        validateTimeRange(startTime, endTime);

        Resource resource = validateResourceExists(resourceId);
        validateAvailabilityWindow(resource, startTime, endTime);
        validateCapacity(resource, attendees);

        User user = validateUserExists(userId);

        validateNoConflicts(resourceId, date, startTime, endTime, null);

        // Create and save booking
        Booking booking = Booking.builder()
                .user(user)
                .resource(resource)
                .date(date)
                .startTime(startTime)
                .endTime(endTime)
                .purpose(purpose)
                .attendees(attendees)
                .status(Booking.BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        return convertToDTO(savedBooking);
    }

    /**
     * Update a pending booking (only users can update their own pending bookings)
     */
    @Transactional
    public BookingDTO updateBooking(Integer bookingId, Long userId, LocalDate date,
                                   LocalTime startTime, LocalTime endTime, String purpose,
                                   Integer attendees) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // Check ownership
        if (!booking.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only edit your own bookings");
        }

        // Check if booking is pending
        if (!booking.getStatus().equals(Booking.BookingStatus.PENDING)) {
            throw new IllegalArgumentException("Only pending bookings can be edited");
        }

        // Validate all requirements
        validateFutureDate(date);
        validateTimeRange(startTime, endTime);
        validateAvailabilityWindow(booking.getResource(), startTime, endTime);
        validateCapacity(booking.getResource(), attendees);
        validateNoConflicts(booking.getResource().getResourceId(), date, startTime, endTime, bookingId);

        // Update booking
        booking.setDate(date);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setPurpose(purpose);
        booking.setAttendees(attendees);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);
        return convertToDTO(updatedBooking);
    }

    /**
     * Cancel a booking (users can cancel pending, admins can cancel approved)
     */
    @Transactional
    public BookingDTO cancelBooking(Integer bookingId, Long userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // Check ownership for non-admins
        if (!isAdmin && !booking.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only cancel your own bookings");
        }

        // Check cancellation eligibility
        if (!isAdmin) {
            // Users can cancel PENDING or APPROVED bookings
            if (!booking.getStatus().equals(Booking.BookingStatus.PENDING) &&
                !booking.getStatus().equals(Booking.BookingStatus.APPROVED)) {
                throw new IllegalArgumentException("Cannot cancel " + booking.getStatus() + " bookings. Only pending and approved bookings can be cancelled");
            }
        } else {
            // Admins can cancel PENDING or APPROVED bookings
            if (!booking.getStatus().equals(Booking.BookingStatus.PENDING) &&
                !booking.getStatus().equals(Booking.BookingStatus.APPROVED)) {
                throw new IllegalArgumentException("Cannot cancel " + booking.getStatus() + " bookings");
            }
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);
        return convertToDTO(updatedBooking);
    }

    /**
     * Approve a pending booking (admin only)
     */
    @Transactional
    public BookingDTO approveBooking(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getStatus().equals(Booking.BookingStatus.PENDING)) {
            throw new IllegalArgumentException("Only pending bookings can be approved");
        }

        booking.setStatus(Booking.BookingStatus.APPROVED);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);
        return convertToDTO(updatedBooking);
    }

    /**
     * Reject a pending booking with reason (admin only)
     */
    @Transactional
    public BookingDTO rejectBooking(Integer bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getStatus().equals(Booking.BookingStatus.PENDING)) {
            throw new IllegalArgumentException("Only pending bookings can be rejected");
        }

        booking.setStatus(Booking.BookingStatus.REJECTED);
        booking.setAdminReason(reason);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);
        return convertToDTO(updatedBooking);
    }

    // ============ RETRIEVAL METHODS ============

    /**
     * Get all bookings for a user with search and filter
     */
    public Page<BookingDTO> getUserBookings(Long userId, String keyword, String status, Pageable pageable) {
        Page<Booking> bookings;

        if (keyword != null && !keyword.isEmpty()) {
            bookings = bookingRepository.searchUserBookings(userId, keyword, pageable);
        } else if (status != null && !status.isEmpty()) {
            try {
                Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
                bookings = bookingRepository.findByUserIdAndStatus(userId, bookingStatus, pageable);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid booking status: " + status);
            }
        } else {
            bookings = bookingRepository.findByUserId(userId, pageable);
        }

        return bookings.map(this::convertToDTO);
    }

    /**
     * Get all bookings (admin view) with search and filter
     */
    public Page<BookingDTO> getAllBookings(String keyword, String status, Pageable pageable) {
        Page<Booking> bookings;

        if (keyword != null && !keyword.isEmpty()) {
            bookings = bookingRepository.searchBookings(keyword, pageable);
        } else if (status != null && !status.isEmpty()) {
            try {
                Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
                bookings = bookingRepository.findByStatus(bookingStatus, pageable);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid booking status: " + status);
            }
        } else {
            bookings = bookingRepository.findAll(pageable);
        }

        return bookings.map(this::convertToDTO);
    }

    /**
     * Get a specific booking by ID
     */
    public BookingDTO getBookingById(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        return convertToDTO(booking);
    }

    // ============ CONFLICT CHECK ENDPOINT ============

    /**
     * Real-time conflict checking for frontend
     * Returns true if there are conflicts, false if available
     */
    public ConflictCheckResponse checkForConflicts(Integer resourceId, LocalDate date, 
                                                    LocalTime startTime, LocalTime endTime) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(resourceId, date, startTime, endTime);

        if (conflicts.isEmpty()) {
            return ConflictCheckResponse.builder()
                    .hasConflict(false)
                    .message("Time slot is available")
                    .conflictCount(0)
                    .build();
        } else {
            return ConflictCheckResponse.builder()
                    .hasConflict(true)
                    .message("Time slot is already booked by another user")
                    .conflictCount(conflicts.size())
                    .conflicts(conflicts.stream().map(this::convertToDTO).collect(Collectors.toList()))
                    .build();
        }
    }

    // ============ HELPER METHODS ============

    /**
     * Convert Booking entity to DTO
     */
    private BookingDTO convertToDTO(Booking booking) {
        return BookingDTO.builder()
                .bookingId(booking.getBookingId())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getName())
                .userEmail(booking.getUser().getEmail())
                .resourceId(booking.getResource().getResourceId())
                .resourceName(booking.getResource().getName())
                .resourceType(booking.getResource().getResourceType() != null ? 
                             booking.getResource().getResourceType().getTypeName() : null)
                .resourceCapacity(booking.getResource().getCapacity())
                .resourceLocation(booking.getResource().getLocation())
                .resourceAvailabilityStart(booking.getResource().getAvailabilityStart())
                .resourceAvailabilityEnd(booking.getResource().getAvailabilityEnd())
                .date(booking.getDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .attendees(booking.getAttendees())
                .status(booking.getStatus().toString())
                .adminReason(booking.getAdminReason())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    // ============ RESPONSE CLASSES ============

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ConflictCheckResponse {
        private boolean hasConflict;
        private String message;
        private int conflictCount;
        private List<BookingDTO> conflicts;
    }
}

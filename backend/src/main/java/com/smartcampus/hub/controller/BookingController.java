package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.BookingDTO;
import com.smartcampus.hub.model.Role;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.UserRepository;
import com.smartcampus.hub.service.BookingService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@AllArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    // ============ HELPER METHODS ============

    /**
     * Extract current user from authentication
     */
    private User getCurrentUser(Authentication authentication) {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        String email = principal.getAttribute("email");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    /**
     * Check if current user is admin
     */
    private boolean isAdmin(User user) {
        return user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ROLE_ADMIN"));
    }

    // ============ USER ENDPOINTS ============

    /**
     * Create a new booking
     * POST /api/bookings
     */
    @PostMapping
    public ResponseEntity<?> createBooking(
            Authentication authentication,
            @RequestBody CreateBookingRequest request) {
        try {
            User user = getCurrentUser(authentication);
            
            BookingDTO booking = bookingService.createBooking(
                    user.getId(),
                    request.getResourceId(),
                    request.getDate(),
                    request.getStartTime(),
                    request.getEndTime(),
                    request.getPurpose(),
                    request.getAttendees()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Update a pending booking
     * PUT /api/bookings/{bookingId}
     */
    @PutMapping("/{bookingId}")
    public ResponseEntity<?> updateBooking(
            Authentication authentication,
            @PathVariable Integer bookingId,
            @RequestBody UpdateBookingRequest request) {
        try {
            User user = getCurrentUser(authentication);
            
            BookingDTO booking = bookingService.updateBooking(
                    bookingId,
                    user.getId(),
                    request.getDate(),
                    request.getStartTime(),
                    request.getEndTime(),
                    request.getPurpose(),
                    request.getAttendees()
            );

            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Cancel a booking
     * DELETE /api/bookings/{bookingId}
     */
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<?> cancelBooking(
            Authentication authentication,
            @PathVariable Integer bookingId) {
        try {
            User user = getCurrentUser(authentication);
            
            BookingDTO booking = bookingService.cancelBooking(bookingId, user.getId(), false);
            return ResponseEntity.ok(createSuccessResponse("Booking cancelled successfully", booking));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get user's own bookings with search and filter
     * GET /api/bookings?keyword=&status=PENDING&page=0&size=10
     */
    @GetMapping
    public ResponseEntity<?> getUserBookings(
            Authentication authentication,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            User user = getCurrentUser(authentication);
            Pageable pageable = PageRequest.of(page, size);
            
            Page<BookingDTO> bookings = bookingService.getUserBookings(user.getId(), keyword, status, pageable);
            return ResponseEntity.ok(bookings);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get booking details by ID
     * GET /api/bookings/{bookingId}
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getBookingById(@PathVariable Integer bookingId) {
        try {
            BookingDTO booking = bookingService.getBookingById(bookingId);
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Real-time conflict checking
     * GET /api/bookings/check-conflicts?resourceId=1&date=2024-01-15&startTime=10:00:00&endTime=11:00:00
     */
    @GetMapping("/check-conflicts")
    public ResponseEntity<?> checkConflicts(
            @RequestParam Integer resourceId,
            @RequestParam LocalDate date,
            @RequestParam LocalTime startTime,
            @RequestParam LocalTime endTime) {
        try {
            BookingService.ConflictCheckResponse response = 
                    bookingService.checkForConflicts(resourceId, date, startTime, endTime);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    // ============ ADMIN ENDPOINTS ============

    /**
     * Get all bookings (admin view) with search and filter
     * GET /api/admin/bookings?keyword=&status=PENDING&page=0&size=10
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllBookings(
            Authentication authentication,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            User user = getCurrentUser(authentication);
            if (!isAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("Only admins can access all bookings"));
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<BookingDTO> bookings = bookingService.getAllBookings(keyword, status, pageable);
            return ResponseEntity.ok(bookings);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Approve a pending booking
     * POST /api/bookings/{bookingId}/approve
     */
    @PostMapping("/{bookingId}/approve")
    public ResponseEntity<?> approveBooking(
            Authentication authentication,
            @PathVariable Integer bookingId) {
        try {
            User user = getCurrentUser(authentication);
            if (!isAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("Only admins can approve bookings"));
            }

            BookingDTO booking = bookingService.approveBooking(bookingId);
            return ResponseEntity.ok(createSuccessResponse("Booking approved successfully", booking));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Reject a pending booking
     * POST /api/bookings/{bookingId}/reject
     */
    @PostMapping("/{bookingId}/reject")
    public ResponseEntity<?> rejectBooking(
            Authentication authentication,
            @PathVariable Integer bookingId,
            @RequestBody RejectBookingRequest request) {
        try {
            User user = getCurrentUser(authentication);
            if (!isAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("Only admins can reject bookings"));
            }

            BookingDTO booking = bookingService.rejectBooking(bookingId, request.getReason());
            return ResponseEntity.ok(createSuccessResponse("Booking rejected successfully", booking));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    // ============ RESPONSE HELPERS ============

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }

    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }

    // ============ REQUEST DTOs ============

    @lombok.Data
    public static class CreateBookingRequest {
        private Integer resourceId;
        private LocalDate date;
        private LocalTime startTime;
        private LocalTime endTime;
        private String purpose;
        private Integer attendees;
    }

    @lombok.Data
    public static class UpdateBookingRequest {
        private LocalDate date;
        private LocalTime startTime;
        private LocalTime endTime;
        private String purpose;
        private Integer attendees;
    }

    @lombok.Data
    public static class RejectBookingRequest {
        private String reason;
    }
}

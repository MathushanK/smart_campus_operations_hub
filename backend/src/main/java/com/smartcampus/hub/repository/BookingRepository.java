package com.smartcampus.hub.repository;

import com.smartcampus.hub.model.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    // Find all bookings by user
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId")
    List<Booking> findByUserId(@Param("userId") Long userId);

    // Find all bookings by user with pagination
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId")
    Page<Booking> findByUserId(@Param("userId") Long userId, Pageable pageable);

    // Find all bookings by resource
    @Query("SELECT b FROM Booking b WHERE b.resource.resourceId = :resourceId")
    List<Booking> findByResourceId(@Param("resourceId") Integer resourceId);

    // Find all bookings by status
    List<Booking> findByStatus(Booking.BookingStatus status);

    // Find all bookings by user and status
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.status = :status")
    List<Booking> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Booking.BookingStatus status);

    // Find bookings by user and status with pagination
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.status = :status")
    Page<Booking> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Booking.BookingStatus status, Pageable pageable);

    // Find conflicting bookings - same resource, same date, overlapping times
    @Query("SELECT b FROM Booking b WHERE b.resource.resourceId = :resourceId " +
           "AND b.date = :date " +
           "AND b.status IN ('PENDING', 'APPROVED') " +
           "AND (b.startTime < :endTime AND b.endTime > :startTime)")
    List<Booking> findConflictingBookings(
            @Param("resourceId") Integer resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    // Find conflicting bookings excluding a specific booking (for editing)
    @Query("SELECT b FROM Booking b WHERE b.resource.resourceId = :resourceId " +
           "AND b.date = :date " +
           "AND b.status IN ('PENDING', 'APPROVED') " +
           "AND (b.startTime < :endTime AND b.endTime > :startTime) " +
           "AND b.bookingId != :excludeBookingId")
    List<Booking> findConflictingBookings(
            @Param("resourceId") Integer resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeBookingId") Integer excludeBookingId
    );

    // Find all bookings by status with pagination (for admin)
    Page<Booking> findByStatus(Booking.BookingStatus status, Pageable pageable);

    // Search bookings by purpose or resource name (for admin)
    @Query("SELECT b FROM Booking b WHERE " +
           "LOWER(b.purpose) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.resource.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.user.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.user.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Booking> searchBookings(@Param("keyword") String keyword, Pageable pageable);

    // Search user's bookings by purpose, resource, or status
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND " +
           "(LOWER(b.purpose) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.resource.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Booking> searchUserBookings(@Param("userId") Long userId, @Param("keyword") String keyword, Pageable pageable);

    // Find bookings in a date range
    List<Booking> findByDateBetween(LocalDate startDate, LocalDate endDate);

    // Count pending bookings for a resource on a specific date
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.resource.resourceId = :resourceId AND b.date = :date AND b.status = :status")
    long countByResourceIdAndDateAndStatus(@Param("resourceId") Integer resourceId, @Param("date") LocalDate date, @Param("status") Booking.BookingStatus status);
}

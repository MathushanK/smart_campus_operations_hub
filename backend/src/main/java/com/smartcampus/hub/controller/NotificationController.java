package com.smartcampus.hub.controller;

import com.smartcampus.hub.model.Notification;
import com.smartcampus.hub.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @PostMapping
    public Notification create(@RequestBody Notification notification) {
        return service.createNotification(notification);
    }

    // ✅ FIXED
    @GetMapping
    public String test() {
        return "Notifications endpoint working";
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getByUser(@PathVariable Long userId) {
        return service.getNotificationsByUser(userId);
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id) {
        return service.markAsRead(id);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.deleteNotification(id);
        return "Deleted successfully";
    }
}
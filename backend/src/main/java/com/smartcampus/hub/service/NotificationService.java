package com.smartcampus.hub.service;

import com.smartcampus.hub.model.Notification;
import com.smartcampus.hub.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    public Notification createNotification(Notification notification) {
        return repository.save(notification);
    }

    public List<Notification> getNotificationsByUser(Long userId) {
        return repository.findByUserId(userId);
    }

    public Notification markAsRead(Long id) {
        Notification notification = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);
        return repository.save(notification);
    }

    public void deleteNotification(Long id) {
        repository.deleteById(id);
    }
}
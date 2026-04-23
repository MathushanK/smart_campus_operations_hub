package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.ResourceTypeDTO;
import com.smartcampus.hub.model.Notification;
import com.smartcampus.hub.model.ResourceType;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.model.User;
import com.smartcampus.hub.repository.ResourceTypeRepository;
import com.smartcampus.hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceTypeService {

    private final ResourceTypeRepository repo;
    private final ResourceRepository resourceRepo;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<ResourceTypeDTO> getAll() {
        return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ResourceTypeDTO getById(Integer id) {
        ResourceType rt = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource type not found"));
        return toDTO(rt);
    }

    @Transactional
    public ResourceTypeDTO create(ResourceTypeDTO dto) {
        ResourceType rt = new ResourceType();
        rt.setTypeName(dto.getTypeName());
        ResourceType savedType = repo.save(rt);
        notifyAdmins(savedType, "CREATED");
        return toDTO(savedType);
    }

    public ResourceTypeDTO update(Integer id, ResourceTypeDTO dto) {
        ResourceType rt = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource type not found"));
        rt.setTypeName(dto.getTypeName());
        return toDTO(repo.save(rt));
    }

    @Transactional
    public void delete(Integer id) {
        // Cascade delete: first delete all resources of this type
        resourceRepo.deleteAll(resourceRepo.findByResourceType_TypeId(id));
        // Then delete the resource type
        repo.deleteById(id);
        ResourceType resourceType = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource type not found"));
        repo.delete(resourceType);
        notifyAdmins(resourceType, "DELETED");
    }

    private ResourceTypeDTO toDTO(ResourceType rt) {
        ResourceTypeDTO dto = new ResourceTypeDTO();
        dto.setTypeId(rt.getTypeId());
        dto.setTypeName(rt.getTypeName());
        return dto;
    }

    private void notifyAdmins(ResourceType resourceType, String action) {
        String message = buildAdminMessage(resourceType, action);

        for (User admin : userRepository.findAllAdmins()) {
            Notification notification = new Notification();
            notification.setUserId(admin.getId());
            notification.setType("RESOURCE_TYPE_" + action);
            notification.setMessage(message);
            notificationService.createNotification(notification);
        }
    }

    private String buildAdminMessage(ResourceType resourceType, String action) {
        return switch (action) {
            case "CREATED" -> String.format(
                    "A new resource type '%s' was created.",
                    resourceType.getTypeName()
            );
            case "DELETED" -> String.format(
                    "The resource type '%s' was deleted.",
                    resourceType.getTypeName()
            );
            default -> String.format(
                    "The resource type '%s' was updated.",
                    resourceType.getTypeName()
            );
        };
    }
}

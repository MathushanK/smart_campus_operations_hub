package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.ResourceDTO;
import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.model.Resource.Status;
import com.smartcampus.hub.model.ResourceType;
import com.smartcampus.hub.repository.ResourceRepository;
import com.smartcampus.hub.repository.ResourceTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepo;
    private final ResourceTypeRepository typeRepo;

    public List<ResourceDTO> getAll() {
        return resourceRepo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ResourceDTO getById(Integer id) {
        return toDTO(findResource(id));
    }

    public List<ResourceDTO> search(Integer typeId, String location, Integer minCapacity, String status) {
        List<Resource> all = resourceRepo.findAll();

        return all.stream()
            .filter(r -> typeId == null || r.getResourceType().getTypeId().equals(typeId))
            .filter(r -> location == null || r.getLocation().toLowerCase().contains(location.toLowerCase()))
            .filter(r -> minCapacity == null || (r.getCapacity() != null && r.getCapacity() >= minCapacity))
            .filter(r -> status == null || r.getStatus().name().equalsIgnoreCase(status))
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public ResourceDTO create(ResourceDTO dto) {
        Resource r = toEntity(dto);
        return toDTO(resourceRepo.save(r));
    }

    public ResourceDTO update(Integer id, ResourceDTO dto) {
        Resource r = findResource(id);
        r.setName(dto.getName());
        r.setCapacity(dto.getCapacity());
        r.setLocation(dto.getLocation());
        r.setAvailabilityStart(dto.getAvailabilityStart());
        r.setAvailabilityEnd(dto.getAvailabilityEnd());
        if (dto.getStatus() != null) r.setStatus(dto.getStatus());
        if (dto.getTypeId() != null) {
            ResourceType type = typeRepo.findById(dto.getTypeId())
                    .orElseThrow(() -> new RuntimeException("Resource type not found"));
            r.setResourceType(type);
        }
        return toDTO(resourceRepo.save(r));
    }

    public void delete(Integer id) {
        resourceRepo.deleteById(id);
    }

    public ResourceDTO updateStatus(Integer id, String status) {
        Resource r = findResource(id);
        r.setStatus(Status.valueOf(status.toUpperCase()));
        return toDTO(resourceRepo.save(r));
    }

    private Resource findResource(Integer id) {
        return resourceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    private Resource toEntity(ResourceDTO dto) {
        Resource r = new Resource();
        r.setName(dto.getName());
        r.setCapacity(dto.getCapacity());
        r.setLocation(dto.getLocation());
        r.setAvailabilityStart(dto.getAvailabilityStart());
        r.setAvailabilityEnd(dto.getAvailabilityEnd());
        r.setStatus(dto.getStatus() != null ? dto.getStatus() : Status.ACTIVE);
        ResourceType type = typeRepo.findById(dto.getTypeId())
                .orElseThrow(() -> new RuntimeException("Resource type not found"));
        r.setResourceType(type);
        return r;
    }

    private ResourceDTO toDTO(Resource r) {
        ResourceDTO dto = new ResourceDTO();
        dto.setResourceId(r.getResourceId());
        dto.setName(r.getName());
        dto.setCapacity(r.getCapacity());
        dto.setLocation(r.getLocation());
        dto.setStatus(r.getStatus());
        dto.setAvailabilityStart(r.getAvailabilityStart());
        dto.setAvailabilityEnd(r.getAvailabilityEnd());
        if (r.getResourceType() != null) {
            dto.setTypeId(r.getResourceType().getTypeId());
            dto.setTypeName(r.getResourceType().getTypeName());
        }
        return dto;
    }
}
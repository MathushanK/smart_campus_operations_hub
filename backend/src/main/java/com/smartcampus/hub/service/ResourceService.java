package com.smartcampus.hub.service;

import com.smartcampus.hub.model.Resource;
import com.smartcampus.hub.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public List<Resource> searchResources(String name) {
        if (name == null || name.isBlank()) {
            return getAllResources();
        }
        return resourceRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Resource> getResourcesByType(String type) {
        return resourceRepository.findByType(type);
    }

    public Optional<Resource> getResourceById(Long id) {
        return resourceRepository.findById(id);
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    @Transactional
    public Optional<Resource> updateResource(Long id, Resource resourceDetails) {
        return resourceRepository.findById(id).map(existingResource -> {
            existingResource.setName(resourceDetails.getName());
            existingResource.setDescription(resourceDetails.getDescription());
            existingResource.setType(resourceDetails.getType());
            existingResource.setLocation(resourceDetails.getLocation());
            existingResource.setCapacity(resourceDetails.getCapacity());
            existingResource.setIsAvailable(resourceDetails.getIsAvailable());
            return resourceRepository.save(existingResource);
        });
    }

    public boolean deleteResource(Long id) {
        if (resourceRepository.existsById(id)) {
            resourceRepository.deleteById(id);
            return true;
        }
        return false;
    }
}

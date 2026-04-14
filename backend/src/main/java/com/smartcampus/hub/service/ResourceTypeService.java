package com.smartcampus.hub.service;

import com.smartcampus.hub.dto.ResourceTypeDTO;
import com.smartcampus.hub.model.ResourceType;
import com.smartcampus.hub.repository.ResourceTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceTypeService {

    private final ResourceTypeRepository repo;

    public List<ResourceTypeDTO> getAll() {
        return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ResourceTypeDTO getById(Integer id) {
        ResourceType rt = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource type not found"));
        return toDTO(rt);
    }

    public ResourceTypeDTO create(ResourceTypeDTO dto) {
        ResourceType rt = new ResourceType();
        rt.setTypeName(dto.getTypeName());
        return toDTO(repo.save(rt));
    }

    public ResourceTypeDTO update(Integer id, ResourceTypeDTO dto) {
        ResourceType rt = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource type not found"));
        rt.setTypeName(dto.getTypeName());
        return toDTO(repo.save(rt));
    }

    public void delete(Integer id) {
        repo.deleteById(id);
    }

    private ResourceTypeDTO toDTO(ResourceType rt) {
        ResourceTypeDTO dto = new ResourceTypeDTO();
        dto.setTypeId(rt.getTypeId());
        dto.setTypeName(rt.getTypeName());
        return dto;
    }
}

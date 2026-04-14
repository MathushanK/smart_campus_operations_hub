package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.ResourceTypeDTO;
import com.smartcampus.hub.service.ResourceTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/resource-types")
@RequiredArgsConstructor
public class ResourceTypeController {

    private final ResourceTypeService service;

    @GetMapping
    public ResponseEntity<List<ResourceTypeDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceTypeDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<ResourceTypeDTO> create(@Valid @RequestBody ResourceTypeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceTypeDTO> update(@PathVariable Integer id, @Valid @RequestBody ResourceTypeDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

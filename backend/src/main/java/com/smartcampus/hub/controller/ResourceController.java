package com.smartcampus.hub.controller;

import com.smartcampus.hub.dto.ResourceDTO;
import com.smartcampus.hub.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService service;

    // GET all + search/filter
    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getAll(
            @RequestParam(required = false) Integer typeId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(service.search(typeId, location, minCapacity, status));
    }

    // GET by ID
    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // POST create
    @PostMapping
    public ResponseEntity<ResourceDTO> create(@Valid @RequestBody ResourceDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    // PUT update
    @PutMapping("/{id}")
    public ResponseEntity<ResourceDTO> update(@PathVariable Integer id, @Valid @RequestBody ResourceDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH – update status only (ACTIVE / OUT_OF_SERVICE)
    @PatchMapping("/{id}/status")
    public ResponseEntity<ResourceDTO> updateStatus(@PathVariable Integer id,
                                                     @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.updateStatus(id, body.get("status")));
    }
}
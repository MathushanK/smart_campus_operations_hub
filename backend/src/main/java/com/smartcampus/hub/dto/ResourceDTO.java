package com.smartcampus.hub.dto;

import com.smartcampus.hub.model.Resource.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalTime;

@Data
public class ResourceDTO {

    private Integer resourceId;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type ID is required")
    private Integer typeId;

    private String typeName; // for response only

    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private Status status;

    private LocalTime availabilityStart;
    private LocalTime availabilityEnd;
}
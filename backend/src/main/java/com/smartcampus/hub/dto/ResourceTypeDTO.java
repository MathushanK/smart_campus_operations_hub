package com.smartcampus.hub.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResourceTypeDTO {

    private Integer typeId;

    @NotBlank(message = "Type name is required")
    private String typeName;
}

package com.smartcampus.hub.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "resource_types")
@Data
public class ResourceType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "type_id")
    private Integer typeId;

    @Column(name = "type_name", length = 50)
    private String typeName;
}

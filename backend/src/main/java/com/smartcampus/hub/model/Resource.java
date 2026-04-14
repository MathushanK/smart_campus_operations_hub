package com.smartcampus.hub.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "resources")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private Integer resourceId;

    @NotBlank(message = "Resource name is required")
    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "type_id")
    private ResourceType resourceType;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "location", length = 255)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(name = "availability_start")
    private LocalTime availabilityStart;

    @Column(name = "availability_end")
    private LocalTime availabilityEnd;

    public enum Status {
        ACTIVE, OUT_OF_SERVICE
    }
}

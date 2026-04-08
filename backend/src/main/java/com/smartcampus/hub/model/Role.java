package com.smartcampus.hub.model;

import jakarta.persistence.*;

@Entity
@Table(name = "roles") // ✅ important (matches DB table)
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false) // ✅ avoid duplicates
    private String name;

    // ✅ Constructors
    public Role() {}

    public Role(String name) {
        this.name = name;
    }

    // ✅ Getters & Setters
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
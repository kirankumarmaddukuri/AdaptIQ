package com.adaptivelearning.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashMap;
import java.util.Map;

@Document(collection = "competencies")
public class Competency {
    @Id
    private String id;
    private String name;
    private String description;
    private Map<String, String> benchmarks = new HashMap<>(); // "NOVICE", "INTERMEDIATE", "EXPERT"

    public Competency() {}

    public Competency(String id, String name, String description, String novice, String intermediate, String expert) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.benchmarks.put("NOVICE", novice);
        this.benchmarks.put("INTERMEDIATE", intermediate);
        this.benchmarks.put("EXPERT", expert);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Map<String, String> getBenchmarks() { return benchmarks; }
    public void setBenchmarks(Map<String, String> benchmarks) { this.benchmarks = benchmarks; }
}

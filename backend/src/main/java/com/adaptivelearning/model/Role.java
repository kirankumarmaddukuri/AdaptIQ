package com.adaptivelearning.model;

import java.util.ArrayList;
import java.util.List;

public class Role {
    private String id;
    private String name;
    private String category;
    private String description;
    private String icon;
    private List<String> competencies = new ArrayList<>();

    public Role() {}

    public Role(String id, String name, String category, String description, String icon, List<String> competencies) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.icon = icon;
        this.competencies = competencies;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public List<String> getCompetencies() { return competencies; }
    public void setCompetencies(List<String> competencies) { this.competencies = competencies; }
}

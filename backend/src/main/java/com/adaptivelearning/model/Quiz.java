package com.adaptivelearning.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Quiz {
    private String id;
    private String userId;
    private String roleId;
    private String roleName;
    private String type; // "DIAGNOSTIC", "CHECKPOINT"
    private String targetCompetency; // Populated if CHECKPOINT
    private List<Question> questions = new ArrayList<>();
    private LocalDateTime generatedAt = LocalDateTime.now();

    public Quiz() {}

    public Quiz(String id, String userId, String roleId, String roleName, String type) {
        this.id = id;
        this.userId = userId;
        this.roleId = roleId;
        this.roleName = roleName;
        this.type = type;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getRoleId() { return roleId; }
    public void setRoleId(String roleId) { this.roleId = roleId; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTargetCompetency() { return targetCompetency; }
    public void setTargetCompetency(String targetCompetency) { this.targetCompetency = targetCompetency; }

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}

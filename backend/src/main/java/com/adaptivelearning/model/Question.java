package com.adaptivelearning.model;

import java.util.ArrayList;
import java.util.List;

public class Question {
    private int id;
    private String text;
    private List<String> options = new ArrayList<>();
    private int correctOptionIndex; // 0-3
    private String difficulty; // "EASY", "MEDIUM", "HARD"
    private String competency;
    private String explanation;

    public Question() {}

    public Question(int id, String text, List<String> options, int correctOptionIndex, String difficulty, String competency, String explanation) {
        this.id = id;
        this.text = text;
        this.options = options;
        this.correctOptionIndex = correctOptionIndex;
        this.difficulty = difficulty;
        this.competency = competency;
        this.explanation = explanation;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public int getCorrectOptionIndex() { return correctOptionIndex; }
    public void setCorrectOptionIndex(int correctOptionIndex) { this.correctOptionIndex = correctOptionIndex; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getCompetency() { return competency; }
    public void setCompetency(String competency) { this.competency = competency; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}

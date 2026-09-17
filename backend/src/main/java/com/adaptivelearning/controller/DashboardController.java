package com.adaptivelearning.controller;

import com.adaptivelearning.model.DashboardStats;
import com.adaptivelearning.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/dashboard", "/api/dashboards"})
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping({"", "/"})
    public ResponseEntity<DashboardStats> getDefaultDashboard(@RequestParam(defaultValue = "user-demo-1") String userId) {
        DashboardStats stats = dashboardService.getDashboardData(userId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<DashboardStats> getDashboard(@PathVariable String userId) {
        DashboardStats stats = dashboardService.getDashboardData(userId);
        return ResponseEntity.ok(stats);
    }
}


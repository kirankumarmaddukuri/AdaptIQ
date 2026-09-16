package com.adaptivelearning.controller;

import com.adaptivelearning.model.DashboardStats;
import com.adaptivelearning.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<DashboardStats> getDashboard(@PathVariable String userId) {
        DashboardStats stats = dashboardService.getDashboardData(userId);
        return ResponseEntity.ok(stats);
    }
}

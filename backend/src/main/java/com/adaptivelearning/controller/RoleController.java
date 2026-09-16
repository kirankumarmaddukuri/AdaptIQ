package com.adaptivelearning.controller;

import com.adaptivelearning.model.Competency;
import com.adaptivelearning.model.Role;
import com.adaptivelearning.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @GetMapping("/{roleId}")
    public ResponseEntity<Role> getRoleById(@PathVariable String roleId) {
        Role role = roleService.getRoleById(roleId);
        if (role == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(role);
    }

    @GetMapping("/{roleId}/competencies")
    public ResponseEntity<List<Competency>> getRoleCompetencies(@PathVariable String roleId) {
        return ResponseEntity.ok(roleService.getCompetenciesForRole(roleId));
    }
}

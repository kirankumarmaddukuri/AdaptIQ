package com.adaptivelearning.controller;

import com.adaptivelearning.model.User;
import com.adaptivelearning.repository.DataStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final DataStore dataStore;

    public AuthController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    @PostMapping("/verify")
    public ResponseEntity<User> verifyAuth(@RequestBody Map<String, String> request) {
        String email = request.getOrDefault("email", "alex.chen@enterprise.io");
        String displayName = request.getOrDefault("displayName", "Alex Chen");
        String uid = request.getOrDefault("uid", "user-" + Math.abs(email.hashCode()));

        User user = dataStore.getUser(uid);
        if (user == null) {
            user = new User(uid, email, displayName);
            dataStore.saveUser(user);
        }

        return ResponseEntity.ok(user);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String displayName = request.get("displayName");
        String password = request.get("password");
        String roleId = request.get("roleId");

        if (email == null || displayName == null || password == null || roleId == null || password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name, email, role, and a password of at least 6 characters are required."));
        }
        if (dataStore.getUserByEmail(email) != null) {
            return ResponseEntity.status(409).body(Map.of("message", "An account already exists for this email."));
        }
        if (dataStore.getRole(roleId) == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please select a valid role."));
        }

        User user = new User("user-" + UUID.randomUUID().toString().substring(0, 8), email, displayName);
        user.setRoleId(roleId);
        user.setRoleName(dataStore.getRole(roleId).getName());
        dataStore.saveUser(user);
        dataStore.setPassword(user.getId(), password);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        User user = dataStore.getUserByEmail(request.get("email"));
        if (user == null || !dataStore.passwordMatches(user.getId(), request.get("password"))) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password."));
        }
        return ResponseEntity.ok(user);
    }
}

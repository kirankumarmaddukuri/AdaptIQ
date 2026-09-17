package com.adaptivelearning.controller;

import com.adaptivelearning.model.User;
import com.adaptivelearning.repository.DataStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/users", "/api/user"})
public class UserController {

    private final DataStore dataStore;

    public UserController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    @GetMapping
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(new ArrayList<>(dataStore.getUsers().values()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(new ArrayList<>(dataStore.getUsers().values()));
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@RequestParam(defaultValue = "user-demo-1") String userId) {
        User user = dataStore.getUser(userId);
        if (user == null) {
            user = dataStore.getUsers().values().iterator().next();
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable String userId) {
        User user = dataStore.getUser(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        User user = dataStore.getUser(userId);
        if (user == null) {
            user = new User(userId, payload.get("email"), payload.get("displayName"));
        }

        if (payload.containsKey("roleId")) user.setRoleId(payload.get("roleId"));
        if (payload.containsKey("roleName")) user.setRoleName(payload.get("roleName"));
        if (payload.containsKey("displayName")) user.setDisplayName(payload.get("displayName"));

        dataStore.saveUser(user);
        return ResponseEntity.ok(user);
    }
}


package com.adaptivelearning.service;

import com.adaptivelearning.model.Competency;
import com.adaptivelearning.model.Role;
import com.adaptivelearning.repository.DataStore;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RoleService {

    private final DataStore dataStore;

    public RoleService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public List<Role> getAllRoles() {
        return new ArrayList<>(dataStore.getRoles().values());
    }

    public Role getRoleById(String roleId) {
        return dataStore.getRole(roleId);
    }

    public List<Competency> getCompetenciesForRole(String roleId) {
        Role role = dataStore.getRole(roleId);
        if (role == null) return List.of();

        List<Competency> result = new ArrayList<>();
        for (String compName : role.getCompetencies()) {
            Competency comp = dataStore.getCompetencies().get(compName);
            if (comp != null) {
                result.add(comp);
            }
        }
        return result;
    }
}

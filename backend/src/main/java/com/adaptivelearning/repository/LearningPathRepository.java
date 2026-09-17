package com.adaptivelearning.repository;

import com.adaptivelearning.model.LearningPath;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LearningPathRepository extends MongoRepository<LearningPath, String> {
    Optional<LearningPath> findByUserId(String userId);
    Optional<LearningPath> findByUserIdAndRoleId(String userId, String roleId);
}

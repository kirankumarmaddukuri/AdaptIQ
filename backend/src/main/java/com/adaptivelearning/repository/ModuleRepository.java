package com.adaptivelearning.repository;

import com.adaptivelearning.model.LearningModule;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleRepository extends MongoRepository<LearningModule, String> {
    List<LearningModule> findByCompetency(String competency);
}

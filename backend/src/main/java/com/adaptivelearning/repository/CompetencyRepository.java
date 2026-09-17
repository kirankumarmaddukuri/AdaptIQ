package com.adaptivelearning.repository;

import com.adaptivelearning.model.Competency;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompetencyRepository extends MongoRepository<Competency, String> {
    Optional<Competency> findByNameIgnoreCase(String name);
}

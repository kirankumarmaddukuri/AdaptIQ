package com.adaptivelearning.repository;

import com.adaptivelearning.model.ProgressRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressRecordRepository extends MongoRepository<ProgressRecord, String> {
    List<ProgressRecord> findByUserId(String userId);
}

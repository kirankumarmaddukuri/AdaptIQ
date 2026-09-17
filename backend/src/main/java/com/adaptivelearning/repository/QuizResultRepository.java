package com.adaptivelearning.repository;

import com.adaptivelearning.model.QuizResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuizResultRepository extends MongoRepository<QuizResult, String> {
    Optional<QuizResult> findByQuizId(String quizId);
}

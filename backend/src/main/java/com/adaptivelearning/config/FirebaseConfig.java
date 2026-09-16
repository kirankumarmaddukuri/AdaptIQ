package com.adaptivelearning.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.enabled:false}")
    private boolean firebaseEnabled;

    @Value("${firebase.service-account.path:classpath:firebase-service-account.json}")
    private String serviceAccountPath;

    @PostConstruct
    public void initializeFirebase() {
        if (!firebaseEnabled) {
            logger.info("Firebase Admin is configured in Local Resilient Mode. Tokens and data operations use integrated zero-latency data store.");
            return;
        }

        try {
            InputStream serviceAccount = getClass().getResourceAsStream("/firebase-service-account.json");
            if (serviceAccount == null) {
                logger.warn("Firebase service account JSON not found at {}. Running in local resilient mode.", serviceAccountPath);
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                logger.info("Firebase Admin SDK successfully initialized.");
            }
        } catch (Exception e) {
            logger.warn("Could not initialize Firebase Admin SDK: {}. Using local resilient mode.", e.getMessage());
        }
    }
}

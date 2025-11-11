package com.openclassrooms.starterjwt.security.jwt;

/**
 * Tests unitaires pour JwtUtils.
 * 
 * Cette classe teste l'utilitaire de gestion des tokens JWT :
 * - Génération de tokens JWT à partir d'une authentification
 * - Validation de tokens JWT (valides, expirés, malformés, non signés)
 * - Extraction du nom d'utilisateur depuis un token
 * - Gestion des erreurs de signature et d'expiration
 * 
 * Les tests utilisent ReflectionTestUtils pour injecter les propriétés
 * privées (jwtSecret, jwtExpirationMs) car JwtUtils est un composant Spring.
 * 
 * Couverture des cas :
 * - Tokens valides et invalides
 * - Tokens expirés
 * - Erreurs de signature
 * - Claims manquants ou vides
 */

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtUtils Unit Tests")
class JwtUtilsTest {

    @Mock
    private Authentication authentication;

    @InjectMocks
    private JwtUtils jwtUtils;

    private UserDetailsImpl userDetails;
    private String jwtSecret = "mySecretKey1234567890123456789012345678901234567890";
    private int jwtExpirationMs = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .admin(false)
                .build();

        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", jwtSecret);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", jwtExpirationMs);
    }

    @Test
    @DisplayName("Should generate JWT token successfully")
    void generateJwtToken_Success() {
        // Given
        when(authentication.getPrincipal()).thenReturn(userDetails);

        // When
        String token = jwtUtils.generateJwtToken(authentication);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts
    }

    @Test
    @DisplayName("Should extract username from JWT token")
    void getUserNameFromJwtToken_Success() {
        // Given
        when(authentication.getPrincipal()).thenReturn(userDetails);
        String token = jwtUtils.generateJwtToken(authentication);

        // When
        String username = jwtUtils.getUserNameFromJwtToken(token);

        // Then
        assertThat(username).isNotNull();
        assertThat(username).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("Should validate JWT token successfully")
    void validateJwtToken_ValidToken_ReturnsTrue() {
        // Given
        when(authentication.getPrincipal()).thenReturn(userDetails);
        String token = jwtUtils.generateJwtToken(authentication);

        // When
        boolean isValid = jwtUtils.validateJwtToken(token);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Should return false for malformed JWT token")
    void validateJwtToken_MalformedToken_ReturnsFalse() {
        // Given
        String malformedToken = "this.is.not.a.valid.token";

        // When
        boolean isValid = jwtUtils.validateJwtToken(malformedToken);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should return false for empty JWT token")
    void validateJwtToken_EmptyToken_ReturnsFalse() {
        // Given
        String emptyToken = "";

        // When
        boolean isValid = jwtUtils.validateJwtToken(emptyToken);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should return false for JWT token with invalid signature")
    void validateJwtToken_InvalidSignature_ReturnsFalse() {
        // Given
        String tokenWithWrongSignature = Jwts.builder()
                .setSubject("test@example.com")
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(SignatureAlgorithm.HS512, "wrongSecret")
                .compact();

        // When
        boolean isValid = jwtUtils.validateJwtToken(tokenWithWrongSignature);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should return false for expired JWT token")
    void validateJwtToken_ExpiredToken_ReturnsFalse() {
        // Given
        String expiredToken = Jwts.builder()
                .setSubject("test@example.com")
                .setIssuedAt(new Date(System.currentTimeMillis() - 10000))
                .setExpiration(new Date(System.currentTimeMillis() - 5000)) // expired 5 seconds ago
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();

        // When
        boolean isValid = jwtUtils.validateJwtToken(expiredToken);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should return false for unsupported JWT token")
    void validateJwtToken_UnsupportedToken_ReturnsFalse() {
        // Given
        String unsupportedToken = Jwts.builder()
                .setSubject("test@example.com")
                .compact(); // No signature

        // When
        boolean isValid = jwtUtils.validateJwtToken(unsupportedToken);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should generate different tokens for different users")
    void generateJwtToken_DifferentUsers_GenerateDifferentTokens() {
        // Given
        UserDetailsImpl user1 = UserDetailsImpl.builder()
                .id(1L)
                .username("user1@example.com")
                .firstName("User")
                .lastName("One")
                .password("password1")
                .admin(false)
                .build();

        UserDetailsImpl user2 = UserDetailsImpl.builder()
                .id(2L)
                .username("user2@example.com")
                .firstName("User")
                .lastName("Two")
                .password("password2")
                .admin(false)
                .build();

        when(authentication.getPrincipal()).thenReturn(user1).thenReturn(user2);

        // When
        String token1 = jwtUtils.generateJwtToken(authentication);
        String token2 = jwtUtils.generateJwtToken(authentication);

        // Then
        assertThat(token1).isNotEqualTo(token2);
        
        String username1 = jwtUtils.getUserNameFromJwtToken(token1);
        String username2 = jwtUtils.getUserNameFromJwtToken(token2);
        
        assertThat(username1).isEqualTo("user1@example.com");
        assertThat(username2).isEqualTo("user2@example.com");
    }

    @Test
    @DisplayName("Should handle token with special characters in username")
    void generateJwtToken_SpecialCharacters_Success() {
        // Given
        UserDetailsImpl specialUser = UserDetailsImpl.builder()
                .id(1L)
                .username("user+tag@example.co.uk")
                .firstName("Special")
                .lastName("User")
                .password("password")
                .admin(false)
                .build();

        when(authentication.getPrincipal()).thenReturn(specialUser);

        // When
        String token = jwtUtils.generateJwtToken(authentication);
        String username = jwtUtils.getUserNameFromJwtToken(token);

        // Then
        assertThat(username).isEqualTo("user+tag@example.co.uk");
    }
}

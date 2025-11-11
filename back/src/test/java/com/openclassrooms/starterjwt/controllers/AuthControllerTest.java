package com.openclassrooms.starterjwt.controllers;

/**
 * Tests unitaires pour AuthController.
 * 
 * Cette classe teste les endpoints d'authentification :
 * - POST /api/auth/login : Authentification d'un utilisateur
 * - POST /api/auth/register : Inscription d'un nouvel utilisateur
 * 
 * Les tests vérifient :
 * - La génération correcte des tokens JWT lors de l'authentification
 * - L'enregistrement des nouveaux utilisateurs
 * - La gestion des cas d'erreur (email déjà existant)
 * - L'encodage des mots de passe
 */

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.payload.response.MessageResponse;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthController Unit Tests")
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthController authController;

    private LoginRequest loginRequest;
    private SignupRequest signupRequest;
    private User user;
    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        signupRequest = new SignupRequest();
        signupRequest.setEmail("newuser@example.com");
        signupRequest.setFirstName("John");
        signupRequest.setLastName("Doe");
        signupRequest.setPassword("password123");

        user = User.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .password("encodedPassword")
                .admin(false)
                .build();

        userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("test@example.com")
                .firstName("Test")
                .lastName("User")
                .password("encodedPassword")
                .admin(false)
                .build();
    }

    @Test
    @DisplayName("Should authenticate user successfully and return JWT token")
    void authenticateUser_Success() {
        // Given - Préparation des mocks pour une authentification réussie
        String jwtToken = "jwt.token.here";
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn(jwtToken);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        // When - Appel de la méthode d'authentification
        ResponseEntity<?> response = authController.authenticateUser(loginRequest);

        // Then - Vérification de la réponse et du token JWT
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isInstanceOf(JwtResponse.class);
        
        JwtResponse jwtResponse = (JwtResponse) response.getBody();
        assertThat(jwtResponse).isNotNull();
        assertThat(jwtResponse.getToken()).isEqualTo(jwtToken);
        assertThat(jwtResponse.getId()).isEqualTo(1L);
        assertThat(jwtResponse.getUsername()).isEqualTo("test@example.com");
        assertThat(jwtResponse.getFirstName()).isEqualTo("Test");
        assertThat(jwtResponse.getLastName()).isEqualTo("User");
        assertThat(jwtResponse.getAdmin()).isFalse();

        // Vérification que les services ont bien été appelés
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils, times(1)).generateJwtToken(authentication);
        verify(userRepository, times(1)).findByEmail("test@example.com");
    }

    @Test
    @DisplayName("Should authenticate admin user successfully")
    void authenticateUser_AdminUser_Success() {
        // Given - Préparation d'un utilisateur admin
        String jwtToken = "jwt.token.here";
        
        // Création d'un utilisateur admin dans la base
        User adminUser = User.builder()
                .id(1L)
                .email("admin@example.com")
                .firstName("Admin")
                .lastName("User")
                .password("encodedPassword")
                .admin(true)
                .build();
        
        // Création des détails Spring Security pour l'admin
        UserDetailsImpl adminUserDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("admin@example.com")
                .firstName("Admin")
                .lastName("User")
                .password("encodedPassword")
                .admin(true)
                .build();

        // Modification de la requête pour l'email admin
        loginRequest.setEmail("admin@example.com");
        
        // Configuration des mocks pour retourner l'utilisateur admin
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(adminUserDetails);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn(jwtToken);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(adminUser));

        // When - Appel de l'authentification
        ResponseEntity<?> response = authController.authenticateUser(loginRequest);

        // Then - Vérification que l'admin flag est bien à true
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        JwtResponse jwtResponse = (JwtResponse) response.getBody();
        assertThat(jwtResponse).isNotNull();
        assertThat(jwtResponse.getAdmin()).isTrue();
    }

    @Test
    @DisplayName("Should handle authentication when user not found in repository")
    void authenticateUser_UserNotFoundInRepo() {
        // Given - Configuration pour un utilisateur qui n'existe pas en base
        String jwtToken = "jwt.token.here";
        
        // Mock de l'authentification réussie malgré l'absence en base
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn(jwtToken);
        // Simulation d'un utilisateur non trouvé en base
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When - Tentative d'authentification
        ResponseEntity<?> response = authController.authenticateUser(loginRequest);

        // Then - Vérification que l'admin est false par défaut quand user non trouvé
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        JwtResponse jwtResponse = (JwtResponse) response.getBody();
        assertThat(jwtResponse).isNotNull();
        assertThat(jwtResponse.getAdmin()).isFalse();
    }

    @Test
    @DisplayName("Should register new user successfully")
    void registerUser_Success() {
        // Given - Configuration pour l'inscription d'un nouvel utilisateur
        // Vérification que l'email n'existe pas déjà
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        // Mock de l'encodage du mot de passe
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        // Mock de la sauvegarde en base
        when(userRepository.save(any(User.class))).thenReturn(user);

        // When - Appel de l'inscription
        ResponseEntity<?> response = authController.registerUser(signupRequest);

        // Then - Vérification que l'inscription a réussi
        // Vérification du code statut HTTP 200 OK
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        // Vérification que le corps de la réponse est un MessageResponse
        assertThat(response.getBody()).isInstanceOf(MessageResponse.class);
        
        MessageResponse messageResponse = (MessageResponse) response.getBody();
        assertThat(messageResponse).isNotNull();
        // Vérification du message de succès
        assertThat(messageResponse.getMessage()).isEqualTo("User registered successfully!");

        // Vérification que les bonnes méthodes ont été appelées
        verify(userRepository, times(1)).existsByEmail("newuser@example.com");
        verify(passwordEncoder, times(1)).encode("password123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should fail to register user when email already exists")
    void registerUser_EmailAlreadyExists() {
        // Given - Configuration pour un email déjà existant
        // Simulation d'un email déjà présent en base
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // When - Tentative d'inscription avec email existant
        ResponseEntity<?> response = authController.registerUser(signupRequest);

        // Then - Vérification du refus d'inscription
        // Vérification du code statut HTTP 400 Bad Request
        assertThat(response.getStatusCodeValue()).isEqualTo(400);
        // Vérification que le corps de la réponse est un MessageResponse
        assertThat(response.getBody()).isInstanceOf(MessageResponse.class);
        
        MessageResponse messageResponse = (MessageResponse) response.getBody();
        assertThat(messageResponse).isNotNull();
        // Vérification du message d'erreur
        assertThat(messageResponse.getMessage()).isEqualTo("Error: Email is already taken!");

        // Vérification que les méthodes non nécessaires n'ont pas été appelées
        verify(userRepository, times(1)).existsByEmail("newuser@example.com");
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should encode password correctly during registration")
    void registerUser_PasswordEncodedCorrectly() {
        // Given - Configuration pour vérifier l'encodage du mot de passe
        String rawPassword = "password123";
        String encodedPassword = "encodedPassword123";
        
        // L'email n'existe pas en base
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        // Configuration du mock pour retourner le mot de passe encodé
        when(passwordEncoder.encode(rawPassword)).thenReturn(encodedPassword);
        // Vérification lors de la sauvegarde que le mot de passe est bien encodé
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            assertThat(savedUser.getPassword()).isEqualTo(encodedPassword);
            return savedUser;
        });

        // Modification du mot de passe dans la requête
        signupRequest.setPassword(rawPassword);

        // When - Appel de l'inscription
        authController.registerUser(signupRequest);

        // Then - Vérification que l'encodeur a été appelé avec le bon mot de passe
        verify(passwordEncoder, times(1)).encode(rawPassword);
    }
}

package com.openclassrooms.starterjwt.security.jwt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthEntryPointJwt Unit Tests")
class AuthEntryPointJwtTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private ServletOutputStream outputStream;

    @InjectMocks
    private AuthEntryPointJwt authEntryPointJwt;

    private AuthenticationException authException;

    @BeforeEach
    void setUp() {
        authException = new BadCredentialsException("Unauthorized");
    }

    @Test
    @DisplayName("Should commence with unauthorized error")
    void commence_UnauthorizedError() throws IOException, ServletException {
        // Given
        when(request.getServletPath()).thenReturn("/api/test");
        when(response.getOutputStream()).thenReturn(outputStream);

        // When
        authEntryPointJwt.commence(request, response, authException);

        // Then
        verify(response, times(1)).setContentType(MediaType.APPLICATION_JSON_VALUE);
        verify(response, times(1)).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(response, times(1)).getOutputStream();
    }

    @Test
    @DisplayName("Should set correct status code")
    void commence_SetsCorrectStatusCode() throws IOException, ServletException {
        // Given
        when(request.getServletPath()).thenReturn("/api/test");
        when(response.getOutputStream()).thenReturn(outputStream);

        // When
        authEntryPointJwt.commence(request, response, authException);

        // Then
        verify(response, times(1)).setStatus(401);
    }

    @Test
    @DisplayName("Should set correct content type")
    void commence_SetsCorrectContentType() throws IOException, ServletException {
        // Given
        when(request.getServletPath()).thenReturn("/api/test");
        when(response.getOutputStream()).thenReturn(outputStream);

        // When
        authEntryPointJwt.commence(request, response, authException);

        // Then
        verify(response, times(1)).setContentType("application/json");
    }

    @Test
    @DisplayName("Should handle different authentication exception messages")
    void commence_DifferentExceptionMessages() throws IOException, ServletException {
        // Given
        AuthenticationException customException = new BadCredentialsException("Custom error message");
        when(request.getServletPath()).thenReturn("/api/custom");
        when(response.getOutputStream()).thenReturn(outputStream);

        // When
        authEntryPointJwt.commence(request, response, customException);

        // Then
        verify(response, times(1)).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(response, times(1)).getOutputStream();
    }

    @Test
    @DisplayName("Should handle different servlet paths")
    void commence_DifferentServletPaths() throws IOException, ServletException {
        // Given
        when(request.getServletPath()).thenReturn("/api/auth/login");
        when(response.getOutputStream()).thenReturn(outputStream);

        // When
        authEntryPointJwt.commence(request, response, authException);

        // Then
        verify(request, times(1)).getServletPath();
        verify(response, times(1)).getOutputStream();
    }
}

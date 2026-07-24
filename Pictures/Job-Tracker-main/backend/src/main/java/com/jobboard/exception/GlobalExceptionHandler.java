package com.jobboard.exception;

import com.jobboard.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Centralized exception handling for the whole API.
 * Every error response follows the same ErrorResponse shape so the
 * frontend can rely on a single, predictable contract.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ---- Validation errors (400) ----
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex,
                                                            HttpServletRequest request) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe ->
                fieldErrors.put(fe.getField(), fe.getDefaultMessage()));

        ErrorResponse body = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Validation failed for one or more fields")
                .path(request.getRequestURI())
                .validationErrors(fieldErrors)
                .build();
        return ResponseEntity.badRequest().body(body);
    }

    // ---- Domain: not found (404) ----
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex,
                                                          HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // ---- Domain: duplicate (409) ----
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DuplicateResourceException ex,
                                                           HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    // ---- Domain: bad login credentials (401) ----
    @ExceptionHandler(com.jobboard.exception.BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(com.jobboard.exception.BadCredentialsException ex,
                                                                HttpServletRequest request) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    // ---- Spring Security: bad login credentials (401) ----
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleSecurityBadCredentials(BadCredentialsException ex,
                                                                        HttpServletRequest request) {
        return build(HttpStatus.UNAUTHORIZED, "Invalid email or password", request);
    }

    // ---- Domain: forbidden action / not the owner (403) ----
    @ExceptionHandler(UnauthorizedActionException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedAction(UnauthorizedActionException ex,
                                                                    HttpServletRequest request) {
        return build(HttpStatus.FORBIDDEN, ex.getMessage(), request);
    }

    // ---- Spring Security: access denied via @PreAuthorize (403) ----
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex,
                                                              HttpServletRequest request) {
        return build(HttpStatus.FORBIDDEN, "You do not have permission to perform this action", request);
    }

    // ---- Safety net: anything unexpected (500) ----
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        logger.error("Unhandled exception at {}", request.getRequestURI(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", request);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message, HttpServletRequest request) {
        ErrorResponse body = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .validationErrors(null)
                .build();
        return ResponseEntity.status(status).body(body);
    }
}

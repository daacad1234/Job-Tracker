package com.jobboard.exception;

/**
 * Thrown when an authenticated user tries to act on a resource
 * they don't own (e.g. editing another employer's job posting).
 */
public class UnauthorizedActionException extends RuntimeException {
    public UnauthorizedActionException(String message) {
        super(message);
    }
}

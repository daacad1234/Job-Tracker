package com.jobboard.service;

import com.jobboard.dto.request.LoginRequest;
import com.jobboard.dto.request.RegisterRequest;
import com.jobboard.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}

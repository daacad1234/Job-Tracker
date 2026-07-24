package com.jobboard.service.impl;

import com.jobboard.dto.request.LoginRequest;
import com.jobboard.dto.request.RegisterRequest;
import com.jobboard.dto.response.AuthResponse;
import com.jobboard.dto.response.UserResponse;
import com.jobboard.exception.BadCredentialsException;
import com.jobboard.exception.DuplicateResourceException;
import com.jobboard.exception.UnauthorizedActionException;
import com.jobboard.model.Role;
import com.jobboard.model.User;
import com.jobboard.repository.UserRepository;
import com.jobboard.security.JwtUtil;
import com.jobboard.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with email '" + request.getEmail() + "' already exists");
        }

        // Security fix: the public registration endpoint must never let a caller
        // hand themselves ADMIN privileges. Admin accounts are created as
        // APPLICANT/EMPLOYER and promoted later by an existing admin via
        // PUT /api/users/{id}/role.
        if (request.getRole() == Role.ADMIN) {
            throw new UnauthorizedActionException("You cannot self-register as an admin");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        User saved = userRepository.save(user);

        String token = jwtUtil.generateToken(saved.getEmail(), saved.getId(), saved.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(toUserResponse(saved))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(toUserResponse(user))
                .build();
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

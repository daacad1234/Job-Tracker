package com.jobboard.service.impl;

import com.jobboard.dto.response.UserResponse;
import com.jobboard.exception.ResourceNotFoundException;
import com.jobboard.model.Role;
import com.jobboard.model.User;
import com.jobboard.repository.UserRepository;
import com.jobboard.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAll() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public UserResponse updateRole(Long id, Role newRole) {
        User user = findOrThrow(id);
        user.setRole(newRole);
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = findOrThrow(id);
        userRepository.delete(user);
    }

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }

    private UserResponse toResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .role(u.getRole())
                .createdAt(u.getCreatedAt())
                .build();
    }
}

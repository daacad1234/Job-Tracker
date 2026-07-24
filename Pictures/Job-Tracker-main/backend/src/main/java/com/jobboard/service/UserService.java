package com.jobboard.service;

import com.jobboard.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    List<UserResponse> getAll();
    UserResponse getById(Long id);
    UserResponse updateRole(Long id, com.jobboard.model.Role newRole);
    void delete(Long id);
}

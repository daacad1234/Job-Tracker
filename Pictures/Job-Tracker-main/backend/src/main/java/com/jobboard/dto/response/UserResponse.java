package com.jobboard.dto.response;

import com.jobboard.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private LocalDateTime createdAt;
}

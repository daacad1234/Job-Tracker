package com.jobboard.controller;

import com.jobboard.dto.request.UpdateUserRoleRequest;
import com.jobboard.dto.response.UserResponse;
import com.jobboard.exception.UnauthorizedActionException;
import com.jobboard.security.UserPrincipal;
import com.jobboard.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// This controller did not exist at all before, which is why GET /api/users had
// no handler and every call to it from the admin dashboard failed.
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    // Any authenticated user can fetch their own profile; admins can fetch anyone's.
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        boolean isSelf = principal.getId().equals(id);
        boolean isAdmin = "ADMIN".equals(principal.getRole());
        if (!isSelf && !isAdmin) {
            throw new UnauthorizedActionException("You can only view your own profile");
        }
        return ResponseEntity.ok(userService.getById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getById(principal.getId()));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateRole(@PathVariable Long id,
                                                    @Valid @RequestBody UpdateUserRoleRequest request) {
        return ResponseEntity.ok(userService.updateRole(id, request.getRole()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        if (principal.getId().equals(id)) {
            throw new UnauthorizedActionException("You cannot delete your own admin account");
        }
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

package com.jobboard.controller;

import com.jobboard.dto.request.ApplicationRequest;
import com.jobboard.dto.request.ApplicationStatusUpdateRequest;
import com.jobboard.dto.response.ApplicationResponse;
import com.jobboard.security.UserPrincipal;
import com.jobboard.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    // Admin-only: list every application on the platform. This endpoint didn't
    // exist before, so the admin dashboard's call to GET /api/applications had
    // no handler to hit.
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ApplicationResponse>> getAll() {
        return ResponseEntity.ok(applicationService.getAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<ApplicationResponse> apply(@Valid @RequestBody ApplicationRequest request,
                                                       @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.apply(request, principal.getId()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<List<ApplicationResponse>> myApplications(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(applicationService.getMyApplications(principal.getId()));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public ResponseEntity<List<ApplicationResponse>> forJob(@PathVariable Long jobId,
                                                              @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(applicationService.getApplicationsForJob(jobId, principal.getId(), principal.getRole()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public ResponseEntity<ApplicationResponse> updateStatus(@PathVariable Long id,
                                                              @Valid @RequestBody ApplicationStatusUpdateRequest request,
                                                              @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(applicationService.updateStatus(id, request, principal.getId(), principal.getRole()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('APPLICANT')")
    public ResponseEntity<Void> withdraw(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        applicationService.withdraw(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}

package com.jobboard.controller;

import com.jobboard.dto.request.JobRequest;
import com.jobboard.dto.response.JobResponse;
import com.jobboard.security.UserPrincipal;
import com.jobboard.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    // Public: browse/search open jobs. Supports optional filters.
    // A logged-in admin hitting this same endpoint sees every job regardless of
    // status or company-approval state, since the existing admin dashboard calls
    // plain GET /api/jobs rather than a separate admin-only route.
    @GetMapping
    public ResponseEntity<List<JobResponse>> search(@RequestParam(required = false) Long categoryId,
                                                      @RequestParam(required = false) String location,
                                                      @RequestParam(required = false) String keyword,
                                                      @AuthenticationPrincipal(errorOnInvalidType = false) UserPrincipal principal) {
        boolean isAdmin = principal != null && "ADMIN".equals(principal.getRole());
        return ResponseEntity.ok(jobService.search(categoryId, location, keyword, isAdmin));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getById(id));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<JobResponse>> getByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(jobService.getByCompany(companyId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public ResponseEntity<JobResponse> create(@Valid @RequestBody JobRequest request,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        JobResponse created = jobService.create(request, principal.getId(), principal.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public ResponseEntity<JobResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody JobRequest request,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(jobService.update(id, request, principal.getId(), principal.getRole()));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public ResponseEntity<JobResponse> close(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(jobService.closeJob(id, principal.getId(), principal.getRole()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        jobService.delete(id, principal.getId(), principal.getRole());
        return ResponseEntity.noContent().build();
    }
}

package com.jobboard.controller;

import com.jobboard.dto.request.CompanyRequest;
import com.jobboard.dto.response.CompanyResponse;
import com.jobboard.security.UserPrincipal;
import com.jobboard.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    // Public: only APPROVED companies are visible to anonymous/non-admin callers.
    // A logged-in admin hitting this same endpoint sees every company regardless
    // of status, so the existing admin dashboard (which calls plain GET /api/companies)
    // gets full visibility without needing a separate route.
    @GetMapping
    public ResponseEntity<List<CompanyResponse>> getAll(
            @AuthenticationPrincipal(errorOnInvalidType = false) UserPrincipal principal) {
        boolean isAdmin = principal != null && "ADMIN".equals(principal.getRole());
        return ResponseEntity.ok(companyService.getAll(isAdmin));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getById(id));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public ResponseEntity<List<CompanyResponse>> getMine(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(companyService.getMine(principal.getId()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public ResponseEntity<CompanyResponse> create(@Valid @RequestBody CompanyRequest request,
                                                   @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(companyService.create(request, principal.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public ResponseEntity<CompanyResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody CompanyRequest request,
                                                   @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(companyService.update(id, request, principal.getId(), principal.getRole()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        companyService.delete(id, principal.getId(), principal.getRole());
        return ResponseEntity.noContent().build();
    }

    // ---- Admin moderation ----

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.approve(id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.reject(id));
    }
}

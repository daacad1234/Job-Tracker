package com.jobboard.controller;

import com.jobboard.dto.response.SavedJobResponse;
import com.jobboard.security.UserPrincipal;
import com.jobboard.service.SavedJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-jobs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('APPLICANT')")
public class SavedJobController {

    private final SavedJobService savedJobService;

    @GetMapping
    public ResponseEntity<List<SavedJobResponse>> myBookmarks(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(savedJobService.getMine(principal.getId()));
    }

    @PostMapping("/{jobId}")
    public ResponseEntity<SavedJobResponse> save(@PathVariable Long jobId,
                                                  @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(savedJobService.save(jobId, principal.getId()));
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<Void> unsave(@PathVariable Long jobId, @AuthenticationPrincipal UserPrincipal principal) {
        savedJobService.unsave(jobId, principal.getId());
        return ResponseEntity.noContent().build();
    }
}

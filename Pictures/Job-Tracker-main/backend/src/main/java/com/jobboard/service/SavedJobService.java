package com.jobboard.service;

import com.jobboard.dto.response.SavedJobResponse;

import java.util.List;

public interface SavedJobService {
    SavedJobResponse save(Long jobId, Long userId);
    void unsave(Long jobId, Long userId);
    List<SavedJobResponse> getMine(Long userId);
}

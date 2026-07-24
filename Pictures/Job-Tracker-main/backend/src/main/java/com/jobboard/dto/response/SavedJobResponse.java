package com.jobboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class SavedJobResponse {
    private Long id;
    private JobResponse job;
    private LocalDateTime savedAt;
}

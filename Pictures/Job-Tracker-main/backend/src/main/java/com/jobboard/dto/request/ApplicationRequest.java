package com.jobboard.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationRequest {

    @NotNull(message = "Job ID is required")
    private Long jobId;

    @NotBlank(message = "Resume URL is required")
    @Size(max = 255, message = "Resume URL must be at most 255 characters")
    private String resumeUrl;

    @Size(max = 2000, message = "Cover letter must be at most 2000 characters")
    private String coverLetter;
}

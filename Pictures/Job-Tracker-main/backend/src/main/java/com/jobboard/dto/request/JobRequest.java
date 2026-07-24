package com.jobboard.dto.request;

import com.jobboard.model.EmploymentType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class JobRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must be at most 150 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 4000, message = "Description must be at most 4000 characters")
    private String description;

    @Size(max = 4000, message = "Requirements must be at most 4000 characters")
    private String requirements;

    @NotBlank(message = "Location is required")
    @Size(max = 150, message = "Location must be at most 150 characters")
    private String location;

    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;

    @PositiveOrZero(message = "Minimum salary must be zero or positive")
    private BigDecimal salaryMin;

    @PositiveOrZero(message = "Maximum salary must be zero or positive")
    private BigDecimal salaryMax;

    @Future(message = "Deadline must be a future date")
    private LocalDate deadline;

    @NotNull(message = "Company ID is required")
    private Long companyId;

    @NotNull(message = "Category ID is required")
    private Long categoryId;
}

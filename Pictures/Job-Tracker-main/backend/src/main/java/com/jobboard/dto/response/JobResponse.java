package com.jobboard.dto.response;

import com.jobboard.model.EmploymentType;
import com.jobboard.model.JobStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class JobResponse {
    private Long id;
    private String title;
    private String description;
    private String requirements;
    private String location;
    private EmploymentType employmentType;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private JobStatus status;
    private LocalDate deadline;
    private LocalDateTime postedAt;
    private Long companyId;
    private String companyName;
    private Long categoryId;
    private String categoryName;
    private long applicationCount;
}

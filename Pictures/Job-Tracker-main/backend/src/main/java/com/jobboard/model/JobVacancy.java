package com.jobboard.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_vacancies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobVacancy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 4000)
    private String description;

    @Column(length = 4000)
    private String requirements;

    @Column(nullable = false, length = 150)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EmploymentType employmentType;

    @Column(precision = 12, scale = 2)
    private BigDecimal salaryMin;

    @Column(precision = 12, scale = 2)
    private BigDecimal salaryMax;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private JobStatus status = JobStatus.OPEN;

    private LocalDate deadline;

    @Column(nullable = false, updatable = false)
    private LocalDateTime postedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @PrePersist
    protected void onCreate() {
        this.postedAt = LocalDateTime.now();
    }
}

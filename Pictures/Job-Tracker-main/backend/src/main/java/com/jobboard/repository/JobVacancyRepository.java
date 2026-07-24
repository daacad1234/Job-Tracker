package com.jobboard.repository;

import com.jobboard.model.JobStatus;
import com.jobboard.model.JobVacancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobVacancyRepository extends JpaRepository<JobVacancy, Long> {

    List<JobVacancy> findByCompanyId(Long companyId);

    List<JobVacancy> findByStatus(JobStatus status);

    // ROOT CAUSE OF THE "function lower(bytea) does not exist" ERROR:
    // When :location / :keyword are passed in as null (i.e. no search term typed),
    // Hibernate can't infer a SQL type for the parameter used inside CONCAT(), so
    // pgjdbc falls back to sending it untyped, which Postgres treats as bytea.
    // lower(bytea) has no matching overload, so every request with an empty filter
    // crashed with a 500. Explicitly casting each parameter with `CAST(:x AS string)`
    // forces Hibernate to always bind it as varchar, null or not, which fixes it for
    // good instead of just working around a particular caller.
    //
    // This also now only returns jobs from APPROVED companies for public (non-admin)
    // callers, so a pending/unapproved employer's postings aren't publicly listed
    // until their company profile is approved.
    @Query("""
            SELECT j FROM JobVacancy j
            WHERE j.status = com.jobboard.model.JobStatus.OPEN
            AND j.company.status = com.jobboard.model.CompanyStatus.APPROVED
            AND (:category IS NULL OR j.category.id = :category)
            AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', CAST(:location AS string), '%')))
            AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
            ORDER BY j.postedAt DESC
            """)
    List<JobVacancy> search(@Param("category") Long category,
                             @Param("location") String location,
                             @Param("keyword") String keyword);

    // Admin variant: no status/company-approval restriction, so admins can see
    // every job (open, closed, pending-company) from the same filters.
    @Query("""
            SELECT j FROM JobVacancy j
            WHERE (:category IS NULL OR j.category.id = :category)
            AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', CAST(:location AS string), '%')))
            AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
            ORDER BY j.postedAt DESC
            """)
    List<JobVacancy> searchAdmin(@Param("category") Long category,
                                  @Param("location") String location,
                                  @Param("keyword") String keyword);
}

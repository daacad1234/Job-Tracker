package com.jobboard.repository;

import com.jobboard.model.Company;
import com.jobboard.model.CompanyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByOwnerId(Long ownerId);
    List<Company> findByStatus(CompanyStatus status);
}

package com.jobboard.dto.response;

import com.jobboard.model.CompanyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class CompanyResponse {
    private Long id;
    private String name;
    private String description;
    private String website;
    private String logoUrl;
    private Long ownerId;
    private String ownerName;
    private CompanyStatus status;
    private LocalDateTime createdAt;
}

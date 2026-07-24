package com.jobboard.service;

import com.jobboard.dto.request.CategoryRequest;
import com.jobboard.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse create(CategoryRequest request);
    List<CategoryResponse> getAll();
    void delete(Long id);
}

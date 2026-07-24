package com.jobboard.service.impl;

import com.jobboard.dto.request.CategoryRequest;
import com.jobboard.dto.response.CategoryResponse;
import com.jobboard.exception.DuplicateResourceException;
import com.jobboard.exception.ResourceNotFoundException;
import com.jobboard.model.Category;
import com.jobboard.repository.CategoryRepository;
import com.jobboard.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Category '" + request.getName() + "' already exists");
        }
        Category saved = categoryRepository.save(Category.builder().name(request.getName()).build());
        return toResponse(saved);
    }

    @Override
    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id));
        categoryRepository.delete(category);
    }

    private CategoryResponse toResponse(Category c) {
        return CategoryResponse.builder().id(c.getId()).name(c.getName()).build();
    }
}

package com.example.demo.repository;

import com.example.demo.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    // 1. Tìm kiếm theo tên (có phân trang)
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // 2. Các hàm cũ (giữ nguyên nếu cần dùng chỗ khác)
    List<Product> findByBrandId(Long brandId);
    List<Product> findByCategoryId(Long categoryId);
}
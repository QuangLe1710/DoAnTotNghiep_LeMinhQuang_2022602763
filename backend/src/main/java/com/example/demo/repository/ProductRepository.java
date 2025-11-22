package com.example.demo.repository;

import com.example.demo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    // Sau này cần tìm kiếm thì thêm hàm ở đây
    List<Product> findByNameContaining(String name);
}
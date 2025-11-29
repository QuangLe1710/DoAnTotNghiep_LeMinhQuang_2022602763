package com.example.demo.repository;
import com.example.demo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    // Tìm kiếm theo tên (dùng cho thanh search)
    List<Product> findByNameContainingIgnoreCase(String name);

    // Lọc theo Hãng
    List<Product> findByBrandId(Long brandId);

    // Lọc theo Danh mục
    List<Product> findByCategoryId(Long categoryId);
}
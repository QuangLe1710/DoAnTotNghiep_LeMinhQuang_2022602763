package com.example.demo.repository;
import com.example.demo.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    // Xóa tất cả ảnh của 1 sản phẩm (dùng khi update sản phẩm)
    void deleteByProductId(Long productId);
}
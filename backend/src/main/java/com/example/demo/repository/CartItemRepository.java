package com.example.demo.repository;
import com.example.demo.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // Xóa cart item theo id
    void deleteByCartIdAndProductId(Long cartId, Long productId);
}
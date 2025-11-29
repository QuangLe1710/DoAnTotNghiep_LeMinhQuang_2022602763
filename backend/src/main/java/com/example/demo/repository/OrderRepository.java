package com.example.demo.repository;
import com.example.demo.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId); // Lịch sử đơn hàng của khách
    List<Order> findByStatus(String status); // Admin lọc đơn
}
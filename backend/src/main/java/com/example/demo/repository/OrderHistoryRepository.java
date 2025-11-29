package com.example.demo.repository;
import com.example.demo.entity.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Long> {
    // Xem lịch sử của 1 đơn hàng cụ thể
    List<OrderHistory> findByOrderIdOrderByUpdatedAtDesc(Long orderId);
}
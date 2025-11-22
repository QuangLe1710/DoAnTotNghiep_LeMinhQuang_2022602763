package com.example.demo.repository;
import com.example.demo.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUsernameOrderByIdDesc(String username);

    // 1. Đếm tổng số đơn hàng (Dùng hàm có sẵn count() cũng được, nhưng viết custom để lọc trạng thái nếu cần)
    long count();

    // 2. Tính tổng doanh thu (Chỉ tính các đơn KHÔNG BỊ HỦY)
    // COALESCE(SUM(...), 0) để tránh lỗi null nếu chưa có đơn nào
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status != 'CANCELLED'")
    Double sumTotalRevenue();

    // Đếm số lượng đơn theo trạng thái
    long countByStatus(String status);

    // Lấy danh sách đơn hàng theo trạng thái, sắp xếp ID giảm dần (mới nhất lên đầu)
    List<Order> findByStatusOrderByIdDesc(String status);
}
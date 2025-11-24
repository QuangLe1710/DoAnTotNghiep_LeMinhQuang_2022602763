package com.example.demo.repository;
import com.example.demo.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
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

    // --- [MỚI] 3. Thống kê doanh thu theo tháng ---
    // Trả về mảng Object[] gồm: [Tháng (int), Năm (int), Tổng tiền (double)]
    // Chỉ lấy các đơn KHÔNG BỊ HỦY và trong khoảng thời gian startDate trở lại đây
    @Query("SELECT MONTH(o.createdAt), YEAR(o.createdAt), SUM(o.totalAmount) " +
            "FROM Order o " +
            "WHERE o.status != 'CANCELLED' AND o.createdAt >= :startDate " +
            "GROUP BY YEAR(o.createdAt), MONTH(o.createdAt) " +
            "ORDER BY YEAR(o.createdAt) ASC, MONTH(o.createdAt) ASC")
    List<Object[]> getRevenueByMonth(@Param("startDate") LocalDateTime startDate);
}
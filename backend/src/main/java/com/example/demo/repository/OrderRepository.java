package com.example.demo.repository;

import com.example.demo.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // --- SỬA LẠI TÊN HÀM NÀY ---
    // Cũ: findByUsernameOrderByIdDesc (Sai vì Order không còn cột username)
    // Mới: findByUser_UsernameOrderByIdDesc (Đúng: Tìm trong User lấy Username)
    List<Order> findByUser_UsernameOrderByIdDesc(String username);

    // 1. Tính tổng doanh thu (Chỉ tính đơn COMPLETED hoặc PAID)
    // COALESCE để tránh null nếu chưa có đơn nào
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'COMPLETED' OR o.paymentStatus = 'PAID'")
    Double sumTotalRevenue();

    // 2. Đếm số lượng đơn hàng mới (Chờ duyệt)
    long countByStatus(String status);

    // 3. Thống kê doanh thu theo tháng (Dùng cho biểu đồ)
    // Trả về: [Tháng, Năm, Tổng tiền]
    @Query("SELECT MONTH(o.orderDate), YEAR(o.orderDate), SUM(o.totalAmount) " +
            "FROM Order o " +
            "WHERE (o.status = 'COMPLETED' OR o.paymentStatus = 'PAID') " +
            "GROUP BY YEAR(o.orderDate), MONTH(o.orderDate) " +
            "ORDER BY YEAR(o.orderDate), MONTH(o.orderDate)")
    List<Object[]> getMonthlyRevenue();
}
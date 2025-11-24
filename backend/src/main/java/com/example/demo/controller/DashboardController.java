package com.example.demo.controller;

import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new HashMap<>();

        // 1. Tổng sản phẩm
        stats.put("totalProducts", productRepository.count());

        // 2. Tổng người dùng (Trừ Admin ra nếu muốn, ở đây đếm tất)
        stats.put("totalUsers", userRepository.count());

        // 3. Tổng đơn hàng (SỐ LIỆU THẬT)
        stats.put("totalOrders", orderRepository.count());

        // 4. Tổng doanh thu (SỐ LIỆU THẬT)
        stats.put("totalRevenue", orderRepository.sumTotalRevenue());

        return ResponseEntity.ok(stats);
    }

    // --- [MỚI] API BIỂU ĐỒ DOANH THU ---
    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueChart(@RequestParam(defaultValue = "6") int months) {
        // 1. Tính ngày bắt đầu (Vd: Lấy 6 tháng trước)
        LocalDateTime startDate = LocalDateTime.now().minusMonths(months);

        // 2. Lấy dữ liệu thô từ DB (Chỉ chứa những tháng có doanh thu)
        List<Object[]> rawData = orderRepository.getRevenueByMonth(startDate);

        // 3. Chuẩn bị dữ liệu đầy đủ cho Frontend (Lấp đầy các tháng doanh thu = 0)
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate current = LocalDate.now().minusMonths(months - 1); // Bắt đầu từ tháng xa nhất
        LocalDate now = LocalDate.now();

        // Duyệt từ quá khứ đến hiện tại
        while (!current.isAfter(now)) {
            int month = current.getMonthValue();
            int year = current.getYear();
            String label = "Tháng " + month; // Nhãn hiển thị: "Tháng 10"

            double revenue = 0.0;

            // Tìm xem trong DB có dữ liệu tháng này không
            for (Object[] row : rawData) {
                // row[0] là tháng, row[1] là năm, row[2] là doanh thu
                if ((int) row[0] == month && (int) row[1] == year) {
                    revenue = (Double) row[2];
                    break;
                }
            }

            Map<String, Object> item = new HashMap<>();
            item.put("name", label);
            item.put("revenue", revenue);
            result.add(item);

            // Tăng lên 1 tháng
            current = current.plusMonths(1);
        }

        return ResponseEntity.ok(result);
    }
}
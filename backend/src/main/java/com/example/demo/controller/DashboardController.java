package com.example.demo.controller;

import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
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
}
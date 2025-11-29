package com.example.demo.controller;

import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin("*")
public class DashboardController {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. Lấy số liệu tổng quan (Cards)
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalRevenue", orderRepository.sumTotalRevenue());
        stats.put("totalOrders", orderRepository.count());
        stats.put("totalProducts", productRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("pendingOrders", orderRepository.countByStatus("PENDING"));

        return ResponseEntity.ok(stats);
    }

    // 2. Lấy dữ liệu biểu đồ (Chart)
    @GetMapping("/chart")
    public ResponseEntity<?> getChartData() {
        List<Object[]> rawData = orderRepository.getMonthlyRevenue();
        List<Map<String, Object>> chartData = new ArrayList<>();

        for (Object[] row : rawData) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", "Tháng " + row[0] + "/" + row[1]); // VD: Tháng 11/2025
            item.put("revenue", row[2]);
            chartData.add(item);
        }

        return ResponseEntity.ok(chartData);
    }
}
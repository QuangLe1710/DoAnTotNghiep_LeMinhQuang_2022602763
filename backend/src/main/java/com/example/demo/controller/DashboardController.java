package com.example.demo.controller;

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

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new HashMap<>();

        // Đếm số lượng thực tế trong DB
        stats.put("totalProducts", productRepository.count());
        stats.put("totalUsers", userRepository.count());

        // Giả lập số liệu Đơn hàng & Doanh thu (Vì chưa làm module Order)
        // Để demo cho đẹp, sau này làm xong Order thì thay bằng lệnh count() thật
        stats.put("totalOrders", 15);
        stats.put("totalRevenue", 350000000);

        return ResponseEntity.ok(stats);
    }
}
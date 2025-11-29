package com.example.demo.controller;

import com.example.demo.dto.OrderRequestDTO;
import com.example.demo.entity.Order;
import com.example.demo.service.OrderService;
import jakarta.servlet.http.HttpServletRequest; // Import cái này
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin("*")
public class OrderController {

    @Autowired
    private OrderService orderService; // Dùng final để Lombok tự inject (bỏ @Autowired)

    // Helper lấy username từ Token
    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // 1. [USER] API Đặt hàng
    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequestDTO request) {
        try {
            Order order = orderService.placeOrder(getCurrentUsername(), request);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. [USER] Xem lịch sử đơn hàng
    @GetMapping("/my-orders/{username}")
    public ResponseEntity<?> getMyOrders(@PathVariable String username, HttpServletRequest request) { // <--- THÊM 'request' VÀO ĐÂY

        // Kiểm tra bảo mật: Chỉ cho phép xem đơn của chính mình (trừ khi là Admin)
        String currentLoginUser = getCurrentUsername();

        // Nếu user đang login KHÁC user muốn xem VÀ user đang login không phải ADMIN -> Chặn
        if (!currentLoginUser.equals(username) && !request.isUserInRole("ROLE_ADMIN")) {
            return ResponseEntity.status(403).body("Không có quyền xem đơn hàng của người khác!");
        }

        return ResponseEntity.ok(orderService.getMyOrders(username));
    }

    // 3. [ADMIN] Lấy danh sách tất cả đơn hàng
    @GetMapping
    public ResponseEntity<?> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        Pageable pageable = PageRequest.of(page, limit, Sort.by("id").descending());
        Page<Order> orderPage = orderService.getAllOrders(pageable);
        return ResponseEntity.ok(orderPage);
    }

    // 4. [ADMIN] Đổi trạng thái đơn hàng
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String newStatus = body.get("status");
        try {
            Order updatedOrder = orderService.updateOrderStatus(id, newStatus);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- 5. [USER] HỦY ĐƠN HÀNG ---
    // PUT /api/orders/{id}/cancel
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        try {
            orderService.cancelOrder(id, reason);
            return ResponseEntity.ok("Hủy đơn hàng thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
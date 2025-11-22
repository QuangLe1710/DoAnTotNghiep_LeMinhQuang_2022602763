package com.example.demo.controller;

import com.example.demo.entity.Order;
import com.example.demo.entity.OrderDetail;
import com.example.demo.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody Order order) {
        try {
            // Thiết lập quan hệ 2 chiều để JPA lưu được cả OrderDetail
            if (order.getOrderDetails() != null) {
                for (OrderDetail detail : order.getOrderDetails()) {
                    detail.setOrder(order);
                }
            }
            orderRepository.save(order);
            return ResponseEntity.ok("Đặt hàng thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    // API Lấy danh sách tất cả đơn hàng (Sắp xếp mới nhất lên đầu)
    // Sửa lại hàm getAllOrders cũ (nếu có) hoặc thêm mới
    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        // Sort giảm dần theo ID để đơn mới nhất hiện lên trên
        return ResponseEntity.ok(orderRepository.findAll(Sort.by(Sort.Direction.DESC, "id")));
    }

    // API Cập nhật trạng thái đơn hàng (VD: Duyệt đơn)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();

        String newStatus = body.get("status");
        order.setStatus(newStatus);
        orderRepository.save(order);
        return ResponseEntity.ok("Cập nhật trạng thái thành công!");
    }

    // API xem lịch sử đơn hàng của User (Dựa vào username gửi lên)
    @GetMapping("/my-orders/{username}")
    public ResponseEntity<?> getMyOrders(@PathVariable String username) {
        return ResponseEntity.ok(orderRepository.findByUsernameOrderByIdDesc(username));
    }

    // API cho KHÁCH HÀNG tự hủy đơn (CÓ KÈM LÝ DO)
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Order> orderOptional = orderRepository.findById(id);

        if (orderOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOptional.get();

        if ("PENDING".equals(order.getStatus())) {
            order.setStatus("CANCELLED");

            // Lưu lý do hủy gửi từ Frontend lên
            String reason = body.get("reason");
            order.setCancelReason(reason);

            orderRepository.save(order);
            return ResponseEntity.ok("Đã hủy đơn hàng thành công!");
        } else {
            return ResponseEntity.badRequest().body("Không thể hủy đơn hàng khi đã được duyệt hoặc đang giao!");
        }
    }

    // API Đếm số đơn đang chờ duyệt (Dùng để thông báo)
    @GetMapping("/count-pending")
    public ResponseEntity<?> getPendingCount() {
        return ResponseEntity.ok(orderRepository.countByStatus("PENDING"));
    }

    // API lấy danh sách các đơn đang chờ duyệt (Dùng cho Notification Dropdown)
    @GetMapping("/pending-orders")
    public ResponseEntity<?> getPendingOrders() {
        return ResponseEntity.ok(orderRepository.findByStatusOrderByIdDesc("PENDING"));
    }
}
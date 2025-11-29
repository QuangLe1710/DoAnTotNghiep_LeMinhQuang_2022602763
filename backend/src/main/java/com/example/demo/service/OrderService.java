package com.example.demo.service;

import com.example.demo.dto.OrderRequestDTO;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page; // Import mới
import org.springframework.data.domain.Pageable; // Import mới

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private OrderHistoryRepository orderHistoryRepository;

    @Autowired
    private CartService cartService; // Tận dụng lại service giỏ hàng

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private VoucherRepository voucherRepository;

    // 1. ĐẶT HÀNG (PLACE ORDER)
    @Transactional(rollbackFor = Exception.class) // Lỗi là rollback ngay
    public Order placeOrder(String username, OrderRequestDTO request) {
        // B1: Lấy User và Giỏ hàng hiện tại
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        Cart cart = cartService.getCartByUser(username);
        List<CartItem> cartItems = cart.getCartItems();

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống! Không thể đặt hàng.");
        }

        // B2: Tạo đơn hàng (Order)
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(new Date());
        order.setShippingName(request.getReceiverName());
        order.setShippingPhone(request.getPhone());
        order.setShippingAddress(request.getAddress());
        order.setNote(request.getNote());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus("UNPAID"); // Mặc định chưa thanh toán
        order.setStatus("PENDING"); // Chờ duyệt

        // Tính tổng tiền & Kiểm tra tồn kho
        double totalAmount = 0;
        List<OrderDetail> orderDetails = new ArrayList<>();

        for (CartItem item : cartItems) {
            Product product = item.getProduct();

            // Validate tồn kho
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + product.getName() + " không đủ hàng!");
            }

            // Trừ tồn kho
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);

            // Tạo chi tiết đơn
            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(item.getQuantity());
            detail.setPrice(product.getPrice()); // Lưu giá tại thời điểm mua (quan trọng!)
            detail.setTotalPrice(product.getPrice() * item.getQuantity());

            orderDetails.add(detail);
            totalAmount += detail.getTotalPrice();
        }

        // --- LOGIC VOUCHER MỚI ---
        double finalAmount = totalAmount;
        if (request.getVoucherCode() != null && !request.getVoucherCode().isEmpty()) {
            // Tính toán lại mức giảm (Validate luôn)
            Double discount = voucherService.calculateDiscount(request.getVoucherCode(), totalAmount);
            finalAmount = totalAmount - discount;
            if (finalAmount < 0) finalAmount = 0; // Không để âm tiền

            // Lấy voucher và tăng usage_count
            Voucher voucher = voucherService.getVoucher(request.getVoucherCode());
            if (voucher != null) {
                voucher.setUsageCount(voucher.getUsageCount() + 1);
                voucherRepository.save(voucher);
                // Bạn có thể setVoucher(voucher) cho Order nếu Entity Order có quan hệ này
                // order.setVoucherId(voucher.getId()); (Nếu dùng ID thuần)
            }
        }

        order.setTotalAmount(totalAmount);
        order.setFinalAmount(finalAmount); // <--- LƯU SỐ TIỀN THỰC TRẢ
        order.setOrderDetails(orderDetails);

        // B3: Lưu đơn hàng
        Order savedOrder = orderRepository.save(order);

        // B4: Ghi log lịch sử (Order History)
        OrderHistory history = new OrderHistory();
        history.setOrder(savedOrder);
        history.setAction("CREATE");
        history.setStatusFrom(null);
        history.setStatusTo("PENDING");
        history.setNote("Khách hàng đặt mới đơn hàng");
        history.setUpdatedBy(user.getUsername());
        history.setUpdatedAt(new Date());
        orderHistoryRepository.save(history);

        // B5: Xóa sạch giỏ hàng
        cartService.clearCart(username);

        return savedOrder;
    }

    // --- 2. [ADMIN] LẤY DANH SÁCH TẤT CẢ ĐƠN HÀNG (CÓ PHÂN TRANG) ---
    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    // --- 3. [ADMIN] CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG ---
    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        String oldStatus = order.getStatus();

        // Nếu trạng thái không đổi thì không làm gì cả
        if (oldStatus.equals(newStatus)) {
            return order;
        }

        // Cập nhật trạng thái mới
        order.setStatus(newStatus);

        // Nếu đơn hàng hoàn thành -> Cập nhật trạng thái thanh toán luôn (nếu chưa)
        if ("COMPLETED".equals(newStatus)) {
            order.setPaymentStatus("PAID");
        }

        Order savedOrder = orderRepository.save(order);

        // Ghi Log Lịch sử (QUAN TRỌNG)
        OrderHistory history = new OrderHistory();
        history.setOrder(savedOrder);
        history.setAction("UPDATE_STATUS");
        history.setStatusFrom(oldStatus);
        history.setStatusTo(newStatus);
        history.setNote("Admin cập nhật trạng thái");
        history.setUpdatedBy("ADMIN"); // Tạm thời hardcode, sau này lấy từ SecurityContext
        history.setUpdatedAt(new Date());

        orderHistoryRepository.save(history);

        return savedOrder;
    }

    // --- 4. [USER] LẤY LỊCH SỬ ĐƠN HÀNG ---
    public List<Order> getMyOrders(String username) {
        return orderRepository.findByUser_UsernameOrderByIdDesc(username);
    }

    // --- 5. [USER] HỦY ĐƠN HÀNG ---
    @Transactional
    public void cancelOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        // Chỉ cho phép hủy khi đang chờ duyệt
        if ("PENDING".equals(order.getStatus())) {
            order.setStatus("CANCELLED");
            order.setCancelReason(reason);
            orderRepository.save(order);

            // Ghi log lịch sử
            OrderHistory history = new OrderHistory();
            history.setOrder(order);
            history.setAction("CANCEL");
            history.setStatusFrom("PENDING");
            history.setStatusTo("CANCELLED");
            history.setNote("Khách hàng hủy đơn: " + reason);
            history.setUpdatedBy("USER"); // Hoặc lấy tên user hiện tại
            history.setUpdatedAt(new Date());
            orderHistoryRepository.save(history);
        } else {
            throw new RuntimeException("Không thể hủy đơn hàng đã được duyệt hoặc đang giao!");
        }
    }
}
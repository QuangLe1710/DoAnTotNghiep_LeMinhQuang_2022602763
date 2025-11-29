package com.example.demo.controller;

import com.example.demo.entity.Cart;
import com.example.demo.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CartController {
    @Autowired
    private CartService cartService;

    // Helper: Lấy username từ Token JWT đang đăng nhập
    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // 1. Xem giỏ hàng
    @GetMapping
    public ResponseEntity<Cart> getCart() {
        return ResponseEntity.ok(cartService.getCartByUser(getCurrentUsername()));
    }

    // 2. Thêm vào giỏ
    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(@RequestParam Long productId, @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.addToCart(getCurrentUsername(), productId, quantity));
    }

    // 3. Cập nhật số lượng
    @PutMapping("/update")
    public ResponseEntity<Cart> updateQuantity(@RequestParam Long productId, @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateItemQuantity(getCurrentUsername(), productId, quantity));
    }

    // 4. Xóa 1 món
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Cart> removeFromCart(@PathVariable Long productId) {
        return ResponseEntity.ok(cartService.removeFromCart(getCurrentUsername(), productId));
    }

    // 5. Xóa sạch giỏ
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart() {
        cartService.clearCart(getCurrentUsername());
        return ResponseEntity.ok("Đã dọn sạch giỏ hàng");
    }

    // 6. Merge giỏ hàng (Khi vừa Login xong)
    @PostMapping("/merge")
    public ResponseEntity<?> mergeCart(@RequestBody List<CartService.CartItemRequest> localItems) {
        cartService.mergeCart(getCurrentUsername(), localItems);
        return ResponseEntity.ok(cartService.getCartByUser(getCurrentUsername()));
    }
}
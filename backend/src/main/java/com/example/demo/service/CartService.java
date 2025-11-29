package com.example.demo.service;

import com.example.demo.entity.Cart;
import com.example.demo.entity.CartItem;
import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.repository.CartItemRepository;
import com.example.demo.repository.CartRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. LẤY GIỎ HÀNG CỦA USER (Nếu chưa có thì tạo mới)
    public Cart getCartByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    // 2. THÊM SẢN PHẨM VÀO GIỎ
    @Transactional
    public Cart addToCart(String username, Long productId, int quantity) {
        Cart cart = getCartByUser(username);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        // Kiểm tra xem sản phẩm đã có trong giỏ chưa
        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            // Nếu có rồi -> Cộng thêm số lượng
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            // Nếu chưa có -> Tạo dòng mới
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            cartItemRepository.save(newItem);

            // Add vào list để trả về ngay lập tức (tránh phải query lại)
            cart.getCartItems().add(newItem);
        }

        return cart;
    }

    // 3. CẬP NHẬT SỐ LƯỢNG (Dùng khi bấm nút +/- trong giỏ)
    @Transactional
    public Cart updateItemQuantity(String username, Long productId, int quantity) {
        Cart cart = getCartByUser(username);

        CartItem item = cart.getCartItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sản phẩm không có trong giỏ hàng"));

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return cart;
    }

    // 4. XÓA 1 SẢN PHẨM KHỎI GIỎ
    @Transactional
    public Cart removeFromCart(String username, Long productId) {
        Cart cart = getCartByUser(username);

        // Dùng removeIf để xóa khỏi list trong memory và DB
        boolean removed = cart.getCartItems().removeIf(item -> {
            if (item.getProduct().getId().equals(productId)) {
                cartItemRepository.delete(item); // Xóa trong DB
                return true;
            }
            return false;
        });

        if (!removed) {
            throw new RuntimeException("Sản phẩm không có trong giỏ để xóa");
        }

        return cart;
    }

    // 5. XÓA SẠCH GIỎ (Dùng khi đặt hàng thành công hoặc nút "Xóa hết")
    @Transactional
    public void clearCart(String username) {
        Cart cart = getCartByUser(username);
        // Xóa hết cart items trong DB
        cartItemRepository.deleteAll(cart.getCartItems());
        // Xóa list trong memory
        cart.getCartItems().clear();
        cartRepository.save(cart);
    }

    // 6. [QUAN TRỌNG] MERGE GIỎ HÀNG (LocalStorage -> Database)
    // Hàm này sẽ được gọi khi User vừa đăng nhập
    @Transactional
    public void mergeCart(String username, List<CartItemRequest> localItems) {
        if (localItems == null || localItems.isEmpty()) return;

        Cart cart = getCartByUser(username);

        for (CartItemRequest localItem : localItems) {
            Product product = productRepository.findById(localItem.getProductId()).orElse(null);
            if (product != null) {
                // Kiểm tra xem trong DB đã có chưa
                Optional<CartItem> dbItem = cart.getCartItems().stream()
                        .filter(item -> item.getProduct().getId().equals(product.getId()))
                        .findFirst();

                if (dbItem.isPresent()) {
                    // Nếu DB có, Local cũng có -> Cộng dồn? Hay lấy cái nào lớn hơn?
                    // Thường thì sẽ cộng dồn hoặc ưu tiên Local mới nhất.
                    // Ở đây mình chọn: Cộng dồn
                    CartItem item = dbItem.get();
                    item.setQuantity(item.getQuantity() + localItem.getQuantity());
                    cartItemRepository.save(item);
                } else {
                    // Nếu DB chưa có -> Thêm mới
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setProduct(product);
                    newItem.setQuantity(localItem.getQuantity());
                    cartItemRepository.save(newItem);
                }
            }
        }
    }

    // Class phụ để nhận dữ liệu merge từ Frontend
    @lombok.Data
    public static class CartItemRequest {
        private Long productId;
        private int quantity;

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }
    }
}
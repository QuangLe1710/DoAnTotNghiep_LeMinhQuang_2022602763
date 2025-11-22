package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import com.example.demo.service.CloudinaryService; // Import service upload ảnh cũ của bạn
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    // 1. LẤY DANH SÁCH SẢN PHẨM (Cho trang chủ & Admin)
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // 2. LẤY CHI TIẾT 1 SẢN PHẨM (Cho trang Detail)
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> product = productRepository.findById(id);
        return product.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 3. THÊM SẢN PHẨM MỚI (Có upload ảnh)
    @PostMapping("/add")
    public ResponseEntity<?> addProduct(
            @RequestParam("name") String name,
            @RequestParam("price") Double price,
            @RequestParam("brand") String brand,
            @RequestParam("cpu") String cpu,
            @RequestParam("ram") String ram,
            @RequestParam("storage") String storage,
            @RequestParam("screen") String screen,
            @RequestParam("description") String description,
            @RequestParam(value = "file", required = false) MultipartFile file // Ảnh có thể null
    ) {
        try {
            Product product = new Product();
            product.setName(name);
            product.setPrice(price);
            product.setBrand(brand);
            product.setCpu(cpu);
            product.setRam(ram);
            product.setStorage(storage);
            product.setScreen(screen);
            product.setDescription(description);

            // Nếu có gửi ảnh thì upload lên Cloudinary
            if (file != null && !file.isEmpty()) {
                String imageUrl = cloudinaryService.uploadImage(file);
                product.setImage(imageUrl);
            }

            Product savedProduct = productRepository.save(product);
            return ResponseEntity.ok(savedProduct);

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Lỗi upload ảnh: " + e.getMessage());
        }
    }

    // 4. XÓA SẢN PHẨM
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.ok("Xóa thành công!");
        }
        return ResponseEntity.notFound().build();
    }

    // 5. SỬA SẢN PHẨM (UPDATE)
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("price") Double price,
            @RequestParam("brand") String brand,
            @RequestParam("cpu") String cpu,
            @RequestParam("ram") String ram,
            @RequestParam("storage") String storage,
            @RequestParam("screen") String screen,
            @RequestParam("description") String description,
            @RequestParam(value = "file", required = false) MultipartFile file // Ảnh là tùy chọn
    ) {
        try {
            Optional<Product> productOptional = productRepository.findById(id);
            if (productOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Product product = productOptional.get();

            // Cập nhật thông tin văn bản
            product.setName(name);
            product.setPrice(price);
            product.setBrand(brand);
            product.setCpu(cpu);
            product.setRam(ram);
            product.setStorage(storage);
            product.setScreen(screen);
            product.setDescription(description);

            // Logic xử lý ảnh: Chỉ upload nếu có file mới được gửi lên
            if (file != null && !file.isEmpty()) {
                String imageUrl = cloudinaryService.uploadImage(file);
                product.setImage(imageUrl);
            }
            // Nếu file = null thì giữ nguyên product.getImage() cũ, không làm gì cả

            Product updatedProduct = productRepository.save(product);
            return ResponseEntity.ok(updatedProduct);

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Lỗi upload ảnh");
        }
    }
}
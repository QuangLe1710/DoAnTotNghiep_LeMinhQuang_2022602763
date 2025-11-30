package com.example.demo.controller;

import com.example.demo.dto.ProductDTO;
import com.example.demo.dto.ProductResponseDTO; // Import DTO phản hồi
import com.example.demo.entity.Brand;
import com.example.demo.entity.Category;
import com.example.demo.entity.Product;
import com.example.demo.entity.ProductImage;
import com.example.demo.service.BrandService;
import com.example.demo.service.CategoryService;
import com.example.demo.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.HashMap;
import java.util.Map;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ProductController {
    @Autowired
    private ProductService productService;

    @Autowired
    private BrandService brandService;

    @Autowired
    private CategoryService categoryService;

    // 1. Lấy danh sách (Trả về DTO)
//    @GetMapping
//    public ResponseEntity<List<ProductResponseDTO>> getAll() {
//        List<Product> products = productService.getAllProducts();
//        // Convert List<Entity> -> List<DTO>
//        List<ProductResponseDTO> dtos = products.stream()
//                .map(this::convertToDTO)
//                .collect(Collectors.toList());
//        return ResponseEntity.ok(dtos);
//    }

    // 1. Lấy danh sách (NÂNG CẤP: Phân trang + Tìm kiếm)
    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(required = false) String search
    ) {
        // Tạo đối tượng phân trang (Sắp xếp theo ID giảm dần để thấy mới nhất)
        Pageable pageable = PageRequest.of(page, limit, Sort.by("id").descending());

        // Gọi Service
        Page<Product> productPage = productService.getProducts(search, pageable);

        // Convert List<Entity> -> List<DTO>
        List<ProductResponseDTO> dtos = productPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        // Đóng gói dữ liệu trả về chuẩn cho Frontend
        Map<String, Object> response = new HashMap<>();
        response.put("products", dtos);
        response.put("currentPage", productPage.getNumber());
        response.put("totalItems", productPage.getTotalElements());
        response.put("totalPages", productPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    // 2. Lấy chi tiết
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            Product product = productService.getProductById(id);
            return ResponseEntity.ok(convertToDTO(product)); // Trả về DTO
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 3. Thêm mới
    @PostMapping("/add")
    public ResponseEntity<?> createProduct(@ModelAttribute ProductDTO productDTO) {
        try {
            Product newProduct = productService.createProduct(productDTO);
            // Convert Entity vừa tạo sang DTO để trả về Frontend
            return ResponseEntity.ok(convertToDTO(newProduct));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Lỗi upload ảnh: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Lỗi dữ liệu: " + e.getMessage());
        }
    }

    // 4. CẬP NHẬT SẢN PHẨM (MỚI)
    // Method: PUT /api/products/update/{id}
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @ModelAttribute ProductDTO productDTO) {
        try {
            Product updatedProduct = productService.updateProduct(id, productDTO);
            return ResponseEntity.ok(convertToDTO(updatedProduct)); // Trả về DTO chuẩn
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Lỗi upload ảnh: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Lỗi dữ liệu: " + e.getMessage());
        }
    }

    // 5. XÓA SẢN PHẨM (MỚI)
    // Method: DELETE /api/products/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok("Xóa thành công sản phẩm ID: " + id);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa: " + e.getMessage());
        }
    }

    // --- HÀM CHUYỂN ĐỔI ENTITY -> DTO (PHIÊN BẢN ĐẦY ĐỦ) ---
    private ProductResponseDTO convertToDTO(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setSalePrice(product.getSalePrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setWarrantyPeriod(product.getWarrantyPeriod());
        dto.setViewCount(product.getViewCount());

        // Map mô tả
        dto.setDescription(product.getDescription());
        dto.setShortDescription(product.getShortDescription());

        // Map cấu hình
        dto.setCpu(product.getCpu());
        dto.setRam(product.getRam());
        dto.setStorage(product.getStorage());
        dto.setScreen(product.getScreen());
        dto.setGpu(product.getGpu());
        dto.setBattery(product.getBattery());
        dto.setWeight(product.getWeight());

        // Lấy tên Hãng và Danh mục an toàn
        if (product.getBrand() != null) {
            dto.setBrandName(product.getBrand().getName());
        }
        if (product.getCategory() != null) {
            dto.setCategoryName(product.getCategory().getName());
        }

        // Xử lý danh sách ảnh
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            List<String> imageUrls = product.getImages().stream()
                    .map(ProductImage::getImageUrl)
                    .collect(Collectors.toList());
            dto.setImages(imageUrls);

            String thumb = product.getImages().stream()
                    .filter(ProductImage::getIsThumbnail)
                    .map(ProductImage::getImageUrl)
                    .findFirst()
                    .orElse(imageUrls.get(0));
            dto.setThumbnail(thumb);
        }

        return dto;
    }

    // ... (Các API getBrands, getCategories giữ nguyên)
    @GetMapping("/brands")
    public ResponseEntity<List<Brand>> getBrands() {
        return ResponseEntity.ok(brandService.getAllBrands());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    // 6. Lấy sản phẩm liên quan
    @GetMapping("/{id}/related")
    public ResponseEntity<List<ProductResponseDTO>> getRelatedProducts(@PathVariable Long id) {
        List<Product> relatedProducts = productService.getRelatedProducts(id);

        // Convert sang DTO để trả về JSON đẹp (có ảnh, hãng...)
        List<ProductResponseDTO> dtos = relatedProducts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}
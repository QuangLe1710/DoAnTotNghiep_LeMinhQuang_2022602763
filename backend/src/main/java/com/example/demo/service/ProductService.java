package com.example.demo.service;

import com.example.demo.dto.ProductDTO;
import com.example.demo.entity.Brand;
import com.example.demo.entity.Category;
import com.example.demo.entity.Product;
import com.example.demo.entity.ProductImage;
import com.example.demo.repository.BrandRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductImageRepository;
import com.example.demo.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductService {
    // Sử dụng final để Lombok tự động @Autowired qua Constructor -> Code sạch hơn
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    // 1. LẤY TẤT CẢ SẢN PHẨM
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // 2. LẤY CHI TIẾT SẢN PHẨM
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm có ID: " + id));
    }

    // 3. TẠO SẢN PHẨM MỚI
    @Transactional
    public Product createProduct(ProductDTO dto) throws IOException {
        // Kiểm tra Brand/Category
        Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(() -> new RuntimeException("Hãng sản xuất không tồn tại!"));
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại!"));

        // Map dữ liệu
        Product product = new Product();
        product.setName(dto.getName());
        product.setSlug(createSlug(dto.getName())); // <--- SỬA LẠI: Tạo slug từ Tên sản phẩm

        product.setPrice(dto.getPrice());
        product.setSalePrice(dto.getSalePrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setWarrantyPeriod(dto.getWarrantyPeriod());
        product.setDescription(dto.getDescription());
        product.setCpu(dto.getCpu());
        product.setRam(dto.getRam());
        product.setStorage(dto.getStorage());
        product.setScreen(dto.getScreen());
        product.setGpu(dto.getGpu());
        product.setBattery(dto.getBattery());
        product.setWeight(dto.getWeight());

        product.setBrand(brand);
        product.setCategory(category);

        // Lưu Product
        Product savedProduct = productRepository.save(product);

        // Upload ảnh
        List<ProductImage> productImages = new ArrayList<>();
        if (dto.getFiles() != null && !dto.getFiles().isEmpty()) {
            for (int i = 0; i < dto.getFiles().size(); i++) {
                MultipartFile file = dto.getFiles().get(i);
                Map uploadResult = cloudinaryService.uploadFile(file);
                String imageUrl = (String) uploadResult.get("url");

                ProductImage image = new ProductImage();
                image.setProduct(savedProduct);
                image.setImageUrl(imageUrl);
                image.setIsThumbnail(i == 0);

                productImageRepository.save(image);
                productImages.add(image);
            }
        }
        savedProduct.setImages(productImages);

        return savedProduct;
    }

    // 4. CẬP NHẬT SẢN PHẨM
    @Transactional
    public Product updateProduct(Long id, ProductDTO dto) throws IOException {
        Product existingProduct = getProductById(id);

        existingProduct.setName(dto.getName());
        existingProduct.setSlug(createSlug(dto.getName())); // Cập nhật slug mới
        existingProduct.setPrice(dto.getPrice());
        existingProduct.setSalePrice(dto.getSalePrice());
        existingProduct.setStockQuantity(dto.getStockQuantity());
        existingProduct.setWarrantyPeriod(dto.getWarrantyPeriod());
        existingProduct.setDescription(dto.getDescription());

        existingProduct.setCpu(dto.getCpu());
        existingProduct.setRam(dto.getRam());
        existingProduct.setStorage(dto.getStorage());
        existingProduct.setScreen(dto.getScreen());
        existingProduct.setGpu(dto.getGpu());
        existingProduct.setBattery(dto.getBattery());
        existingProduct.setWeight(dto.getWeight());

        Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found"));
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        existingProduct.setBrand(brand);
        existingProduct.setCategory(category);

        // Nếu có ảnh mới -> Xóa cũ, thêm mới
        if (dto.getFiles() != null && !dto.getFiles().isEmpty()) {
            productImageRepository.deleteByProductId(id); // Xóa ảnh cũ

            List<ProductImage> newImages = new ArrayList<>();
            for (int i = 0; i < dto.getFiles().size(); i++) {
                MultipartFile file = dto.getFiles().get(i);
                Map uploadResult = cloudinaryService.uploadFile(file);
                String imageUrl = (String) uploadResult.get("url");

                ProductImage image = new ProductImage();
                image.setProduct(existingProduct);
                image.setImageUrl(imageUrl);
                image.setIsThumbnail(i == 0);

                productImageRepository.save(image);
                newImages.add(image);
            }
            existingProduct.setImages(newImages);
        }

        return productRepository.save(existingProduct);
    }

    // 5. XÓA SẢN PHẨM
    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Sản phẩm không tồn tại!");
        }
        productRepository.deleteById(id);
    }

    // --- HÀM HỖ TRỢ TẠO SLUG ---
    private String createSlug(String name) {
        if (name == null) return "";
        String slug = name.toLowerCase();
        slug = slug.replaceAll("[áàảãạăắằẳẵặâấầẩẫậ]", "a");
        slug = slug.replaceAll("[éèẻẽẹêếềểễệ]", "e");
        slug = slug.replaceAll("[iíìỉĩị]", "i");
        slug = slug.replaceAll("[óòỏõọôốồổỗộơớờởỡợ]", "o");
        slug = slug.replaceAll("[úùủũụưứừửữự]", "u");
        slug = slug.replaceAll("[yýỳỷỹỵ]", "y");
        slug = slug.replaceAll("đ", "d");
        slug = slug.replaceAll("[^a-z0-9\\s-]", "");
        slug = slug.replaceAll("\\s+", "-");
        slug += "-" + System.currentTimeMillis();
        return slug;
    }
}
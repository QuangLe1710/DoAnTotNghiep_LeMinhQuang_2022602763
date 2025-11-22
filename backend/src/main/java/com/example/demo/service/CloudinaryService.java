package com.example.demo.service; // Đổi package nếu bạn để chỗ khác

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    // Constructor này sẽ tự động đọc 3 thông số bạn đã cài trong application.properties
    public CloudinaryService(@Value("${cloudinary.cloud-name}") String cloudName,
                             @Value("${cloudinary.api-key}") String apiKey,
                             @Value("${cloudinary.api-secret}") String apiSecret) {

        // Khởi tạo đối tượng Cloudinary
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true // Bắt buộc trả về link HTTPS (Bảo mật)
        ));
    }

    // Hàm upload ảnh duy nhất bạn cần dùng
    public String uploadImage(MultipartFile file) throws IOException {
        // 1. Kiểm tra file có rỗng không
        if (file.isEmpty()) {
            return null;
        }

        // 2. Upload file lên Cloudinary
        // ObjectUtils.emptyMap(): Tham số tùy chọn (ví dụ resize, crop...), tạm để trống
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());

        // 3. Lấy về đường dẫn ảnh (URL)
        // "secure_url" là key chứa link https của ảnh
        return uploadResult.get("secure_url").toString();
    }
}
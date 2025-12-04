package com.example.demo.service;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GeminiService {
    @Autowired
    private ProductRepository productRepository;

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.url}")
    private String apiUrl;

    public String getChatResponse(String userMessage) {
        // 1. Lấy dữ liệu sản phẩm để "mớm" cho AI (Context)
        List<Product> products = productRepository.findAll();
        String productContext = products.stream()
                .map(p -> String.format("- %s (Giá: %s VNĐ, Hãng: %s, CPU: %s, RAM: %s)",
                        p.getName(), p.getPrice(),
                        p.getBrand() != null ? p.getBrand().getName() : "N/A",
                        p.getCpu(), p.getRam()))
                .limit(30) // Giới hạn 30 sản phẩm để không quá tải token
                .collect(Collectors.joining("\n"));

        // 2. Tạo Prompt (Kịch bản)
        String systemPrompt = "Bạn là trợ lý ảo của cửa hàng MyLap. Dưới đây là danh sách sản phẩm hiện có:\n" + productContext +
                "\n\nHãy trả lời câu hỏi của khách hàng dựa trên danh sách này một cách ngắn gọn, thân thiện và tư vấn nhiệt tình. " +
                "Nếu không có sản phẩm phù hợp, hãy xin lỗi khéo. Câu hỏi: " + userMessage;

        // 3. Gọi API Gemini (REST)
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Cấu trúc Body theo chuẩn Gemini API
        Map<String, Object> content = new HashMap<>();
        content.put("parts", new Object[]{ new HashMap<String, String>() {{ put("text", systemPrompt); }} });

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", new Object[]{ content });

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            String url = apiUrl + "?key=" + apiKey;
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            // Parse kết quả trả về (Hơi lằng nhằng do JSON lồng nhau)
            Map body = response.getBody();
            List candidates = (List) body.get("candidates");
            Map candidate = (Map) candidates.get(0);
            Map contentRes = (Map) candidate.get("content");
            List parts = (List) contentRes.get("parts");
            Map part = (Map) parts.get(0);

            return part.get("text").toString();
        } catch (Exception e) {
            return "Xin lỗi, hệ thống AI đang bận. Vui lòng thử lại sau! (Lỗi: " + e.getMessage() + ")";
        }
    }
}
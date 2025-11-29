package com.example.demo.dto;

public class PaymentDTO {

    public static class VNPayResponse {
        public String code;
        public String message;
        public String paymentUrl;

        // 1. Constructor rỗng (Bắt buộc cho một số thư viện JSON)
        public VNPayResponse() {}

        // 2. Constructor đầy đủ tham số (Thay thế Builder)
        public VNPayResponse(String code, String message, String paymentUrl) {
            this.code = code;
            this.message = message;
            this.paymentUrl = paymentUrl;
        }

        // Getter & Setter (Giữ nguyên hoặc generate bằng IDE)
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getPaymentUrl() { return paymentUrl; }
        public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }
    }
}
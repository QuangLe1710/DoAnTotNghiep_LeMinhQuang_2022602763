//package com.example.demo.controller;
//
//import com.example.demo.config.VNPayConfig;
//import com.example.demo.entity.Order;
//import com.example.demo.repository.OrderRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import jakarta.servlet.http.HttpServletRequest;
//import java.net.URLEncoder;
//import java.nio.charset.StandardCharsets;
//import java.text.SimpleDateFormat;
//import java.util.*;
//
//@RestController
//@RequestMapping("/api/payment")
//public class PaymentController {
//
//    @Value("${vnpay.tmn-code}")
//    private String vnp_TmnCode;
//
//    @Value("${vnpay.hash-secret}")
//    private String vnp_HashSecret;
//
//    @Value("${vnpay.url}")
//    private String vnp_Url;
//
//    @Value("${vnpay.return-url}")
//    private String vnp_ReturnUrl;
//
//    @Autowired
//    private OrderRepository orderRepository;
//
//    // API 1: Tạo link thanh toán
//    @GetMapping("/create_payment/{amount}/{orderId}")
//    public ResponseEntity<?> createPayment(@PathVariable long amount, @PathVariable Long orderId, HttpServletRequest req) throws Exception {
//        String vnp_Version = "2.1.0";
//        String vnp_Command = "pay";
//        String vnp_TxnRef = String.valueOf(orderId) + "_" + System.currentTimeMillis(); // Mã đơn hàng duy nhất
//        String vnp_IpAddr = VNPayConfig.getIpAddress(req);
//        long amountVal = amount * 100; // VNPay tính đơn vị đồng (x100)
//
//        Map<String, String> vnp_Params = new HashMap<>();
//        vnp_Params.put("vnp_Version", vnp_Version);
//        vnp_Params.put("vnp_Command", vnp_Command);
//        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
//        vnp_Params.put("vnp_Amount", String.valueOf(amountVal));
//        vnp_Params.put("vnp_CurrCode", "VND");
//        vnp_Params.put("vnp_BankCode", "NCB"); // Chuyển hướng sang ngân hàng test NCB
//        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
//        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);
//        vnp_Params.put("vnp_OrderType", "other");
//        vnp_Params.put("vnp_Locale", "vn");
//        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
//        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
//
//        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
//        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
//        String vnp_CreateDate = formatter.format(cld.getTime());
//        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
//
//        cld.add(Calendar.MINUTE, 15);
//        String vnp_ExpireDate = formatter.format(cld.getTime());
//        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
//
//        // Build URL
//        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
//        Collections.sort(fieldNames);
//        StringBuilder hashData = new StringBuilder();
//        StringBuilder query = new StringBuilder();
//        Iterator<String> itr = fieldNames.iterator();
//        while (itr.hasNext()) {
//            String fieldName = itr.next();
//            String fieldValue = vnp_Params.get(fieldName);
//            if ((fieldValue != null) && (fieldValue.length() > 0)) {
//                hashData.append(fieldName);
//                hashData.append('=');
//                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
//                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
//                query.append('=');
//                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
//                if (itr.hasNext()) {
//                    query.append('&');
//                    hashData.append('&');
//                }
//            }
//        }
//        String queryUrl = query.toString();
//        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnp_HashSecret, hashData.toString());
//        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
//        String paymentUrl = vnp_Url + "?" + queryUrl;
//
//        return ResponseEntity.ok(paymentUrl);
//    }
//
//    // API 2: Xử lý kết quả trả về (IPN / Return URL)
//    @GetMapping("/vnpay_return")
//    public ResponseEntity<?> vnPayReturn(@RequestParam Map<String, String> queryParams) {
//        String vnp_ResponseCode = queryParams.get("vnp_ResponseCode");
//        String vnp_TxnRef = queryParams.get("vnp_TxnRef"); // Định dạng: orderId_timestamp
//
//        if ("00".equals(vnp_ResponseCode)) {
//            // Giao dịch thành công
//            String[] parts = vnp_TxnRef.split("_");
//            Long orderId = Long.parseLong(parts[0]);
//
//            Order order = orderRepository.findById(orderId).orElse(null);
//            if (order != null) {
//                order.setStatus("SHIPPING"); // Đã thanh toán -> Chuyển sang giao hàng
//                orderRepository.save(order);
//                return ResponseEntity.ok("Thanh toán thành công!");
//            }
//        }
//        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Thanh toán thất bại!");
//    }
//}
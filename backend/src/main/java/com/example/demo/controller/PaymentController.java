package com.example.demo.controller;

import com.example.demo.dto.PaymentDTO;
import com.example.demo.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@CrossOrigin("*") // Quan trọng để Frontend gọi được
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @GetMapping("/vn-pay")
    public ResponseEntity<PaymentDTO.VNPayResponse> pay(HttpServletRequest request) {
        return new ResponseEntity<>(paymentService.createVnPayPayment(request), HttpStatus.OK);
    }
}
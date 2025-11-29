package com.example.demo.controller;

import com.example.demo.entity.Voucher;
import com.example.demo.repository.VoucherRepository;
import com.example.demo.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
@CrossOrigin("*")
public class VoucherController {
    @Autowired
    private VoucherService voucherService;

    @Autowired
    private VoucherRepository voucherRepository;

    // API Kiểm tra mã: GET /api/vouchers/check?code=SALE50&total=1000000
    @GetMapping("/check")
    public ResponseEntity<?> checkVoucher(@RequestParam String code, @RequestParam Double total) {
        try {
            Double discount = voucherService.calculateDiscount(code, total);

            Map<String, Object> response = new HashMap<>();
            response.put("code", code);
            response.put("discount", discount);
            response.put("finalTotal", total - discount);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- API QUẢN LÝ CHO ADMIN ---

    @GetMapping
    public ResponseEntity<List<Voucher>> getAll() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Voucher voucher) {
        if (voucherRepository.findByCode(voucher.getCode()).isPresent()) {
            return ResponseEntity.badRequest().body("Mã này đã tồn tại!");
        }
        return ResponseEntity.ok(voucherService.saveVoucher(voucher));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Voucher voucher) {
        Voucher existing = voucherService.getVoucherById(id);
        if (existing == null) return ResponseEntity.notFound().build();

        // Update các trường
        existing.setCode(voucher.getCode());
        existing.setDiscountType(voucher.getDiscountType());
        existing.setDiscountValue(voucher.getDiscountValue());
        existing.setMinOrderValue(voucher.getMinOrderValue());
        existing.setMaxUsage(voucher.getMaxUsage());
        existing.setStartDate(voucher.getStartDate());
        existing.setEndDate(voucher.getEndDate());
        existing.setStatus(voucher.getStatus());

        return ResponseEntity.ok(voucherService.saveVoucher(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.ok("Xóa thành công");
    }

    // API lấy voucher hiển thị ra trang chủ (Public)
    @GetMapping("/active")
    public ResponseEntity<List<Voucher>> getActive() {
        return ResponseEntity.ok(voucherService.getActiveVouchers());
    }
}
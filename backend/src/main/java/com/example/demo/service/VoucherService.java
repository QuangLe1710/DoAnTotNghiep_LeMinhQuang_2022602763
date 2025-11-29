package com.example.demo.service;

import com.example.demo.entity.Voucher;
import com.example.demo.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoucherService {
    @Autowired
    private VoucherRepository voucherRepository;

    // Hàm tính tiền giảm giá (trả về số tiền được giảm)
    public Double calculateDiscount(String code, Double totalOrderAmount) {
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại!"));

        // 1. Kiểm tra trạng thái và thời hạn
        Date now = new Date();
        if (!voucher.getStatus() ||
                (voucher.getStartDate() != null && now.before(voucher.getStartDate())) ||
                (voucher.getEndDate() != null && now.after(voucher.getEndDate()))) {
            throw new RuntimeException("Mã giảm giá đã hết hạn hoặc chưa có hiệu lực!");
        }

        // 2. Kiểm tra số lượng
        if (voucher.getMaxUsage() != null && voucher.getUsageCount() >= voucher.getMaxUsage()) {
            throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng!");
        }

        // 3. Kiểm tra giá trị đơn tối thiểu
        if (totalOrderAmount < voucher.getMinOrderValue()) {
            throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu: " + voucher.getMinOrderValue());
        }

        // 4. Tính toán mức giảm
        double discount = 0;
        if ("PERCENT".equals(voucher.getDiscountType())) {
            // Giảm theo phần trăm (VD: 10%)
            discount = totalOrderAmount * (voucher.getDiscountValue() / 100);
        } else {
            // Giảm tiền mặt trực tiếp (VD: 50k)
            discount = voucher.getDiscountValue();
        }

        return discount;
    }

    // Hàm tìm voucher để lưu vào đơn hàng
    public Voucher getVoucher(String code) {
        return voucherRepository.findByCode(code).orElse(null);
    }

    // --- CÁC HÀM CRUD CHO ADMIN ---

    // 1. Lấy tất cả
    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    // 2. Tạo / Cập nhật
    public Voucher saveVoucher(Voucher voucher) {
        return voucherRepository.save(voucher);
    }

    // 3. Xóa
    public void deleteVoucher(Long id) {
        voucherRepository.deleteById(id);
    }

    // 4. Lấy chi tiết
    public Voucher getVoucherById(Long id) {
        return voucherRepository.findById(id).orElse(null);
    }

    // Lấy danh sách voucher cho khách hàng (Home/Voucher Page)
    public List<Voucher> getActiveVouchers() {
        return voucherRepository.findActiveVouchers();
    }
}
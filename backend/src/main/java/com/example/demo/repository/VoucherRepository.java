package com.example.demo.repository;// ... imports
import com.example.demo.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCode(String code);

    // --- MỚI: Lấy danh sách Voucher đang hiệu lực ---
    // Status = true, Ngày bắt đầu <= Hiện tại, Ngày kết thúc >= Hiện tại (hoặc null)
    @Query("SELECT v FROM Voucher v WHERE v.status = true " +
            "AND (v.startDate IS NULL OR v.startDate <= CURRENT_TIMESTAMP) " +
            "AND (v.endDate IS NULL OR v.endDate >= CURRENT_TIMESTAMP) " +
            "AND (v.maxUsage IS NULL OR v.usageCount < v.maxUsage)")
    List<Voucher> findActiveVouchers();
}
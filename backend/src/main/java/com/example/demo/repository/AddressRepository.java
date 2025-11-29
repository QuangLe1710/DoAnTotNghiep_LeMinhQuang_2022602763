package com.example.demo.repository;

import com.example.demo.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    // Tìm tất cả địa chỉ của username (Sắp xếp mặc định lên đầu)
    List<Address> findByUser_UsernameOrderByIsDefaultDesc(String username);

    // Tìm địa chỉ mặc định của username (Dùng khi checkout)
    Address findByUser_UsernameAndIsDefaultTrue(String username);
}
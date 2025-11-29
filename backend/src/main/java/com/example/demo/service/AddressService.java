package com.example.demo.service;

import com.example.demo.dto.AddressDTO;
import com.example.demo.entity.Address;
import com.example.demo.entity.User;
import com.example.demo.repository.AddressRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {
    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. Lấy danh sách
    public List<Address> getAll(String username) {
        return addressRepository.findByUser_UsernameOrderByIsDefaultDesc(username);
    }

    // 2. Thêm mới
    @Transactional
    public Address addAddress(String username, AddressDTO dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Address address = new Address();
        address.setUser(user);
        mapDtoToEntity(dto, address);

        // Nếu đây là địa chỉ đầu tiên -> Auto mặc định
        List<Address> existing = addressRepository.findByUser_UsernameOrderByIsDefaultDesc(username);
        if (existing.isEmpty()) {
            address.setIsDefault(true);
        } else {
            // Nếu user chọn là mặc định -> Reset các cái cũ
            if (Boolean.TRUE.equals(dto.getIsDefault())) {
                resetDefault(username);
                address.setIsDefault(true);
            } else {
                address.setIsDefault(false);
            }
        }

        return addressRepository.save(address);
    }

    // 3. Cập nhật
    @Transactional
    public Address updateAddress(String username, Long id, AddressDTO dto) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));

        // Security check: Có đúng địa chỉ của user này không?
        if (!address.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Không có quyền sửa địa chỉ này");
        }

        mapDtoToEntity(dto, address);

        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            resetDefault(username);
            address.setIsDefault(true);
        }

        return addressRepository.save(address);
    }

    // 4. Xóa
    @Transactional
    public void deleteAddress(String username, Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        if (!address.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        // Không cho xóa nếu là mặc định (hoặc phải chuyển mặc định sang cái khác)
        // Ở đây mình cho xóa luôn, nếu xóa mặc định thì lần sau add cái mới sẽ tự thành mặc định
        addressRepository.delete(address);
    }

    // 5. Đặt làm mặc định
    @Transactional
    public void setDefault(String username, Long id) {
        resetDefault(username); // Bỏ mặc định các cái cũ

        Address address = addressRepository.findById(id).orElseThrow();
        if (!address.getUser().getUsername().equals(username)) throw new RuntimeException("Unauthorized");

        address.setIsDefault(true);
        addressRepository.save(address);
    }

    // --- Helper ---
    private void resetDefault(String username) {
        List<Address> list = addressRepository.findByUser_UsernameOrderByIsDefaultDesc(username);
        for (Address addr : list) {
            if (addr.getIsDefault()) {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            }
        }
    }

    private void mapDtoToEntity(AddressDTO dto, Address entity) {
        entity.setReceiverName(dto.getReceiverName());
        entity.setPhone(dto.getPhone());
        entity.setDetailAddress(dto.getDetailAddress());
        entity.setCity(dto.getCity());
    }
}
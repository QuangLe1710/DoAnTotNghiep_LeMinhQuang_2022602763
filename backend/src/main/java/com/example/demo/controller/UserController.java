package com.example.demo.controller;

import com.example.demo.dto.UserProfileDTO;
import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.example.demo.dto.UserResponseDTO;
import com.example.demo.entity.Role; // Import Entity Role
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.example.demo.dto.ChangePasswordDTO; // Import

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin("*")
public class UserController {
    @Autowired
    private UserService userService;

    private String getUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // Xem hồ sơ
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        return ResponseEntity.ok(userService.getUserByUsername(getUsername()));
    }

    // Cập nhật hồ sơ
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UserProfileDTO dto) {
        return ResponseEntity.ok(userService.updateUser(getUsername(), dto));
    }

    // Đổi mật khẩu
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordDTO dto) {
        try {
            userService.changePassword(getUsername(), dto);
            return ResponseEntity.ok("Đổi mật khẩu thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- API QUẢN TRỊ (ADMIN ONLY) ---

    // 1. Lấy danh sách người dùng
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<User> users = userService.getAllUsers();

        // Convert Entity sang DTO (để giấu mật khẩu)
        List<UserResponseDTO> dtos = users.stream().map(user -> {
            UserResponseDTO dto = new UserResponseDTO();
            dto.setId(user.getId());
            dto.setUsername(user.getUsername());
            dto.setEmail(user.getEmail());
            dto.setFullName(user.getFullName());
            dto.setPhone(user.getPhone());
            dto.setStatus(user.getStatus());
            dto.setCreatedAt(user.getCreatedAt());

            // Convert Set<Role> sang List<String>
            List<String> roles = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());
            dto.setRoles(roles);

            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // 2. Khóa / Mở khóa user (PUT /api/users/{id}/status)
    // Body nhận: { "status": false }
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        try {
            Boolean newStatus = body.get("status");
            userService.updateUserStatus(id, newStatus);
            return ResponseEntity.ok("Cập nhật trạng thái thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
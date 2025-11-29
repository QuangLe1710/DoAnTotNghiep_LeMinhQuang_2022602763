package com.example.demo.controller;

import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Cho phép Frontend gọi API
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository; // <-- MỚI: Cần cái này để lấy Role từ DB

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    // 1. ĐĂNG KÝ
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Tên đăng nhập đã tồn tại!");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Email đã được sử dụng!");
        }

        User newUser = new User();
        newUser.setUsername(user.getUsername());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));
        newUser.setFullName(user.getFullName());
        newUser.setEmail(user.getEmail());
        newUser.setPhone(user.getPhone()); // Lưu thêm SĐT nếu có

        // --- XỬ LÝ ROLE (Quan trọng) ---
        // Mặc định đăng ký mới là ROLE_USER
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> {
                    // Nếu trong DB chưa có ROLE_USER thì tạo mới luôn (Self-healing)
                    Role newRole = new Role();
                    newRole.setName("ROLE_USER");
                    newRole.setDescription("Khách hàng");
                    return roleRepository.save(newRole);
                });

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        newUser.setRoles(roles);

        userRepository.save(newUser);

        return ResponseEntity.ok("Đăng ký thành công!");
    }

    // 2. ĐĂNG NHẬP
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        User user = userRepository.findByUsername(loginData.get("username")).orElse(null);

        if (user != null && passwordEncoder.matches(loginData.get("password"), user.getPassword())) {
            // Tạo Token (JwtUtils mới đã xử lý lấy list roles bên trong rồi)
            String token = jwtUtils.generateToken(user);

            // Chuẩn bị dữ liệu trả về cho Frontend
            List<String> roleNames = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", user.getUsername());
            response.put("fullName", user.getFullName());
            response.put("roles", roleNames); // Trả về list role (VD: ["ROLE_ADMIN"])

            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body("Sai thông tin đăng nhập!");
    }
}
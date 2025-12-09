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
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

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
        newUser.setPhone(user.getPhone());

        // Mặc định đăng ký là ROLE_USER và ACTIVE
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("ROLE_USER");
                    newRole.setDescription("Khách hàng");
                    return roleRepository.save(newRole);
                });

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        newUser.setRoles(roles);
        newUser.setStatus(true); // Quan trọng: Mặc định là Active

        userRepository.save(newUser);

        return ResponseEntity.ok("Đăng ký thành công!");
    }

    // 2. ĐĂNG NHẬP
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        User user = userRepository.findByUsername(loginData.get("username")).orElse(null);

        if (user != null && passwordEncoder.matches(loginData.get("password"), user.getPassword())) {

            // --- KIỂM TRA TRẠNG THÁI ---
            if (Boolean.FALSE.equals(user.getStatus())) {
                return ResponseEntity.status(403).body("Tài khoản của bạn đã bị khóa! Vui lòng liên hệ Admin.");
            }
            // ---------------------------------------

            // Tạo Token
            String token = jwtUtils.generateToken(user);

            // Lấy danh sách quyền
            List<String> roleNames = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", user.getUsername());
            response.put("fullName", user.getFullName());
            response.put("roles", roleNames);

            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body("Sai thông tin đăng nhập!");
    }
}
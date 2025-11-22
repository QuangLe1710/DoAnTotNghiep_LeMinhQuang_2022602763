package com.example.demo.util;

import com.example.demo.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
    // KHÓA BÍ MẬT: Giữ nguyên chuỗi dài này để đảm bảo an toàn
    private static final String SECRET_KEY = "DoAnTotNghiep_LeMinhQuang_BiMatKhongDuocTietLo_PhaiDu32KyTu";
    private static final long EXPIRATION_TIME = 86400000L; // 1 ngày

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("role", user.getRole())
                .claim("userId", user.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
}
package com.example.demo.util;

import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class JwtUtils {
    // Secret Key (Nên để trong application.properties, nhưng demo để đây cũng được)
    private static final String SECRET_KEY = "DoAnTotNghiep_LeMinhQuang_BiMatKhongDuocTietLo_PhaiDu32KyTu";
    private static final long EXPIRATION_TIME = 86400000L; // 1 ngày

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // 1. Tạo Token từ thông tin User mới (Sửa lại logic lấy Role)
    public String generateToken(User user) {
        // Chuyển Set<Role> thành List<String> (VD: ["ROLE_ADMIN", "ROLE_USER"])
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("roles", roles) // Lưu key là "roles" (số nhiều)
                .claim("userId", user.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. Lấy Username
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 3. Lấy Danh sách Roles (Sửa lại để hứng List)
    public List<String> extractRoles(String token) {
        return extractAllClaims(token).get("roles", List.class);
    }

    // 4. Validate Token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
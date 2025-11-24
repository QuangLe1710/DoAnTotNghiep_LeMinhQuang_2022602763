package com.example.demo.config;

import com.example.demo.util.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Lấy token từ Header "Authorization"
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;
        String role = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Cắt bỏ chữ "Bearer "
            if (jwtUtils.validateToken(token)) {
                username = jwtUtils.extractUsername(token);
                role = jwtUtils.extractRole(token);
            }
        }

        // 2. Nếu Token hợp lệ và chưa xác thực -> Set quyền cho User
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Tạo đối tượng User ảo trong Spring Security
            // Lưu ý: role trong DB là "ADMIN" thì Spring cần quyền là "ADMIN" (hoặc ROLE_ADMIN tùy cấu hình)
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    username, null, Collections.singletonList(authority));

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // "Đóng dấu" là user này đã đăng nhập
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        // 3. Cho phép request đi tiếp
        filterChain.doFilter(request, response);
    }
}
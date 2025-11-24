package com.example.demo.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private com.example.demo.config.JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Tắt CSRF
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Không dùng Session, chỉ dùng Token
                .authorizeHttpRequests(auth -> auth
                        // 1. PUBLIC (Ai cũng vào được)
                        .requestMatchers("/api/auth/**").permitAll() // Đăng nhập/Đăng ký
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll() // Xem sản phẩm (GET) thì OK
                        .requestMatchers(HttpMethod.GET, "/api/products/{id}").permitAll()

                        // 2. ADMIN ONLY (Chỉ Admin mới được làm)
                        .requestMatchers("/api/dashboard/**").hasAuthority("ADMIN") // Xem thống kê
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasAuthority("ADMIN") // Thêm sản phẩm
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAuthority("ADMIN") // Sửa sản phẩm
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAuthority("ADMIN") // Xóa sản phẩm
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/status").hasAuthority("ADMIN") // Duyệt đơn hàng
                        .requestMatchers("/api/orders").hasAuthority("ADMIN") // Xem tất cả đơn hàng (cho AdminOrder page)
                        .requestMatchers("/api/orders/pending-orders").hasAuthority("ADMIN") // Thông báo admin
                        .requestMatchers("/api/orders/count-pending").hasAuthority("ADMIN")

                        // 3. USER & ADMIN (Đã đăng nhập là được)
                        .requestMatchers("/api/orders/place").authenticated() // Đặt hàng
                        .requestMatchers("/api/orders/my-orders/**").authenticated() // Xem lịch sử đơn
                        .requestMatchers("/api/orders/*/cancel").authenticated() // Hủy đơn

                        // 4. CÁC API KHÁC -> Yêu cầu đăng nhập
                        .anyRequest().authenticated()
                )
                // Thêm bộ lọc JWT vào trước bộ lọc Username/Password mặc định
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
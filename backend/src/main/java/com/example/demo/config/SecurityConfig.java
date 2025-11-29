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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. PUBLIC ENDPOINTS (Ai cũng vào được)
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers("/api/payment/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // Swagger UI
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // 2. ORDER API CHO KHÁCH HÀNG (USER & ADMIN ĐỀU DÙNG ĐƯỢC)
                        // [QUAN TRỌNG] Phải đặt đoạn này TRƯỚC đoạn Admin bên dưới
                        .requestMatchers(HttpMethod.POST, "/api/orders/place").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/orders/my-orders/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/cancel").authenticated()

                        // 3. ADMIN ENDPOINTS
                        .requestMatchers("/api/dashboard/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAuthority("ROLE_ADMIN")

                        // Admin quản lý tất cả các API order còn lại (duyệt đơn, xem tất cả...)
                        .requestMatchers("/api/orders/**").hasAuthority("ROLE_ADMIN")

                        // 4. AUTHENTICATED (Các cái còn lại chỉ cần login)
                        .requestMatchers("/api/carts/**").authenticated()

                        .requestMatchers("/api/vouchers/active").permitAll() // Hoặc .authenticated() tùy bạn
                        .requestMatchers("/api/vouchers/check").authenticated() // API check mã thì cần login

                        .requestMatchers("/api/dashboard/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users").hasAuthority("ROLE_ADMIN") // <--- MỚI: Xem list user
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/status").hasAuthority("ROLE_ADMIN") // <--- MỚI: Khóa user

                        // --- QUẢN LÝ DANH MỤC & THƯƠNG HIỆU ---
                        // 1. Cho phép xem (Public)
                        .requestMatchers(HttpMethod.GET, "/api/brands/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()

                        // 2. Thêm/Sửa/Xóa (Admin)
                        .requestMatchers("/api/brands/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/categories/**").hasAuthority("ROLE_ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("*"));
        configuration.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
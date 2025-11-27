package com.example.demo.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer; // Import mới
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration; // Import mới
import org.springframework.web.cors.CorsConfigurationSource; // Import mới
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // Import mới

import java.util.List; // Import mới

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
                // 1. [QUAN TRỌNG] Kích hoạt CORS trong Security
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 2. PUBLIC API
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/{id}").permitAll()

                        // Cho phép API thanh toán VNPay (quan trọng khi redirect)
                        .requestMatchers("/api/payment/**").permitAll()

                        // 3. ADMIN ONLY
                        .requestMatchers("/api/dashboard/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/status").hasAuthority("ADMIN")
                        .requestMatchers("/api/orders").hasAuthority("ADMIN")
                        .requestMatchers("/api/orders/pending-orders").hasAuthority("ADMIN")
                        .requestMatchers("/api/orders/count-pending").hasAuthority("ADMIN")

                        // --- [THÊM ĐOẠN NÀY] MỞ CỔNG SWAGGER UI ---
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // 4. USER & ADMIN
                        .requestMatchers("/api/orders/place").authenticated()
                        .requestMatchers("/api/orders/my-orders/**").authenticated()
                        .requestMatchers("/api/orders/*/cancel").authenticated()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // --- [HÀM MỚI] Cấu hình cho phép Frontend gọi API ---
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Cho phép mọi nguồn (hoặc bạn có thể chỉ định "http://localhost:5173")
        configuration.setAllowedOrigins(List.of("*"));
        // Cho phép mọi method (GET, POST, PUT, DELETE...)
        configuration.setAllowedMethods(List.of("*"));
        // Cho phép mọi header (Authorization, Content-Type...)
        configuration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
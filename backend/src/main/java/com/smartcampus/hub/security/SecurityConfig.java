package com.smartcampus.hub.security;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2LoginSuccessHandler successHandler;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService,
                          OAuth2LoginSuccessHandler successHandler) {
        this.customOAuth2UserService = customOAuth2UserService;
        this.successHandler = successHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth

                // ✅ FIX: allow /me without login (VERY IMPORTANT)
                .requestMatchers("/api/v1/user/me").permitAll()

                // ✅ Member 1 endpoints
                .requestMatchers("/resources/**").permitAll()
                .requestMatchers("/resources").permitAll()
                .requestMatchers("/resource-types/**").permitAll()
                .requestMatchers("/resource-types").permitAll()

                // ✅ Member 3 endpoints
                .requestMatchers("/api/v1/tickets/**", "/tickets/**")
                    .hasAnyRole("USER", "ADMIN", "TECHNICIAN")
                // 👑 ADMIN
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                // 🛠 TECHNICIAN
                .requestMatchers("/api/v1/technician/**").hasRole("TECHNICIAN")

                // 🔔 Notifications
                .requestMatchers("/api/v1/notifications/**")
                    .hasAnyRole("USER", "ADMIN", "TECHNICIAN")

                // 👤 User endpoints
                .requestMatchers("/api/v1/user/**")
                    .hasAnyRole("USER", "ADMIN", "TECHNICIAN")

                .anyRequest().authenticated()
            )

            .oauth2Login(oauth -> oauth
                .successHandler(successHandler)
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
            )

            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("http://localhost:5173")
                .permitAll()
            );

        return http.build();
    }

    // ✅ FIX: CORS configuration (REQUIRED)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
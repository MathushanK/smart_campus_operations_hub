package com.smartcampus.hub.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

        for (GrantedAuthority authority : authorities) {

            // 👑 ADMIN
            if (authority.getAuthority().equals("ROLE_ADMIN")) {
                response.sendRedirect("/api/v1/admin/dashboard");
                return;
            }

            // 🛠 TECHNICIAN
            else if (authority.getAuthority().equals("ROLE_TECHNICIAN")) {
                response.sendRedirect("/api/v1/technician/dashboard");
                return;
            }

            // 👤 USER
            else if (authority.getAuthority().equals("ROLE_USER")) {
                response.sendRedirect("/api/v1/user/dashboard");
                return;
            }
        }

        // fallback
        response.sendRedirect("/");
    }
}
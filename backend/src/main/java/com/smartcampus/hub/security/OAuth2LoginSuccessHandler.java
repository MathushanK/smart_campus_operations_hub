package com.smartcampus.hub.security;


import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final String frontendUrl;

    public OAuth2LoginSuccessHandler(
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }

    @Override
public void onAuthenticationSuccess(HttpServletRequest request,
                                    HttpServletResponse response,
                                    Authentication authentication)
        throws IOException {

    Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

    for (GrantedAuthority authority : authorities) {

        if (authority.getAuthority().equals("ROLE_ADMIN")) {
            response.sendRedirect(frontendUrl + "/admin/dashboard");
            return;
        }

        if (authority.getAuthority().equals("ROLE_TECHNICIAN")) {
            response.sendRedirect(frontendUrl + "/technician/dashboard");
            return;
        }

        if (authority.getAuthority().equals("ROLE_USER")) {
            response.sendRedirect(frontendUrl + "/user/dashboard");
            return;
        }
    }

    response.sendRedirect(frontendUrl);
}
}

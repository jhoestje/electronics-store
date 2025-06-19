package com.store.electronics.dto;

import com.store.electronics.model.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private User user;
}

package com.example.demo.controller;

import com.example.demo.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ChatController {
    @Autowired
    private GeminiService geminiService;

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody Map<String, String> body) {
        String message = body.get("message");
        String response = geminiService.getChatResponse(message);
        return ResponseEntity.ok(Map.of("reply", response));
    }
}
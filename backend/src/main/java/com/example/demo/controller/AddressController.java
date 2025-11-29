package com.example.demo.controller;

import com.example.demo.dto.AddressDTO;
import com.example.demo.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AddressController {
    @Autowired
    private AddressService addressService;

    private String getUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(addressService.getAll(getUsername()));
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestBody AddressDTO dto) {
        return ResponseEntity.ok(addressService.addAddress(getUsername(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody AddressDTO dto) {
        return ResponseEntity.ok(addressService.updateAddress(getUsername(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        addressService.deleteAddress(getUsername(), id);
        return ResponseEntity.ok("Deleted");
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<?> setDefault(@PathVariable Long id) {
        addressService.setDefault(getUsername(), id);
        return ResponseEntity.ok("Set default success");
    }
}
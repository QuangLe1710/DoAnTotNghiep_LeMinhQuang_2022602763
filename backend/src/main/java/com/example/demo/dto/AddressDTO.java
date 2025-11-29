package com.example.demo.dto;
import lombok.Data;

@Data
public class AddressDTO {
    private Long id;
    private String receiverName;
    private String phone;
    private String detailAddress;
    private String city; // Tỉnh/Thành phố
    private Boolean isDefault;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDetailAddress() {
        return detailAddress;
    }

    public void setDetailAddress(String detailAddress) {
        this.detailAddress = detailAddress;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

//    public Boolean getDefault() {
//        return isDefault;
//    }

//    public void setDefault(Boolean aDefault) {
//        isDefault = aDefault;
//    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

}
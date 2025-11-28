-- 1. Setup Database
DROP DATABASE IF EXISTS `mylap_db`;
CREATE DATABASE `mylap_db`;
USE `mylap_db`;

-- ==========================================
-- MODULE: AUTH & USERS
-- ==========================================

-- Bảng Roles: Quản lý quyền hạn (Admin, Customer, Staff)
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL UNIQUE, -- VD: ROLE_ADMIN, ROLE_USER
  `description` varchar(255),
  PRIMARY KEY (`id`)
);

-- Bảng Users: Chỉ chứa thông tin đăng nhập và định danh
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL, -- Đã mã hóa (BCrypt)
  `email` varchar(100) NOT NULL UNIQUE,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(15), -- SĐT chính
  `avatar` varchar(255),
  `status` bit DEFAULT 1, -- 1: Active, 0: Banned
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `theme_preference` varchar(20) DEFAULT 'light', -- Feedback: Theme
  PRIMARY KEY (`id`)
);

-- Bảng User_Roles: Liên kết N-N giữa User và Role
CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
);

-- Bảng Addresses: Sổ địa chỉ (User có thể có nhiều địa chỉ giao hàng)
CREATE TABLE `addresses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `receiver_name` varchar(100),
  `phone` varchar(15),
  `detail_address` varchar(255),
  `city` varchar(100),
  `is_default` bit DEFAULT 0,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);

-- ==========================================
-- MODULE: PRODUCT CATALOG
-- ==========================================

-- Bảng Categories: Danh mục (Laptop Gaming, Văn phòng...)
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL UNIQUE, -- URL friendly
  `description` text,
  PRIMARY KEY (`id`)
);

-- Bảng Brands: Thương hiệu (Dell, Asus, Macbook...) - Feedback: Quản lý Brand
CREATE TABLE `brands` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `logo_url` varchar(255),
  `origin` varchar(100), -- Xuất xứ
  PRIMARY KEY (`id`)
);

-- Bảng Products: Sản phẩm chính
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `price` double NOT NULL, -- Giá gốc
  `sale_price` double, -- Giá khuyến mãi (nếu có)
  `stock_quantity` int DEFAULT 0, -- Feedback: Thêm quantity
  `warranty_period` int DEFAULT 12, -- Feedback: Bảo hành (số tháng)
  `description` longtext, -- Mô tả chi tiết (HTML)
  `short_description` text,
  `view_count` int DEFAULT 0,
  -- Foreign Keys placeholders
  `category_id` bigint,
  `brand_id` bigint,
  -- Cấu hình Laptop (Specification)
  `cpu` varchar(100),
  `ram` varchar(100),
  `storage` varchar(100),
  `screen` varchar(100),
  `gpu` varchar(100),
  `battery` varchar(100),
  `weight` float,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`)
);

-- Bảng Product_Images: Ảnh sản phẩm (1 sp có nhiều ảnh) - Feedback: Bảng IMG riêng
CREATE TABLE `product_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_thumbnail` bit DEFAULT 0, -- Ảnh đại diện
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
);

-- ==========================================
-- MODULE: MARKETING & SALES
-- ==========================================

-- Bảng Vouchers: Mã giảm giá - Feedback: Voucher
CREATE TABLE `vouchers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL UNIQUE, -- VD: SALE50
  `discount_type` varchar(20) NOT NULL, -- 'PERCENT' hoặc 'FIXED_AMOUNT'
  `discount_value` double NOT NULL, -- 10 (10%) hoặc 50000 (50k)
  `min_order_value` double DEFAULT 0, -- Đơn tối thiểu
  `max_usage` int DEFAULT 100, -- Số lượng mã
  `usage_count` int DEFAULT 0, -- Đã dùng bao nhiêu
  `start_date` datetime,
  `end_date` datetime,
  `status` bit DEFAULT 1,
  PRIMARY KEY (`id`)
);

-- ==========================================
-- MODULE: ORDERS & HISTORY
-- ==========================================

-- Bảng Orders: Đơn hàng
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint, -- Null nếu mua vãng lai (tùy nghiệp vụ)
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `total_amount` double NOT NULL, -- Tổng tiền hàng
  `final_amount` double NOT NULL, -- Tổng tiền sau khi trừ voucher
  `voucher_id` bigint,
  -- Thông tin giao hàng (Snapshot từ bảng Address hoặc nhập mới)
  `shipping_address` varchar(500) NOT NULL,
  `shipping_phone` varchar(15) NOT NULL,
  `shipping_name` varchar(100) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'COD', -- COD, VN_PAY
  `payment_status` varchar(50) DEFAULT 'UNPAID', -- PAID, UNPAID
  `status` varchar(50) DEFAULT 'PENDING', -- PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED
  `note` text,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_orders_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`)
);

-- Bảng Order_Details: Chi tiết đơn hàng
CREATE TABLE `order_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `price` double NOT NULL, -- LƯU Ý: Lưu giá tại thời điểm mua (không lấy giá từ bảng product)
  `total_price` double NOT NULL, -- quantity * price
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_od_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_od_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
);

-- Bảng Order_History: Lịch sử cập nhật đơn hàng - Feedback: Thêm bảng History
CREATE TABLE `order_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `action` varchar(50), -- VD: "CHANGE_STATUS", "UPDATE_ADDRESS"
  `status_from` varchar(50), -- Trạng thái cũ
  `status_to` varchar(50), -- Trạng thái mới
  `note` text, -- Ghi chú (VD: Khách hàng hủy vì lý do...)
  `updated_by` varchar(100), -- Ai cập nhật (Admin hay User)
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
);

-- ==========================================
-- MODULE: SHOPPING CART (Database storage)
-- Feedback: Bảo mật local storage và giỏ hàng
-- ==========================================

CREATE TABLE `carts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL UNIQUE, -- Mỗi user 1 giỏ hàng
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);

CREATE TABLE `cart_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cart_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ci_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ci_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
);
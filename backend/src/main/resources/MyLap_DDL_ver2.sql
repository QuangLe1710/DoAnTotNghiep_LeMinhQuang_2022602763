-- CHỌN DATABASE MẶC ĐỊNH CỦA AIVEN
USE `defaultdb`;

-- ==========================================
-- 0. CLEANUP (Xóa bảng cũ nếu có để tránh lỗi trùng)
-- Lưu ý: Phải xóa bảng con trước, bảng cha sau
-- ==========================================
DROP TABLE IF EXISTS `order_history`;
DROP TABLE IF EXISTS `order_details`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `carts`;
DROP TABLE IF EXISTS `product_images`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `brands`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `addresses`;
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `vouchers`;

-- ==========================================
-- MODULE: AUTH & USERS
-- ==========================================

CREATE TABLE `roles` (
                         `id` bigint NOT NULL AUTO_INCREMENT,
                         `name` varchar(50) NOT NULL UNIQUE,
                         `description` varchar(255),
                         PRIMARY KEY (`id`)
);

CREATE TABLE `users` (
                         `id` bigint NOT NULL AUTO_INCREMENT,
                         `username` varchar(50) NOT NULL UNIQUE,
                         `password` varchar(255) NOT NULL,
                         `email` varchar(100) NOT NULL UNIQUE,
                         `full_name` varchar(100) NOT NULL,
                         `phone` varchar(15),
                         `avatar` varchar(255),
                         `status` bit DEFAULT 1,
                         `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
                         `theme_preference` varchar(20) DEFAULT 'light',
                         PRIMARY KEY (`id`)
);

CREATE TABLE `user_roles` (
                              `user_id` bigint NOT NULL,
                              `role_id` bigint NOT NULL,
                              PRIMARY KEY (`user_id`, `role_id`),
                              CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
                              CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
);

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

CREATE TABLE `categories` (
                              `id` bigint NOT NULL AUTO_INCREMENT,
                              `name` varchar(100) NOT NULL,
                              `slug` varchar(100) NOT NULL UNIQUE,
                              `description` text,
                              PRIMARY KEY (`id`)
);

CREATE TABLE `brands` (
                          `id` bigint NOT NULL AUTO_INCREMENT,
                          `name` varchar(100) NOT NULL,
                          `logo_url` varchar(255),
                          `origin` varchar(100),
                          PRIMARY KEY (`id`)
);

CREATE TABLE `products` (
                            `id` bigint NOT NULL AUTO_INCREMENT,
                            `name` varchar(255) NOT NULL,
                            `slug` varchar(255) NOT NULL UNIQUE,
                            `price` double NOT NULL,
                            `sale_price` double,
                            `stock_quantity` int DEFAULT 0,
                            `warranty_period` int DEFAULT 12,
                            `description` longtext,
                            `short_description` text,
                            `view_count` int DEFAULT 0,
                            `category_id` bigint,
                            `brand_id` bigint,
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

CREATE TABLE `product_images` (
                                  `id` bigint NOT NULL AUTO_INCREMENT,
                                  `product_id` bigint NOT NULL,
                                  `image_url` varchar(500) NOT NULL,
                                  `is_thumbnail` bit DEFAULT 0,
                                  PRIMARY KEY (`id`),
                                  CONSTRAINT `fk_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
);

-- ==========================================
-- MODULE: MARKETING & SALES
-- ==========================================

CREATE TABLE `vouchers` (
                            `id` bigint NOT NULL AUTO_INCREMENT,
                            `code` varchar(20) NOT NULL UNIQUE,
                            `discount_type` varchar(20) NOT NULL,
                            `discount_value` double NOT NULL,
                            `min_order_value` double DEFAULT 0,
                            `max_usage` int DEFAULT 100,
                            `usage_count` int DEFAULT 0,
                            `start_date` datetime,
                            `end_date` datetime,
                            `status` bit DEFAULT 1,
                            PRIMARY KEY (`id`)
);

-- ==========================================
-- MODULE: ORDERS & HISTORY
-- ==========================================

CREATE TABLE `orders` (
                          `id` bigint NOT NULL AUTO_INCREMENT,
                          `user_id` bigint,
                          `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
                          `total_amount` double NOT NULL,
                          `final_amount` double NOT NULL,
                          `voucher_id` bigint,
                          `shipping_address` varchar(500) NOT NULL,
                          `shipping_phone` varchar(15) NOT NULL,
                          `shipping_name` varchar(100) NOT NULL,
                          `payment_method` varchar(50) DEFAULT 'COD',
                          `payment_status` varchar(50) DEFAULT 'UNPAID',
                          `status` varchar(50) DEFAULT 'PENDING',
                          `note` text,
                          PRIMARY KEY (`id`),
                          CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
                          CONSTRAINT `fk_orders_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`)
);

CREATE TABLE `order_details` (
                                 `id` bigint NOT NULL AUTO_INCREMENT,
                                 `order_id` bigint NOT NULL,
                                 `product_id` bigint NOT NULL,
                                 `quantity` int NOT NULL,
                                 `price` double NOT NULL,
                                 `total_price` double NOT NULL,
                                 PRIMARY KEY (`id`),
                                 CONSTRAINT `fk_od_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
                                 CONSTRAINT `fk_od_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
);

CREATE TABLE `order_history` (
                                 `id` bigint NOT NULL AUTO_INCREMENT,
                                 `order_id` bigint NOT NULL,
                                 `action` varchar(50),
                                 `status_from` varchar(50),
                                 `status_to` varchar(50),
                                 `note` text,
                                 `updated_by` varchar(100),
                                 `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
                                 PRIMARY KEY (`id`),
                                 CONSTRAINT `fk_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
);

-- ==========================================
-- MODULE: SHOPPING CART
-- ==========================================

CREATE TABLE `carts` (
                         `id` bigint NOT NULL AUTO_INCREMENT,
                         `user_id` bigint NOT NULL UNIQUE,
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
-- {
-- --     "username": "admin_vip",
-- --     "password": "password123"
-- -- }

-- {
--     "username": "userquang123",
--     "password": "Quang2004@"
-- }

-- Ngân hàng	NCB
-- Số thẻ	9704198526191432198
-- Tên chủ thẻ	NGUYEN VAN A
-- Ngày phát hành	07/15
-- Mật khẩu OTP	123456

USE
defaultdb; -- Hoặc tên DB của bạn

-- Thêm Hãng sản xuất
INSERT INTO brands (name, origin) VALUES
                                      ('Dell', 'USA'),
                                      ('Asus', 'Taiwan'),
                                      ('MacBook', 'USA'),
                                      ('HP', 'USA'),
                                      ('Lenovo', 'China');

-- Thêm Danh mục
INSERT INTO categories (name, slug, description) VALUES
                                                     ('Laptop Gaming', 'gaming', 'Máy cấu hình cao, tản nhiệt tốt'),
                                                     ('Laptop Văn Phòng', 'office', 'Mỏng nhẹ, pin trâu'),
                                                     ('MacBook', 'macbook', 'Sang trọng, hệ điều hành MacOS');


-- 1. Tạo Role Admin (nếu chưa có)
INSERT INTO roles (name, description)
SELECT 'ROLE_ADMIN', 'Quản trị viên cấp cao'
    WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_ADMIN');

-- 2. Gán quyền ROLE_ADMIN cho tài khoản 'admin_vip'
-- (Logic: Tìm ID của admin_vip và ID của ROLE_ADMIN rồi insert vào bảng trung gian)
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
         JOIN roles r ON r.name = 'ROLE_ADMIN'
WHERE u.username = 'admin_vip'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Kiểm tra kết quả
SELECT u.username, r.name as role_name
FROM users u
         JOIN user_roles ur ON u.id = ur.user_id
         JOIN roles r ON r.id = ur.role_id
WHERE u.username = 'admin_vip';

USE defaultdb; -- Hoặc tên DB của bạn

-- Thêm Hãng sản xuất
INSERT INTO brands (name, origin) VALUES
                                      ('Dell', 'USA'),
                                      ('Asus', 'Taiwan'),
                                      ('MacBook', 'USA'),
                                      ('HP', 'USA'),
                                      ('Lenovo', 'China');

-- Thêm Danh mục
INSERT INTO categories (name, slug, description) VALUES
                                                     ('Laptop Gaming', 'gaming', 'Máy cấu hình cao, tản nhiệt tốt'),
                                                     ('Laptop Văn Phòng', 'office', 'Mỏng nhẹ, pin trâu'),
                                                     ('MacBook', 'macbook', 'Sang trọng, hệ điều hành MacOS');

INSERT INTO roles (name, description)
SELECT 'ROLE_ADMIN', 'Quản trị viên cấp cao'
    WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_ADMIN');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
         JOIN roles r ON r.name = 'ROLE_ADMIN'
WHERE u.username = 'admin_vip'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

ALTER TABLE orders ADD COLUMN cancel_reason TEXT DEFAULT NULL;

-- Data DML ---


-- INSERT INTO vouchers (code, discount_type, discount_value, min_order_value, max_usage, start_date, end_date, status)
-- VALUES ('SALE50', 'FIXED', 50000, 100000, 100, NOW(), '2025-12-31', 1);

USE `defaultdb`;

-- ==========================================
-- 1. INSERT ROLES (Quyền hạn)
-- ==========================================
INSERT INTO roles (name, description) VALUES
                                          ('ROLE_ADMIN', 'Quản trị viên cấp cao'),
                                          ('ROLE_USER', 'Khách hàng thành viên')
    ON DUPLICATE KEY UPDATE description=description;

-- ==========================================
-- 2. INSERT USERS (Tài khoản Test)
-- Mật khẩu mặc định: 123456 (Đã mã hóa BCrypt)
-- ==========================================
INSERT INTO users (username, password, email, full_name, phone, status, theme_preference) VALUES
                                                                                              ('admin', '$2a$10$0hdxvBVQHS3BPBWEMzRCO.stM8ubUcgTl6DJI1491LNMR4qq2CWQW', 'admin@mylap.com', 'Admin Quản Trị', '0909123456', 1, 'light'),
                                                                                              ('customer', '$2a$10$0hdxvBVQHS3BPBWEMzRCO.stM8ubUcgTl6DJI1491LNMR4qq2CWQW', 'customer@gmail.com', 'Nguyễn Văn Khách', '0912345678', 1, 'light');

-- Gán quyền (Admin có cả 2 quyền, Customer chỉ có ROLE_USER)
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r WHERE u.username = 'admin';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r WHERE u.username = 'customer' AND r.name = 'ROLE_USER';

-- ==========================================
-- 3. INSERT BRANDS (Thương hiệu)
-- ==========================================
INSERT INTO brands (name, origin, logo_url) VALUES
                                                ('Dell', 'USA', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Dell_Logo.svg/1024px-Dell_Logo.svg.png'),
                                                ('Asus', 'Taiwan', 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Asus_Tek_Computer_Inc._Logo.svg'),
                                                ('MacBook', 'USA', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'),
                                                ('HP', 'USA', 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg'),
                                                ('Lenovo', 'China', 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg'),
                                                ('Acer', 'Taiwan', 'https://upload.wikimedia.org/wikipedia/commons/0/00/Acer_2011.svg'),
                                                ('MSI', 'Taiwan', 'https://upload.wikimedia.org/wikipedia/commons/a/a1/MSI_Logo_2019.svg');

-- ==========================================
-- 4. INSERT CATEGORIES (Danh mục)
-- ==========================================
INSERT INTO categories (name, slug, description) VALUES
    ('Laptop Đồ Họa', 'laptop-graphic', 'Màn hình chuẩn màu, cấu hình render tốt');

-- ==========================================
-- 5. INSERT PRODUCTS (Sản phẩm)
-- ==========================================

USE `defaultdb`;

-- ==========================================
-- 1. THÊM SẢN PHẨM MỚI (HP, Lenovo, Acer, Dell đồ họa)
-- Lưu ý: Tôi để ID bắt đầu từ 20 để tránh trùng với ID cũ của bạn
-- ==========================================

-- SP 20: HP Pavilion (Văn phòng)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (20, 'HP Pavilion 15 eg2035TX', 'hp-pavilion-15', 18500000, 16900000, 30, 12,
        'HP Pavilion 15 sở hữu thiết kế sang trọng, vỏ kim loại nguyên khối. Cấu hình mạnh mẽ với chip Core i5 thế hệ 12 và card rời MX550 phục vụ tốt nhu cầu đồ họa cơ bản và văn phòng.',
        'Laptop văn phòng sang trọng, có card rời',
        120, 2, 4, 'Intel Core i5 1235U', '8GB DDR4', '512GB SSD', '15.6 inch FHD IPS', 'NVIDIA MX550 2GB', '3 Cell 41Wh', 1.74, NOW());

-- SP 21: Lenovo Legion 5 (Gaming)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (21, 'Lenovo Legion 5 Pro Y9000P', 'lenovo-legion-5-pro', 32000000, 29990000, 15, 24,
        'Màn hình 16 inch WQHD 165Hz chuẩn màu 100% sRGB. Hệ thống tản nhiệt Coldfront 3.0 giúp máy luôn mát mẻ khi chiến game nặng.',
        'Cỗ máy chiến game màn hình 2K siêu đẹp',
        500, 1, 5, 'Ryzen 7 6800H', '16GB DDR5', '512GB SSD', '16 inch WQHD 165Hz', 'RTX 3060 6GB', '80Wh', 2.4, NOW());

-- SP 22: Acer Nitro 5 (Gaming giá rẻ)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (22, 'Acer Nitro 5 Tiger AN515', 'acer-nitro-5-tiger', 22000000, 19490000, 40, 12,
        'Thiết kế hầm hố chuẩn Gaming. Bàn phím LED RGB 4 vùng. Công nghệ tản nhiệt Acer CoolBoost tăng hiệu suất làm mát.',
        'Ông vua Laptop Gaming phân khúc phổ thông',
        350, 1, 14, 'Intel Core i5 12500H', '16GB DDR4', '512GB SSD', '15.6 inch FHD 144Hz', 'RTX 3050 Ti', '57Wh', 2.5, NOW());

-- SP 23: Dell Precision (Đồ họa)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (23, 'Dell Precision 5570 Mobile Workstation', 'dell-precision-5570', 48000000, 45000000, 5, 36,
        'Dòng máy trạm di động cao cấp nhất của Dell. Thiết kế mỏng nhẹ như XPS nhưng mang sức mạnh đồ họa chuyên nghiệp. Màn hình độ phủ màu tuyệt đối.',
        'Máy trạm di động chuyên đồ họa, render 3D',
        80, 6, 1, 'Intel Core i7 12800H', '32GB DDR5', '1TB SSD', '15.6 inch UHD+ Touch', 'NVIDIA RTX A2000', '86Wh', 1.84, NOW());

-- SP 24: Asus Zenbook (Văn phòng cao cấp)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (24, 'Asus Zenbook 14 OLED', 'asus-zenbook-14-oled', 24990000, 22990000, 20, 24,
        'Màn hình OLED 2.8K rực rỡ, tần số quét 90Hz. Thiết kế siêu mỏng nhẹ chỉ 1.39kg, đạt chuẩn độ bền quân đội Mỹ.',
        'Tuyệt phẩm màn hình OLED, mỏng nhẹ thời trang',
        210, 2, 2, 'Intel Core i5 1240P', '16GB LPDDR5', '512GB SSD', '14 inch 2.8K OLED', 'Intel Iris Xe', '75Wh', 1.39, NOW());

USE `defaultdb`;

-- SP 25: Dell Inspiron 15 (Văn phòng)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (25, 'Dell Inspiron 15 3520', 'dell-inspiron-15-3520', 16500000, 14990000, 50, 12,
        'Dell Inspiron 15 là sự lựa chọn hoàn hảo cho sinh viên và nhân viên văn phòng. Hiệu năng ổn định, thiết kế bền bỉ đặc trưng của Dell.',
        'Laptop văn phòng bền bỉ, giá tốt',
        200, 2, 1, 'Intel Core i5 1235U', '8GB DDR4', '512GB SSD', '15.6 inch FHD 120Hz', 'Intel UHD Graphics', '3 Cell 41Wh', 1.65, NOW());

-- SP 26: Asus TUF Gaming (Gaming)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (26, 'Asus TUF Gaming F15 FX506', 'asus-tuf-gaming-f15', 19990000, 18490000, 25, 24,
        'Độ bền chuẩn quân đội, cấu hình mạnh mẽ trong tầm giá. Asus TUF F15 là người bạn đồng hành đáng tin cậy của mọi game thủ.',
        'Gaming bền bỉ chuẩn quân đội',
        450, 1, 2, 'Intel Core i5 11400H', '8GB DDR4', '512GB SSD', '15.6 inch FHD 144Hz', 'RTX 3050 4GB', '48Wh', 2.3, NOW());

-- SP 27: MacBook Pro 16 M1 (Đồ họa)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (27, 'MacBook Pro 16 M1 Pro', 'macbook-pro-16-m1', 42000000, 39500000, 10, 12,
        'Siêu phẩm đồ họa với màn hình lớn 16 inch, chip M1 Pro mạnh mẽ xử lý mọi tác vụ nặng.',
        'Máy trạm di động của Apple',
        600, 4, 3, 'Apple M1 Pro', '16GB Unified', '512GB SSD', '16.2 inch Liquid Retina XDR', '16-Core GPU', '100Wh', 2.1, NOW());

-- SP 28: HP Victus 16 (Gaming)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (28, 'HP Victus 16 e1106AX', 'hp-victus-16', 23500000, 21990000, 20, 12,
        'HP Victus 16 mang đến trải nghiệm chơi game mượt mà với màn hình lớn 16.1 inch và hệ thống tản nhiệt cải tiến.',
        'Gaming màn hình lớn, thiết kế tối giản',
        320, 1, 4, 'Ryzen 7 6800H', '8GB DDR5', '512GB SSD', '16.1 inch FHD 144Hz', 'RTX 3050Ti 4GB', '70Wh', 2.46, NOW());

-- SP 29: Lenovo ThinkPad X1 Carbon (Văn phòng cao cấp)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (29, 'Lenovo ThinkPad X1 Carbon Gen 10', 'thinkpad-x1-carbon-gen10', 45000000, 42500000, 8, 36,
        'Biểu tượng của dòng laptop doanh nhân. Siêu nhẹ, bàn phím trứ danh, bảo mật tuyệt đối.',
        'Laptop doanh nhân huyền thoại',
        250, 2, 5, 'Intel Core i7 1260P', '16GB LPDDR5', '1TB SSD', '14 inch WUXGA', 'Intel Iris Xe', '57Wh', 1.12, NOW());

-- SP 30: Acer Swift 3 (Văn phòng)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (30, 'Acer Swift 3 SF314', 'acer-swift-3', 17500000, 15900000, 35, 12,
        'Acer Swift 3 mỏng nhẹ, thời trang, hiệu năng đủ dùng cho mọi tác vụ văn phòng và giải trí nhẹ nhàng.',
        'Mỏng nhẹ, vỏ nhôm nguyên khối',
        180, 2, 14, 'Intel Core i5 1240P', '16GB LPDDR4x', '512GB SSD', '14 inch QHD IPS', 'Intel Iris Xe', '56Wh', 1.2, NOW());

-- SP 31: MSI Raider GE78 (Gaming cao cấp)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (31, 'MSI Raider GE78 HX', 'msi-raider-ge78', 89000000, 85000000, 3, 24,
        'Quái vật hiệu năng với chip HX và card RTX 4080. Dải đèn LED Matrix cực ngầu.',
        'Flagship Gaming cấu hình khủng long',
        900, 1, 7, 'Intel Core i9 13980HX', '32GB DDR5', '2TB SSD', '17 inch QHD+ 240Hz', 'RTX 4080 12GB', '99.9Wh', 3.1, NOW());

-- SP 32: Dell Vostro 3510 (Văn phòng giá rẻ)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (32, 'Dell Vostro 3510', 'dell-vostro-3510', 14500000, 12990000, 60, 12,
        'Dell Vostro bền bỉ, đáp ứng tốt nhu cầu học tập và làm việc cơ bản với mức giá phải chăng.',
        'Laptop học tập văn phòng giá rẻ',
        150, 2, 1, 'Intel Core i3 1115G4', '8GB DDR4', '256GB SSD', '15.6 inch FHD', 'Intel UHD Graphics', '41Wh', 1.69, NOW());

-- SP 33: MacBook Air M1 (Văn phòng/Đồ họa nhẹ)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (33, 'MacBook Air M1 2020', 'macbook-air-m1', 18500000, 17900000, 100, 12,
        'Chiếc MacBook bán chạy nhất mọi thời đại. Hiệu năng vẫn rất tốt, pin trâu vô đối.',
        'Huyền thoại giá rẻ của Apple',
        2000, 2, 3, 'Apple M1', '8GB Unified', '256GB SSD', '13.3 inch Retina', '7-Core GPU', '18h sử dụng', 1.29, NOW());

-- SP 34: Asus Zenbook Duo (Đồ họa/Sáng tạo)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (34, 'Asus Zenbook Duo 14', 'asus-zenbook-duo', 35000000, 32990000, 10, 24,
        'Thiết kế 2 màn hình độc đáo, tối ưu cho quy trình làm việc đa nhiệm và sáng tạo nội dung.',
        'Laptop 2 màn hình độc đáo',
        350, 3, 2, 'Intel Core i7 1165G7', '16GB LPDDR4x', '1TB SSD', '14 inch FHD Touch + ScreenPad Plus', 'NVIDIA MX450', '70Wh', 1.6, NOW());

-- SP 35: HP Omen 16 (Gaming)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (35, 'HP Omen 16', 'hp-omen-16', 38000000, 35900000, 12, 24,
        'HP Omen mang đến hiệu năng gaming cao cấp trong một thiết kế tối giản, lịch lãm.',
        'Gaming cao cấp, thiết kế tối giản',
        280, 1, 4, 'Intel Core i7 12700H', '16GB DDR5', '1TB SSD', '16.1 inch QHD 165Hz', 'RTX 3070Ti 8GB', '83Wh', 2.35, NOW());

-- SP 36: Lenovo Yoga Slim 7 (Văn phòng)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (36, 'Lenovo Yoga Slim 7 Pro', 'lenovo-yoga-slim-7', 26000000, 24500000, 20, 24,
        'Vỏ nhôm cao cấp, màn hình OLED 90Hz mượt mà. Hiệu năng mạnh mẽ với chip dòng H.',
        'Mỏng nhẹ, màn hình OLED tuyệt đẹp',
        220, 2, 5, 'Intel Core i5 12500H', '16GB LPDDR5', '512GB SSD', '14 inch 2.8K OLED', 'Intel Iris Xe', '61Wh', 1.4, NOW());

-- SP 37: Acer Predator Helios 300 (Gaming)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (37, 'Acer Predator Helios 300', 'acer-predator-helios-300', 34000000, 31990000, 15, 12,
        'Vũ khí chiến game đích thực với logo Predator phát sáng. Tản nhiệt AeroBlade 3D độc quyền.',
        'Chiến binh Gaming tầm trung',
        400, 1, 14, 'Intel Core i7 12700H', '16GB DDR5', '512GB SSD', '15.6 inch QHD 165Hz', 'RTX 3060 6GB', '90Wh', 2.6, NOW());

-- SP 38: Dell Alienware x14 (Gaming mỏng nhẹ)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (38, 'Dell Alienware x14 R1', 'alienware-x14', 45000000, 42000000, 5, 24,
        'Laptop gaming 14 inch mỏng nhất thế giới. Thiết kế phi thuyền tương lai cực chất.',
        'Gaming siêu mỏng, thiết kế tương lai',
        800, 1, 1, 'Intel Core i7 12700H', '16GB LPDDR5', '512GB SSD', '14 inch FHD 144Hz', 'RTX 3060 6GB', '80Wh', 1.84, NOW());

-- SP 39: MSI Modern 14 (Văn phòng giá rẻ)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (39, 'MSI Modern 14 C11M', 'msi-modern-14', 12500000, 10990000, 40, 12,
        'Thiết kế trẻ trung, gọn nhẹ, phù hợp học sinh sinh viên với mức giá cực kỳ hấp dẫn.',
        'Laptop sinh viên ngon bổ rẻ',
        260, 2, 7, 'Intel Core i3 1115G4', '8GB DDR4', '256GB SSD', '14 inch FHD IPS', 'Intel UHD Graphics', '39Wh', 1.3, NOW());

-- SP 40: MacBook Pro 13 M2 (Văn phòng/Đồ họa)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (40, 'MacBook Pro 13 M2', 'macbook-pro-13-m2', 30000000, 28500000, 30, 12,
        'Thiết kế cổ điển với Touch Bar, nâng cấp sức mạnh với chip M2.',
        'MacBook Pro cuối cùng có Touch Bar',
        300, 3, 3, 'Apple M2', '8GB Unified', '256GB SSD', '13.3 inch Retina', '10-Core GPU', '20h sử dụng', 1.4, NOW());

-- SP 41: Asus Vivobook Pro 15 OLED (Đồ họa)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (41, 'Asus Vivobook Pro 15 OLED', 'asus-vivobook-pro-15', 22000000, 20500000, 25, 24,
        'Màn hình OLED chuẩn màu, cấu hình mạnh mẽ cho creator mới vào nghề.',
        'Laptop đồ họa giá mềm màn OLED',
        190, 3, 2, 'Ryzen 7 5800H', '16GB DDR4', '512GB SSD', '15.6 inch OLED FHD', 'RTX 3050 4GB', '63Wh', 1.65, NOW());

-- SP 42: HP Envy 13 (Văn phòng cao cấp)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (42, 'HP Envy 13 ba1536TU', 'hp-envy-13', 24000000, 22500000, 15, 12,
        'Thiết kế kim loại nguyên khối, màn hình viền siêu mỏng, bảo mật vân tay.',
        'Ultrabook thời trang, cao cấp',
        140, 2, 4, 'Intel Core i5 1135G7', '8GB DDR4', '512GB SSD', '13.3 inch FHD IPS', 'Intel Iris Xe', '51Wh', 1.3, NOW());

-- SP 43: Lenovo Ideapad Gaming 3 (Gaming giá rẻ)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (43, 'Lenovo Ideapad Gaming 3', 'lenovo-ideapad-gaming-3', 16500000, 15000000, 50, 24,
        'Chiến game ngon trong tầm giá rẻ. Bàn phím gõ cực sướng thừa hưởng từ ThinkPad.',
        'Gaming phổ thông bàn phím ngon',
        380, 1, 5, 'Ryzen 5 5600H', '8GB DDR4', '512GB SSD', '15.6 inch FHD 120Hz', 'GTX 1650 4GB', '45Wh', 2.25, NOW());

-- SP 44: Acer Aspire 7 (Sửa brand_id = 14)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (44, 'Acer Aspire 7 Gaming', 'acer-aspire-7', 18000000, 16500000, 40, 12,
        'Thiết kế tối giản như laptop văn phòng nhưng mang cấu hình gaming. Đa dụng cho mọi nhu cầu.',
        'Laptop gaming trá hình văn phòng',
        250, 1, 14, 'Ryzen 5 5500U', '8GB DDR4', '512GB SSD', '15.6 inch FHD 144Hz', 'GTX 1650 4GB', '48Wh', 2.15, NOW());

-- SP 45: Dell G15 (Gaming)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (45, 'Dell G15 5511', 'dell-g15-5511', 26000000, 24000000, 20, 12,
        'Thừa hưởng hệ thống tản nhiệt từ Alienware. Thiết kế chắc chắn, bền bỉ.',
        'Gaming bền bỉ, tản nhiệt Alienware',
        310, 1, 1, 'Intel Core i7 11800H', '16GB DDR4', '512GB SSD', '15.6 inch FHD 120Hz', 'RTX 3050Ti', '56Wh', 2.8, NOW());

-- SP 46: Asus ROG Zephyrus G14 (Gaming mỏng nhẹ)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (46, 'Asus ROG Zephyrus G14', 'asus-rog-zephyrus-g14', 40000000, 38500000, 10, 24,
        'Laptop gaming 14 inch mạnh nhất thế giới. Mặt lưng AniMe Matrix độc đáo.',
        'Gaming nhỏ gọn, hiệu năng khủng',
        550, 1, 2, 'Ryzen 9 6900HS', '16GB DDR5', '1TB SSD', '14 inch WQXGA 120Hz', 'RX 6700S 8GB', '76Wh', 1.72, NOW());

-- SP 47: MacBook Pro 16 M3 Max (Đồ họa chuyên nghiệp)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (47, 'MacBook Pro 16 M3 Max', 'macbook-pro-16-m3-max', 90000000, 88000000, 5, 12,
        'Đỉnh cao công nghệ với chip M3 Max. Xử lý video 8K, render 3D nặng chỉ là chuyện nhỏ.',
        'Quái vật hiệu năng cho Studio',
        1000, 3, 3, 'Apple M3 Max', '36GB Unified', '1TB SSD', '16.2 inch Liquid XDR', '30-Core GPU', '100Wh', 2.15, NOW());

-- SP 48: HP ProBook 450 (Doanh nghiệp)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (48, 'HP ProBook 450 G9', 'hp-probook-450', 20000000, 18500000, 30, 12,
        'Dòng laptop bền bỉ dành cho doanh nghiệp. Bảo mật cao, đầy đủ cổng kết nối.',
        'Laptop chuẩn doanh nghiệp, bền bỉ',
        160, 2, 4, 'Intel Core i5 1235U', '8GB DDR4', '512GB SSD', '15.6 inch FHD IPS', 'Intel Iris Xe', '51Wh', 1.74, NOW());

-- SP 49: Lenovo ThinkBook 14 (Văn phòng)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (49, 'Lenovo ThinkBook 14 G4', 'lenovo-thinkbook-14', 16000000, 14900000, 40, 12,
        'Thiết kế vỏ nhôm 2 tông màu độc đáo. Hiệu năng ổn định cho công việc.',
        'Văn phòng thời trang, vỏ kim loại',
        190, 2, 5, 'Ryzen 5 5625U', '8GB DDR4', '512GB SSD', '14 inch FHD IPS', 'AMD Radeon Graphics', '45Wh', 1.4, NOW());

-- SP 50: Acer Swift 5 (Văn phòng cao cấp)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (50, 'Acer Swift 5 Aerospace', 'acer-swift-5', 29000000, 27500000, 10, 12,
        'Vỏ nhôm hàng không siêu bền, siêu nhẹ. Màn hình cảm ứng kháng khuẩn.',
        'Siêu mỏng nhẹ, vỏ nhôm hàng không',
        130, 2, 6, 'Intel Core i7 1260P', '16GB LPDDR5', '1TB SSD', '14 inch WQXGA Touch', 'Intel Iris Xe', '56Wh', 1.2, NOW());

-- SP 51: MSI Creator Z16 (Đồ họa)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (51, 'MSI Creator Z16', 'msi-creator-z16', 55000000, 52000000, 5, 24,
        'Thiết kế CNC tinh xảo. Màn hình chuẩn màu True Pixel phục vụ thiết kế chuyên nghiệp.',
        'Laptop dành cho nhà sáng tạo nội dung',
        220, 3, 7, 'Intel Core i7 11800H', '32GB DDR4', '1TB SSD', '16 inch QHD+ 120Hz Touch', 'RTX 3060 6GB', '90Wh', 2.2, NOW());

-- SP 52: Dell Latitude 7420 (Doanh nhân)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (52, 'Dell Latitude 7420 Carbon', 'dell-latitude-7420', 28000000, 26500000, 15, 36,
        'Dòng máy doanh nhân cao cấp, vỏ sợi carbon siêu nhẹ. Bảo mật khuôn mặt, vân tay.',
        'Doanh nhân siêu bền, vỏ carbon',
        110, 2, 1, 'Intel Core i7 1185G7', '16GB LPDDR4x', '512GB SSD', '14 inch FHD IPS', 'Intel Iris Xe', '63Wh', 1.22, NOW());

-- SP 53: Asus ExpertBook B9 (Văn phòng siêu nhẹ)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (53, 'Asus ExpertBook B9', 'asus-expertbook-b9', 35000000, 33000000, 8, 24,
        'Laptop 14 inch nhẹ nhất thế giới (chỉ 880g). Pin khủng lên đến 24h.',
        'Laptop doanh nhân nhẹ nhất thế giới',
        240, 2, 2, 'Intel Core i7 1255U', '16GB LPDDR5', '1TB SSD', '14 inch FHD IPS', 'Intel Iris Xe', '66Wh', 0.88, NOW());

-- SP 54: Lenovo Yoga 9i (2-in-1)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (54, 'Lenovo Yoga 9i Gen 7', 'lenovo-yoga-9i', 42000000, 39900000, 7, 24,
        'Xoay gập 360 độ với loa thanh xoay theo màn hình. Thiết kế bo tròn mềm mại cực sang.',
        'Laptop 2-in-1 âm thanh đỉnh cao',
        180, 2, 5, 'Intel Core i7 1260P', '16GB LPDDR5', '1TB SSD', '14 inch 4K OLED Touch', 'Intel Iris Xe', '75Wh', 1.4, NOW());

INSERT INTO categories (id, name, slug, description)
VALUES (3, 'Laptop Cao Cấp', 'laptop-high-end', 'Thiết kế sang trọng, màn hình đẹp, tính năng độc đáo');

-- ==========================================
-- 6. INSERT PRODUCT IMAGES (Ảnh giả lập)
-- ==========================================
-- Tự động thêm ảnh thumbnail cho các SP từ 25-54 (Dùng ảnh placeholder hoặc link mẫu)
INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES
                                                                     (25, 'https://cdn.tgdd.vn/Products/Images/44/287873/dell-inspiron-15-3520-i5-n5i5121w1-1.jpg', 1),
                                                                     (26, 'https://cdn.tgdd.vn/Products/Images/44/269437/asus-tuf-gaming-fx506lhb-i5-hn188w-1.jpg', 1),
                                                                     (27, 'https://cdn.tgdd.vn/Products/Images/44/253583/macbook-pro-16-inch-m1-pro-16gb-512gb-2021-1.jpg', 1),
                                                                     (28, 'https://cdn.tgdd.vn/Products/Images/44/282538/hp-victus-16-e1106ax-r7-7c0t1pa-1.jpg', 1),
                                                                     (29, 'https://bizweb.dktcdn.net/100/329/234/products/thinkpad-x1-carbon-gen-10-01.jpg', 1),
                                                                     (30, 'https://cdn.tgdd.vn/Products/Images/44/285933/acer-swift-3-sf314-512-56qn-i5-nxk0fsv002-1.jpg', 1),
                                                                     (31, 'https://bizweb.dktcdn.net/100/329/234/products/msi-raider-ge78-hx-13v-01.jpg', 1),
                                                                     (32, 'https://cdn.tgdd.vn/Products/Images/44/264358/dell-vostro-3510-i5-p112f002b-1.jpg', 1),
                                                                     (33, 'https://cdn.tgdd.vn/Products/Images/44/231244/macbook-air-m1-2020-gold-1-org.jpg', 1),
                                                                     (34, 'https://cdn.tgdd.vn/Products/Images/44/269555/asus-zenbook-duo-ux482ear-i5-ka274w-1.jpg', 1),
                                                                     (35, 'https://cdn.tgdd.vn/Products/Images/44/282537/hp-omen-16-n0087ax-r7-7c0t7pa-1.jpg', 1),
                                                                     (36, 'https://cdn.tgdd.vn/Products/Images/44/282381/lenovo-yoga-slim-7-pro-14iah7-i7-82uu000qvn-1.jpg', 1),
                                                                     (37, 'https://cdn.tgdd.vn/Products/Images/44/282872/acer-predator-helios-300-ph315-55-76kg-i7-nhqgnsv003-1.jpg', 1),
                                                                     (38, 'https://cdn.tgdd.vn/Products/Images/44/278250/dell-alienware-x14-r1-i7-70282324-1.jpg', 1),
                                                                     (39, 'https://cdn.tgdd.vn/Products/Images/44/303499/msi-modern-14-c11m-i3-011vn-1.jpg', 1),
                                                                     (40, 'https://cdn.tgdd.vn/Products/Images/44/282828/macbook-pro-m2-2022-1.jpg', 1),
                                                                     (41, 'https://cdn.tgdd.vn/Products/Images/44/269624/asus-vivobook-pro-15-oled-m6500qc-r7-ma002w-1.jpg', 1),
                                                                     (42, 'https://cdn.tgdd.vn/Products/Images/44/236866/hp-envy-13-ba1536tu-i5-4q6m7pa-1-org.jpg', 1),
                                                                     (43, 'https://cdn.tgdd.vn/Products/Images/44/270056/lenovo-ideapad-gaming-3-15ach6-r5-82k201bbvn-1.jpg', 1),
                                                                     (44, 'https://cdn.tgdd.vn/Products/Images/44/282873/acer-aspire-7-gaming-a715-42g-r05g-r5-nhqaysv007-1.jpg', 1),
                                                                     (45, 'https://cdn.tgdd.vn/Products/Images/44/271713/dell-gaming-g15-5511-i5-70266676-1.jpg', 1),
                                                                     (46, 'https://cdn.tgdd.vn/Products/Images/44/273561/asus-rog-zephyrus-g14-ga402rj-r7-l8046w-1.jpg', 1),
                                                                     (47, 'https://cdn.tgdd.vn/Products/Images/44/318231/macbook-pro-16-inch-m3-max-36gb-1tb-1.jpg', 1),
                                                                     (48, 'https://cdn.tgdd.vn/Products/Images/44/282536/hp-probook-450-g9-i5-6m0y9pa-1.jpg', 1),
                                                                     (49, 'https://cdn.tgdd.vn/Products/Images/44/282380/lenovo-thinkbook-14-g4-iap-i7-21dh00b3vn-1.jpg', 1),
                                                                     (50, 'https://cdn.tgdd.vn/Products/Images/44/289710/acer-swift-5-sf514-56t-74pw-i7-nxk0jsv001-1.jpg', 1),
                                                                     (51, 'https://cdn.tgdd.vn/Products/Images/44/268987/msi-creator-z16-a11uet-i7-217vn-1.jpg', 1),
                                                                     (52, 'https://laptopvang.com/wp-content/uploads/2021/04/Dell-Latitude-7420-1.jpg', 1),
                                                                     (53, 'https://cdn.tgdd.vn/Products/Images/44/288387/asus-expertbook-b9400cba-i7-kc0156x-1.jpg', 1),
                                                                     (54, 'https://cdn.tgdd.vn/Products/Images/44/282379/lenovo-yoga-9-14iap7-i7-82lu006dvn-1.jpg', 1);

USE `defaultdb`;

-- SP 55: Dell Latitude 9430 (Doanh nhân cao cấp)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (55, 'Dell Latitude 9430 2-in-1', 'dell-latitude-9430', 42000000, 39900000, 10, 36,
        'Dòng máy doanh nhân siêu cao cấp, thiết kế xoay gập 360 độ. Bảo mật thông minh tự động khóa khi rời đi.',
        'Laptop doanh nhân 2-in-1 đỉnh cao',
        300, 2, 1, 'Intel Core i7 1265U', '16GB LPDDR5', '512GB SSD', '14 inch QHD+ Touch', 'Intel Iris Xe', '60Wh', 1.4, NOW());

-- SP 56: Asus ROG Flow X13 (Gaming 2-in-1)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (56, 'Asus ROG Flow X13 GV301', 'asus-rog-flow-x13', 38000000, 36500000, 15, 24,
        'Laptop gaming 13 inch xoay gập mạnh nhất thế giới. Hỗ trợ eGPU XG Mobile để tăng sức mạnh đồ họa.',
        'Gaming 13 inch xoay gập độc đáo',
        450, 1, 2, 'Ryzen 9 6900HS', '16GB LPDDR5', '1TB SSD', '13.4 inch WUXGA 120Hz Touch', 'RTX 3050Ti', '62Wh', 1.3, NOW());

-- SP 57: MacBook Air M3 (Văn phòng/Sang trọng)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (57, 'MacBook Air 13 M3 2024', 'macbook-air-m3', 28000000, 27490000, 50, 12,
        'Chip M3 thế hệ mới mang lại hiệu năng vượt trội. Thiết kế mỏng nhẹ trứ danh, hỗ trợ xuất 2 màn hình ngoài.',
        'Siêu phẩm Air thế hệ mới nhất',
        1200, 4, 3, 'Apple M3', '8GB Unified', '256GB SSD', '13.6 inch Liquid Retina', '8-Core GPU', '18h sử dụng', 1.24, NOW());

-- SP 58: HP EliteBook 840 (Doanh nghiệp)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (58, 'HP EliteBook 840 G9', 'hp-elitebook-840', 25000000, 23500000, 25, 36,
        'Laptop chuẩn doanh nghiệp với tính năng bảo mật HP Wolf Security. Camera 5MP sắc nét cho họp trực tuyến.',
        'Chuẩn mực laptop doanh nghiệp',
        180, 2, 4, 'Intel Core i5 1240P', '16GB DDR5', '512GB SSD', '14 inch WUXGA IPS', 'Intel Iris Xe', '51Wh', 1.36, NOW());

-- SP 59: Lenovo ThinkPad Z13 (Doanh nhân hiện đại)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (59, 'Lenovo ThinkPad Z13 Gen 1', 'thinkpad-z13', 35000000, 32000000, 8, 24,
        'Thiết kế đột phá với vật liệu tái chế và da vegan. TrackPoint mới, trải nghiệm gõ phím tuyệt vời.',
        'ThinkPad thế hệ mới, thiết kế thời thượng',
        220, 3, 5, 'Ryzen 7 PRO 6850U', '16GB LPDDR5', '512GB SSD', '13.3 inch 2.8K OLED Touch', 'Radeon 680M', '51.5Wh', 1.26, NOW());

-- SP 60: Acer Swift X (Đồ họa mỏng nhẹ)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (60, 'Acer Swift X SFX14', 'acer-swift-x', 24000000, 22500000, 20, 12,
        'Sức mạnh của card rời RTX trong thân hình ultrabook mỏng nhẹ. Lý tưởng cho content creator hay di chuyển.',
        'Ultrabook mỏng nhẹ có card RTX',
        310, 6, 14, 'Ryzen 5 5600U', '16GB LPDDR4x', '512GB SSD', '14 inch FHD IPS 100% sRGB', 'RTX 3050 4GB', '59Wh', 1.39, NOW());

-- SP 61: MSI Stealth 16 Studio (Gaming/Studio)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (61, 'MSI Stealth 16 Studio A13V', 'msi-stealth-16', 55000000, 52990000, 5, 24,
        'Kết hợp hoàn hảo giữa Gaming và Studio. Thiết kế mỏng nhẹ, vỏ hợp kim Magie-Nhôm cao cấp.',
        'Laptop Gaming lai Studio mỏng nhẹ',
        400, 1, 7, 'Intel Core i7 13700H', '32GB DDR5', '2TB SSD', '16 inch QHD+ 240Hz', 'RTX 4070 8GB', '99.9Wh', 1.99, NOW());

-- SP 62: Dell Inspiron 14 2-in-1 (Văn phòng)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (62, 'Dell Inspiron 14 7420 2-in-1', 'dell-inspiron-14-2in1', 19500000, 17900000, 30, 12,
        'Linh hoạt chuyển đổi giữa chế độ laptop và máy tính bảng. Màn hình cảm ứng mượt mà.',
        'Laptop văn phòng xoay gập tiện lợi',
        250, 2, 1, 'Intel Core i5 1235U', '8GB DDR4', '512GB SSD', '14 inch FHD+ Touch', 'Intel Iris Xe', '54Wh', 1.57, NOW());

-- SP 63: Asus Zenbook Pro 14 Duo (Sáng tạo)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (63, 'Asus Zenbook Pro 14 Duo OLED', 'asus-zenbook-pro-14-duo', 59000000, 56000000, 4, 24,
        'Màn hình kép ScreenPad Plus thế hệ mới nghiêng 12 độ. Sức mạnh tối thượng cho nhà sáng tạo.',
        'Đỉnh cao 2 màn hình cho Creator',
        650, 6, 2, 'Intel Core i9 12900H', '32GB LPDDR5', '1TB SSD', '14.5 inch 2.8K OLED 120Hz', 'RTX 3050Ti', '76Wh', 1.7, NOW());

-- SP 64: HP ZBook Firefly (Workstation mỏng nhẹ)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (64, 'HP ZBook Firefly 14 G9', 'hp-zbook-firefly', 32000000, 29500000, 10, 36,
        'Máy trạm di động nhỏ gọn nhất của HP. Đạt chứng nhận ISV cho các phần mềm đồ họa chuyên dụng.',
        'Mobile Workstation mỏng nhẹ chuyên nghiệp',
        150, 6, 4, 'Intel Core i7 1260P', '16GB DDR5', '512GB SSD', '14 inch WUXGA DreamColor', 'NVIDIA T550 4GB', '51Wh', 1.47, NOW());

-- SP 65: Lenovo Legion Slim 7 (Gaming mỏng nhẹ)
INSERT INTO products (id, name, slug, price, sale_price, stock_quantity, warranty_period, description, short_description, view_count, category_id, brand_id, cpu, ram, storage, screen, gpu, battery, weight, created_at)
VALUES (65, 'Lenovo Legion Slim 7 Gen 7', 'lenovo-legion-slim-7', 41000000, 38900000, 8, 24,
        'Laptop gaming 16 inch mỏng nhẹ ấn tượng. Vỏ kim loại CNC toàn bộ, tản nhiệt cực tốt.',
        'Gaming mỏng nhẹ vỏ kim loại cao cấp',
        380, 1, 5, 'Ryzen 7 6800H', '16GB DDR5', '1TB SSD', '16 inch WQXGA 165Hz', 'RX 6800S 8GB', '99.9Wh', 2.05, NOW());

-- ==========================================
-- 2. THÊM ẢNH CHO SẢN PHẨM MỚI
-- ==========================================

-- Dell Latitude 9430
INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES
                                                                     (55, 'https://laptopvang.com/wp-content/uploads/2022/06/Dell-Latitude-9430-1.jpg', 1),
                                                                     (55, 'https://laptopvang.com/wp-content/uploads/2022/06/Dell-Latitude-9430-2.jpg', 0);

-- Asus ROG Flow X13
INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES
                                                                     (56, 'https://cdn.tgdd.vn/Products/Images/44/274193/asus-rog-flow-13-gv301re-r7-lj052w-1.jpg', 1),
                                                                     (56, 'https://cdn.tgdd.vn/Products/Images/44/274193/asus-rog-flow-13-gv301re-r7-lj052w-2.jpg', 0);

-- MacBook Air M3
INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES
                                                                     (57, 'https://cdn.tgdd.vn/Products/Images/44/322605/macbook-air-13-inch-m3-2024-1.jpg', 1),
                                                                     (57, 'https://cdn.tgdd.vn/Products/Images/44/322605/macbook-air-13-inch-m3-2024-2.jpg', 0);

-- HP EliteBook 840
INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES
                                                                     (58, 'https://cdn.tgdd.vn/Products/Images/44/288469/hp-elitebook-840-g9-i5-6z966pa-1.jpg', 1),
                                                                     (58, 'https://cdn.tgdd.vn/Products/Images/44/288469/hp-elitebook-840-g9-i5-6z966pa-2.jpg', 0);

-- Lenovo ThinkPad Z13
INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES
                                                                     (59, 'https://laptopvang.com/wp-content/uploads/2022/06/ThinkPad-Z13-1.jpg', 1),
                                                                     (59, 'https://laptopvang.com/wp-content/uploads/2022/06/ThinkPad-Z13-3.jpg', 0);

-- Acer Swift X
INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES
                                                                     (60, 'https://cdn.tgdd.vn/Products/Images/44/269554/acer-swift-x-sfx16-51g-516q-i5-nxayksv002-1.jpg', 1),
                                                                     (60, 'https://cdn.tgdd.vn/Products/Images/44/269554/acer-swift-x-sfx16-51g-516q-i5-nxayksv002-2.jpg', 0);

-- MSI Stealth 16
INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES
                                                                     (61, 'https://bizweb.dktcdn.net/100/329/234/products/msi-stealth-16-studio-a13v-01.jpg', 1),
                                                                     (61, 'https://bizweb.dktcdn.net/100/329/234/products/msi-stealth-16-studio-a13v-02.jpg', 0);

-- Dell Inspiron 14 2-in-1
INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES
                                                                     (62, 'https://cdn.tgdd.vn/Products/Images/44/288393/dell-inspiron-14-7420-2in1-i5-1a35d81-1.jpg', 1),
                                                                     (62, 'https://cdn.tgdd.vn/Products/Images/44/288393/dell-inspiron-14-7420-2in1-i5-1a35d81-2.jpg', 0);

-- Asus Zenbook Pro 14 Duo
INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES
                                                                     (63, 'https://cdn.tgdd.vn/Products/Images/44/288388/asus-zenbook-pro-14-duo-oled-ux8402ze-i5-m3504w-1.jpg', 1),
                                                                     (63, 'https://cdn.tgdd.vn/Products/Images/44/288388/asus-zenbook-pro-14-duo-oled-ux8402ze-i5-m3504w-2.jpg', 0);

-- HP ZBook Firefly
INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES
                                                                     (64, 'https://laptopvang.com/wp-content/uploads/2022/08/HP-ZBook-Firefly-14-G9-1.jpg', 1),
                                                                     (64, 'https://laptopvang.com/wp-content/uploads/2022/08/HP-ZBook-Firefly-14-G9-2.jpg', 0);

-- Lenovo Legion Slim 7
INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES
                                                                     (65, 'https://laptopvang.com/wp-content/uploads/2022/09/Legion-Slim-7-Gen-7-AMD-1.jpg', 1),
                                                                     (65, 'https://laptopvang.com/wp-content/uploads/2022/09/Legion-Slim-7-Gen-7-AMD-2.jpg', 0);

-- ==========================================
-- 7. INSERT VOUCHERS (Khuyến mãi)
-- ==========================================
INSERT INTO vouchers (code, discount_type, discount_value, min_order_value, max_usage, usage_count, start_date, end_date, status) VALUES
                                                                                                                                      ('WELCOME', 'FIXED', 50000, 0, 1000, 0, NOW(), '2025-12-31', 1),
                                                                                                                                      ('SALE10', 'PERCENT', 10, 5000000, 100, 5, NOW(), '2025-12-31', 1),
                                                                                                                                      ('TET2025', 'FIXED', 500000, 15000000, 50, 0, NOW(), '2025-12-31', 1);
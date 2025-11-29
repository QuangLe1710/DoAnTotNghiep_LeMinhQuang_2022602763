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
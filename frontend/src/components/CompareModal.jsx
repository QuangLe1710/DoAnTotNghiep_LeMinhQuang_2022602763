import React from 'react';
import { Modal, Table, Button, Image, Typography, Empty, Tag } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';

const { Text } = Typography;

const CompareModal = () => {
    const { compareList, removeFromCompare, isModalOpen, closeCompareModal } = useCompare();
    const { addToCart } = useCart();

    // Định nghĩa cột động dựa trên số lượng sản phẩm đang so sánh
    const columns = [
        { 
            title: 'Tiêu chí', 
            dataIndex: 'criteria', 
            key: 'criteria', 
            width: 150, 
            render: (text) => <Text strong>{text}</Text>,
            fixed: 'left', // Cố định cột tiêu chí
        },
        ...compareList.map((product, index) => ({
            title: (
                <div style={{ textAlign: 'center', position: 'relative' }}>
                    <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        style={{ position: 'absolute', top: -10, right: -10, zIndex: 10 }}
                        onClick={() => removeFromCompare(product.id)}
                    />
                    <div style={{ marginBottom: 10 }}>
                        {/* 1. Fix ảnh: Dùng thumbnail hoặc ảnh đầu tiên */}
                        <Image 
                            src={product.thumbnail || (product.images && product.images[0]) || 'https://via.placeholder.com/150'} 
                            height={100} 
                            style={{ objectFit: 'contain' }} 
                        />
                    </div>
                    <div style={{ height: 40, overflow: 'hidden', marginBottom: 5, fontWeight: 600 }}>
                        {product.name}
                    </div>
                    <div style={{ color: '#cf1322', fontWeight: 'bold', fontSize: 16 }}>
                        {product.salePrice > 0 ? product.salePrice.toLocaleString() : product.price?.toLocaleString()} đ
                    </div>
                    <Button 
                        type="primary" 
                        size="small" 
                        icon={<ShoppingCartOutlined />} 
                        style={{ marginTop: 10 }}
                        onClick={() => addToCart(product)}
                    >
                        Thêm vào giỏ
                    </Button>
                </div>
            ),
            dataIndex: `product_${index}`,
            key: `product_${index}`,
            align: 'center',
            width: 250
        }))
    ];

    // Helper: Lấy giá trị của từng sản phẩm cho 1 dòng tiêu chí
    function getRowData(field, label) {
        const row = { key: field, criteria: label };
        compareList.forEach((p, index) => {
            // Xử lý hiển thị đặc biệt nếu cần
            let value = p[field];
            if (field === 'weight' && value) value = `${value} kg`;
            if (field === 'brandName') value = <Tag color="blue">{value}</Tag>;
            
            row[`product_${index}`] = value || <Text type="secondary">---</Text>;
        });
        return row;
    }

    // 2. Cập nhật các trường dữ liệu mới (GPU, Pin, Weight, BrandName)
    const data = [
        getRowData('brandName', 'Thương hiệu'), // Sửa brand -> brandName
        getRowData('cpu', 'Vi xử lý (CPU)'),
        getRowData('ram', 'RAM'),
        getRowData('storage', 'Ổ cứng'),
        getRowData('screen', 'Màn hình'),
        getRowData('gpu', 'Card đồ họa'), // Mới
        getRowData('battery', 'Pin'),     // Mới
        getRowData('weight', 'Trọng lượng'), // Mới
        getRowData('warrantyPeriod', 'Bảo hành (tháng)'), // Mới
    ];

    return (
        <Modal
            title="So sánh sản phẩm"
            open={isModalOpen}
            onCancel={closeCompareModal}
            footer={null}
            width={900} // Mở rộng chiều ngang
            style={{ top: 20 }}
        >
            {compareList.length === 0 ? (
                <Empty description="Chưa chọn sản phẩm nào để so sánh" />
            ) : (
                <Table 
                    columns={columns} 
                    dataSource={data} 
                    pagination={false} 
                    bordered 
                    size="middle"
                    scroll={{ x: 'max-content' }} // Cho phép cuộn ngang nếu nhiều cột
                />
            )}
        </Modal>
    );
};

export default CompareModal;
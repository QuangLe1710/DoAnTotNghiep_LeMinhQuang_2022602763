import React from 'react';
import { Modal, Table, Button, Image, Typography, Empty } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';

const { Text } = Typography;

const CompareModal = () => {
    const { compareList, removeFromCompare, isModalOpen, closeCompareModal } = useCompare();
    const { addToCart } = useCart();

    // Định nghĩa cấu trúc cột cho bảng so sánh
    // Cột 1: Tiêu chí, Cột 2: SP 1, Cột 3: SP 2
    const columns = [
        { title: 'Tiêu chí', dataIndex: 'criteria', key: 'criteria', width: 150, render: (text) => <Text strong>{text}</Text> },
        ...compareList.map((product, index) => ({
            title: (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Image src={product.image} height={80} style={{ objectFit: 'contain' }} />
                        <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            style={{ position: 'absolute', top: 0, right: 0 }}
                            onClick={() => removeFromCompare(product.id)}
                        />
                    </div>
                    <div style={{ height: 40, overflow: 'hidden', marginTop: 5 }}>{product.name}</div>
                    <div style={{ color: '#cf1322', fontWeight: 'bold' }}>{product.price?.toLocaleString()} đ</div>
                    <Button 
                        type="primary" 
                        size="small" 
                        icon={<ShoppingCartOutlined />} 
                        style={{ marginTop: 5 }}
                        onClick={() => addToCart(product)}
                    >
                        Mua
                    </Button>
                </div>
            ),
            dataIndex: `product_${index}`,
            key: `product_${index}`,
            align: 'center',
            width: 250
        }))
    ];

    // Dữ liệu so sánh (Mapping data từ product entity)
    const data = [
        { key: 'brand', criteria: 'Thương hiệu', ...getProductValue('brand') },
        { key: 'cpu', criteria: 'Vi xử lý (CPU)', ...getProductValue('cpu') },
        { key: 'ram', criteria: 'RAM', ...getProductValue('ram') },
        { key: 'storage', criteria: 'Ổ cứng', ...getProductValue('storage') },
        { key: 'screen', criteria: 'Màn hình', ...getProductValue('screen') },
        { key: 'desc', criteria: 'Mô tả', ...getProductValue('description') },
    ];

    function getProductValue(field) {
        const result = {};
        compareList.forEach((p, index) => {
            result[`product_${index}`] = p[field];
        });
        return result;
    }

    return (
        <Modal
            title="So sánh sản phẩm"
            open={isModalOpen}
            onCancel={closeCompareModal}
            footer={null}
            width={800}
        >
            {compareList.length === 0 ? (
                <Empty description="Chưa có sản phẩm nào để so sánh" />
            ) : (
                <Table 
                    columns={columns} 
                    dataSource={data} 
                    pagination={false} 
                    bordered 
                    size="middle"
                />
            )}
        </Modal>
    );
};

export default CompareModal;
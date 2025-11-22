import React, { useEffect, useState } from 'react';
import { Table, Tag, Select, message, Typography } from 'antd'; // Bỏ bớt import thừa
import api from '../services/api';

const { Title } = Typography;
const { Option } = Select;

const AdminOrder = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Lấy danh sách đơn hàng
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) {
            message.error("Lỗi tải đơn hàng!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // 2. Hàm cập nhật trạng thái
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            message.success("Cập nhật trạng thái thành công!");
            fetchOrders(); // Load lại dữ liệu
        } catch (error) {
            message.error("Lỗi cập nhật!");
        }
    };

    // Cấu hình cột cho bảng
    const columns = [
        { title: 'Mã ĐH', dataIndex: 'id', width: 80 },
        { title: 'Khách hàng', dataIndex: 'customerName' },
        { title: 'SĐT', dataIndex: 'phone' },
        { 
            title: 'Tổng tiền', 
            dataIndex: 'totalAmount', 
            render: (val) => <span style={{color: '#cf1322', fontWeight: 'bold'}}>{val?.toLocaleString()} đ</span> 
        },
        { title: 'Ngày đặt', dataIndex: 'createdAt', render: (date) => new Date(date).toLocaleString() },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (status, record) => (
                <Select 
                    defaultValue={status} 
                    style={{ width: 140 }} 
                    onChange={(value) => handleStatusChange(record.id, value)}
                >
                    <Option value="PENDING">Chờ duyệt</Option>
                    <Option value="SHIPPING">Đang giao</Option>
                    <Option value="COMPLETED">Hoàn thành</Option>
                    <Option value="CANCELLED">Đã hủy</Option>
                </Select>
            )
        },
    ];

    // Bảng phụ: Hiển thị chi tiết sản phẩm khi bấm mở rộng dòng
    const expandedRowRender = (record) => {
        const detailColumns = [
            { title: 'Sản phẩm (ID)', dataIndex: 'productId' },
            { title: 'Giá mua', dataIndex: 'price', render: val => val?.toLocaleString() },
            { title: 'Số lượng', dataIndex: 'quantity' },
            { title: 'Thành tiền', render: (_, r) => (r.price * r.quantity).toLocaleString() }
        ];

        return (
            <div style={{ padding: '10px', background: '#fafafa', borderRadius: '8px' }}>
                {/* --- HIỂN THỊ LÝ DO HỦY (Nếu có) --- */}
                {record.status === 'CANCELLED' && record.cancelReason && (
                    <div style={{ marginBottom: 15, padding: '10px', border: '1px dashed #ff4d4f', backgroundColor: '#fff1f0', borderRadius: '4px' }}>
                        <strong style={{ color: '#cf1322' }}>LÝ DO HỦY ĐƠN: </strong> 
                        <span>{record.cancelReason}</span>
                    </div>
                )}

                <Table 
                    columns={detailColumns} 
                    dataSource={record.orderDetails} 
                    pagination={false} 
                    size="small" 
                    bordered 
                />
            </div>
        );
    };

    // --- ĐÂY LÀ PHẦN BẠN BỊ THIẾU ---
    return (
        <div>
            <Title level={2}>Quản lý Đơn hàng</Title>
            <Table 
                columns={columns} 
                dataSource={orders} 
                rowKey="id" 
                loading={loading}
                expandable={{ expandedRowRender }} // Kích hoạt tính năng mở rộng
            />
        </div>
    );
};

export default AdminOrder;
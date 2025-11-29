import React, { useEffect, useState } from 'react';
import { Table, Tag, Select, message, Typography, Button, Modal, Card, Space, Divider, Row, Col, Avatar } from 'antd';
import { EyeOutlined, UserOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminOrder = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Phân trang Server-side
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // State Modal Chi tiết
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // 1. Load danh sách đơn hàng
    const fetchOrders = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await api.get(`/orders?page=${page - 1}&limit=${pageSize}`);
            setOrders(response.data.content); // Spring Boot Page trả về 'content'
            setPagination({
                current: page,
                pageSize: pageSize,
                total: response.data.totalElements,
            });
        } catch (error) {
            message.error("Lỗi tải danh sách đơn hàng!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleTableChange = (newPagination) => {
        fetchOrders(newPagination.current, newPagination.pageSize);
    };

    // 2. Cập nhật trạng thái đơn
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            message.success("Cập nhật trạng thái thành công!");
            fetchOrders(pagination.current, pagination.pageSize); // Reload lại trang hiện tại
        } catch (error) {
            message.error("Lỗi cập nhật: " + (error.response?.data || "Hệ thống bận"));
        }
    };

    // 3. Xem chi tiết đơn
    const handleViewDetail = (record) => {
        setSelectedOrder(record);
        setIsModalOpen(true);
    };

    // Helper: Màu sắc trạng thái
    const getStatusTag = (status) => {
        switch (status) {
            case 'PENDING': return <Tag color="orange">Chờ duyệt</Tag>;
            case 'CONFIRMED': return <Tag color="cyan">Đã xác nhận</Tag>;
            case 'SHIPPING': return <Tag color="blue">Đang giao</Tag>;
            case 'COMPLETED': return <Tag color="green">Hoàn thành</Tag>;
            case 'CANCELLED': return <Tag color="red">Đã hủy</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
        { 
            title: 'Khách hàng', 
            dataIndex: 'shippingName', // Lấy tên người nhận thay vì user đăng ký
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{text}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{record.user?.username}</div>
                </div>
            )
        },
        { 
            title: 'Tổng tiền', 
            dataIndex: 'totalAmount', 
            render: (val) => <span style={{ color: '#cf1322', fontWeight: 'bold' }}>{val?.toLocaleString()} đ</span> 
        },
        { title: 'Ngày đặt', dataIndex: 'orderDate', render: (date) => new Date(date).toLocaleString('vi-VN') },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (status, record) => (
                <Select
                    defaultValue={status}
                    style={{ width: 140 }}
                    onChange={(val) => handleStatusChange(record.id, val)}
                    // Nếu đơn đã hủy hoặc hoàn thành thì không cho sửa nữa (Optional)
                    disabled={status === 'CANCELLED' || status === 'COMPLETED'}
                >
                    <Option value="PENDING">Chờ duyệt</Option>
                    <Option value="CONFIRMED">Đã xác nhận</Option>
                    <Option value="SHIPPING">Đang giao</Option>
                    <Option value="COMPLETED">Hoàn thành</Option>
                    <Option value="CANCELLED">Hủy đơn</Option>
                </Select>
            )
        },
        {
            title: 'Thao tác',
            align: 'center',
            render: (_, record) => (
                <Button type="primary" ghost icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
                    Chi tiết
                </Button>
            )
        }
    ];

    // Cột cho bảng chi tiết sản phẩm trong Modal
    const detailColumns = [
        { 
            title: 'Sản phẩm', 
            dataIndex: 'product',
            render: (product) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img 
                        src={product?.images?.[0]?.imageUrl || 'https://via.placeholder.com/50'} 
                        alt="img" 
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, marginRight: 10 }} 
                    />
                    <span>{product?.name}</span>
                </div>
            )
        },
        { title: 'Đơn giá', dataIndex: 'price', render: p => `${p?.toLocaleString()} đ` },
        { title: 'SL', dataIndex: 'quantity', align: 'center' },
        { title: 'Thành tiền', dataIndex: 'totalPrice', render: p => <b style={{color:'#cf1322'}}>{p?.toLocaleString()} đ</b> }
    ];

    return (
        <div>
            <Title level={2} style={{ marginBottom: 20 }}>Quản lý Đơn hàng</Title>
            
            <Table 
                columns={columns} 
                dataSource={orders} 
                rowKey="id" 
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showTotal: (total) => `Tổng ${total} đơn hàng`,
                }}
                onChange={handleTableChange}
                bordered
            />

            {/* --- MODAL CHI TIẾT ĐƠN HÀNG --- */}
            <Modal
                title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalOpen(false)}>Đóng</Button>
                ]}
                width={800}
            >
                {selectedOrder && (
                    <div>
                        {/* Thông tin người nhận */}
                        <Card size="small" style={{ marginBottom: 20, background: '#f9f9f9' }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <p><UserOutlined /> <b>Người nhận:</b> {selectedOrder.shippingName}</p>
                                    <p><PhoneOutlined /> <b>SĐT:</b> {selectedOrder.shippingPhone}</p>
                                </Col>
                                <Col span={12}>
                                    <p><EnvironmentOutlined /> <b>Địa chỉ:</b> {selectedOrder.shippingAddress}</p>
                                    <p><b>Thanh toán:</b> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
                                </Col>
                            </Row>
                            {selectedOrder.note && (
                                <>
                                    <Divider style={{ margin: '10px 0' }} />
                                    <p><b>Ghi chú:</b> {selectedOrder.note}</p>
                                </>
                            )}
                        </Card>

                        {/* Danh sách sản phẩm */}
                        <Table 
                            columns={detailColumns}
                            dataSource={selectedOrder.orderDetails}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            bordered
                        />

                        <div style={{ marginTop: 20, textAlign: 'right' }}>
                            <Title level={4}>Tổng cộng: <span style={{ color: '#cf1322' }}>{selectedOrder.totalAmount?.toLocaleString()} đ</span></Title>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminOrder;
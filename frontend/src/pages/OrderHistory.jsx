import React, { useEffect, useState } from 'react';
import { Table, Tag, message, Typography, Card, Button, Modal, Input, Select, Divider, Row, Col, Image } from 'antd';
import { StopOutlined, EyeOutlined, CarOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Lý do hủy đơn (Giữ nguyên)
const CANCELLATION_REASONS = [
    "Tôi muốn thay đổi địa chỉ nhận hàng",
    "Tôi muốn thay đổi sản phẩm (màu sắc, cấu hình...)",
    "Tôi tìm thấy nơi khác giá tốt hơn",
    "Tôi không còn nhu cầu nữa",
    "Thời gian giao hàng quá lâu",
    "Khác (Nhập lý do...)"
];

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // State Hủy Đơn
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const [selectedReason, setSelectedReason] = useState(null);
    const [otherReason, setOtherReason] = useState('');

    // State Xem Chi Tiết (Mới)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const username = localStorage.getItem('username');

    // 1. Load dữ liệu
    const fetchMyOrders = async () => {
        if (!username) return;
        setLoading(true);
        try {
            const response = await api.get(`/orders/my-orders/${username}`);
            // Sắp xếp đơn mới nhất lên đầu
            const sortedOrders = response.data.sort((a, b) => b.id - a.id);
            setOrders(sortedOrders);
        } catch (error) {
            message.error("Không thể tải lịch sử đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!username) { navigate('/login'); return; }
        fetchMyOrders();
    }, [navigate]);

    // 2. Logic Xem chi tiết
    const handleViewDetail = (record) => {
        setSelectedOrder(record);
        setIsDetailModalOpen(true);
    };

    // 3. Logic Hủy đơn
    const openCancelModal = (orderId) => {
        setCancellingOrderId(orderId);
        setSelectedReason(null);
        setOtherReason('');
        setIsCancelModalOpen(true);
    };

    const handleSubmitCancel = async () => {
        if (!selectedReason) {
            message.warning("Vui lòng chọn lý do hủy!");
            return;
        }
        let finalReason = selectedReason === "Khác (Nhập lý do...)" ? otherReason : selectedReason;
        
        if (!finalReason.trim()) {
            message.warning("Vui lòng nhập lý do!");
            return;
        }

        try {
            await api.put(`/orders/${cancellingOrderId}/cancel`, { reason: finalReason });
            message.success("Đã gửi yêu cầu hủy đơn!");
            setIsCancelModalOpen(false);
            fetchMyOrders(); // Reload lại bảng
        } catch (error) {
            message.error(error.response?.data || "Lỗi hủy đơn!");
        }
    };

    // Helper: Render trạng thái (Giống Admin)
    const renderStatus = (status) => {
        switch (status) {
            case 'PENDING': return <Tag icon={<ClockCircleOutlined />} color="orange">Chờ duyệt</Tag>;
            case 'CONFIRMED': return <Tag icon={<CheckCircleOutlined />} color="cyan">Đã xác nhận</Tag>;
            case 'SHIPPING': return <Tag icon={<CarOutlined />} color="blue">Đang giao</Tag>;
            case 'COMPLETED': return <Tag icon={<CheckCircleOutlined />} color="green">Hoàn thành</Tag>;
            case 'CANCELLED': return <Tag icon={<CloseCircleOutlined />} color="red">Đã hủy</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    // Cấu hình bảng chính
    const columns = [
        { title: 'Mã ĐH', dataIndex: 'id', width: 70, align: 'center', render: (id) => <b>#{id}</b> },
        { title: 'Ngày đặt', dataIndex: 'orderDate', render: (date) => new Date(date).toLocaleString('vi-VN') },
        { title: 'Tổng tiền', dataIndex: 'totalAmount', render: (val) => <span style={{color:'#cf1322', fontWeight:'bold'}}>{val?.toLocaleString()} đ</span> },
        { title: 'Trạng thái', dataIndex: 'status', render: (status) => renderStatus(status) },
        {
            title: 'Thao tác',
            align: 'right',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
                        Chi tiết
                    </Button>
                    {/* Chỉ hiện nút Hủy khi đơn đang Chờ duyệt */}
                    {record.status === 'PENDING' && (
                        <Button danger size="small" icon={<StopOutlined />} onClick={() => openCancelModal(record.id)}>
                            Hủy
                        </Button>
                    )}
                </div>
            )
        }
    ];

    // Cấu hình bảng chi tiết sản phẩm (Trong Modal)
    const productColumns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'product',
            render: (product) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Image 
                        src={product?.images?.[0]?.imageUrl || 'https://via.placeholder.com/50'} 
                        width={50} height={50} 
                        style={{ borderRadius: 4, objectFit: 'cover' }}
                    />
                    <div style={{ marginLeft: 10 }}>
                        <div style={{ fontWeight: 600 }}>{product?.name}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{product?.brand?.name}</div>
                    </div>
                </div>
            )
        },
        { title: 'Giá mua', dataIndex: 'price', render: p => `${p?.toLocaleString()} đ` },
        { title: 'SL', dataIndex: 'quantity', align: 'center' },
        { title: 'Thành tiền', dataIndex: 'totalPrice', align: 'right', render: p => <b style={{color:'#cf1322'}}>{p?.toLocaleString()} đ</b> }
    ];

    return (
        <div style={{ padding: '20px 50px', minHeight: '80vh' }}>
            <Title level={2} style={{ marginBottom: 20 }}>Lịch sử đơn hàng</Title>
            
            <Table 
                dataSource={orders} 
                columns={columns} 
                rowKey="id" 
                loading={loading} 
                pagination={{ pageSize: 8 }} 
                bordered
            />

            {/* --- MODAL 1: CHI TIẾT ĐƠN HÀNG --- */}
            <Modal
                title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={[<Button key="close" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>]}
                width={800}
            >
                {selectedOrder && (
                    <div>
                        <Card size="small" style={{ background: '#f9f9f9', marginBottom: 20 }}>
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Text type="secondary">Người nhận:</Text>
                                    <div><b>{selectedOrder.shippingName}</b></div>
                                    <div>{selectedOrder.shippingPhone}</div>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary">Địa chỉ giao hàng:</Text>
                                    <div>{selectedOrder.shippingAddress}</div>
                                </Col>
                                <Col span={24}>
                                    <Divider style={{ margin: '10px 0' }} />
                                    <Text type="secondary">Ghi chú: </Text> 
                                    <span>{selectedOrder.note || 'Không có'}</span>
                                </Col>
                            </Row>
                        </Card>

                        <Table 
                            columns={productColumns} 
                            dataSource={selectedOrder.orderDetails} 
                            rowKey="id" 
                            pagination={false} 
                            size="small"
                            bordered
                        />

                        <div style={{ marginTop: 20, textAlign: 'right' }}>
                            <Text>Phương thức thanh toán: <b>{selectedOrder.paymentMethod}</b></Text>
                            <br />
                            <Title level={4} style={{ marginTop: 5 }}>
                                Tổng thanh toán: <span style={{ color: '#cf1322' }}>{selectedOrder.totalAmount?.toLocaleString()} đ</span>
                            </Title>
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- MODAL 2: HỦY ĐƠN HÀNG --- */}
            <Modal
                title="Xác nhận hủy đơn hàng"
                open={isCancelModalOpen}
                onOk={handleSubmitCancel}
                onCancel={() => setIsCancelModalOpen(false)}
                okText="Xác nhận hủy"
                okButtonProps={{ danger: true }}
                cancelText="Quay lại"
            >
                <p>Bạn có chắc chắn muốn hủy đơn hàng <b>#{cancellingOrderId}</b> không?</p>
                <Select
                    style={{ width: '100%', marginBottom: 10 }}
                    placeholder="Chọn lý do hủy..."
                    onChange={setSelectedReason}
                    value={selectedReason}
                >
                    {CANCELLATION_REASONS.map(r => <Option key={r} value={r}>{r}</Option>)}
                </Select>
                {selectedReason === "Khác (Nhập lý do...)" && (
                    <TextArea 
                        rows={3} 
                        placeholder="Nhập lý do cụ thể..." 
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default OrderHistory;
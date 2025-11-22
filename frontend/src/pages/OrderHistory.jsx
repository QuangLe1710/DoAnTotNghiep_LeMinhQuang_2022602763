import React, { useEffect, useState } from 'react';
import { Table, Tag, message, Typography, Card, Button, Modal, Input, Select } from 'antd'; // 1. Import thêm Button, Modal
import { StopOutlined } from '@ant-design/icons'; // Import icon
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select; // <--- Lấy Option từ Select

// 2. DANH SÁCH LÝ DO HỦY PHỔ BIẾN
const CANCELLATION_REASONS = [
    "Tôi muốn thay đổi địa chỉ nhận hàng",
    "Tôi muốn thay đổi sản phẩm trong đơn (màu sắc, kích thước...)",
    "Tôi tìm thấy nơi khác có giá tốt hơn",
    "Tôi không còn nhu cầu mua nữa",
    "Thời gian giao hàng quá lâu",
    "Khác (Nhập lý do cụ thể...)"
];

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- STATE MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    
    const [selectedReason, setSelectedReason] = useState(null); // Lưu giá trị Select
    const [otherReason, setOtherReason] = useState(''); // Lưu giá trị nhập tay (TextArea)

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const fetchMyOrders = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await api.get(`/orders/my-orders/${user.username}`);
            setOrders(response.data);
        } catch (error) {
            message.error("Không thể tải lịch sử đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchMyOrders();
    }, [navigate]);

    // --- LOGIC MỞ MODAL ---
    const openCancelModal = (orderId) => {
        setCancellingOrderId(orderId);
        setSelectedReason(null); // Reset Select
        setOtherReason('');      // Reset TextArea
        setIsModalOpen(true);
    };

    // --- LOGIC GỬI YÊU CẦU HỦY ---
    const handleSubmitCancel = async () => {
        // 1. Validate: Phải chọn lý do
        if (!selectedReason) {
            message.warning("Vui lòng chọn lý do hủy đơn!");
            return;
        }

        // 2. Xác định lý do cuối cùng gửi đi
        let finalReason = selectedReason;
        
        // Nếu chọn "Khác" thì bắt buộc phải nhập text
        if (selectedReason === "Khác (Nhập lý do cụ thể...)") {
            if (!otherReason.trim()) {
                message.warning("Vui lòng nhập chi tiết lý do!");
                return;
            }
            finalReason = otherReason; // Lấy nội dung nhập tay
        }

        try {
            // 3. Gửi API
            await api.put(`/orders/${cancellingOrderId}/cancel`, { reason: finalReason });
            message.success("Đã hủy đơn hàng!");
            setIsModalOpen(false);
            fetchMyOrders();
        } catch (error) {
            message.error(error.response?.data || "Lỗi khi hủy đơn!");
        }
    };

    const columns = [
        { title: 'Mã ĐH', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Ngày đặt', dataIndex: 'createdAt', render: (text) => new Date(text).toLocaleString() },
        { title: 'Tổng tiền', dataIndex: 'totalAmount', render: (val) => <span style={{color:'#cf1322',fontWeight:'bold'}}>{val?.toLocaleString()} đ</span> },
        { title: 'Địa chỉ', dataIndex: 'address' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (status) => {
                let color = 'default'; let text = 'Chờ duyệt';
                if (status === 'SHIPPING') { color = 'blue'; text = 'Đang giao'; }
                if (status === 'COMPLETED') { color = 'green'; text = 'Hoàn thành'; }
                if (status === 'CANCELLED') { color = 'red'; text = 'Đã hủy'; }
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => {
                if (record.status === 'PENDING') {
                    return <Button danger size="small" icon={<StopOutlined />} onClick={() => openCancelModal(record.id)}>Hủy đơn</Button>;
                }
                return null;
            }
        }
    ];

    return (
        <div style={{ padding: '20px 50px' }}>
            <Title level={2}>Lịch sử mua hàng</Title>
            <Card>
                <Table dataSource={orders} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} />
            </Card>

            {/* --- MODAL HỦY ĐƠN NÂNG CẤP --- */}
            <Modal
                title="Xác nhận hủy đơn hàng"
                open={isModalOpen}
                onOk={handleSubmitCancel}
                onCancel={() => setIsModalOpen(false)}
                okText="Xác nhận hủy"
                okType="danger"
                cancelText="Đóng"
            >
                <p style={{ marginBottom: 10 }}>Chúng tôi rất tiếc khi bạn muốn hủy đơn. Vui lòng cho biết lý do:</p>
                
                {/* 1. DROPDOWN CHỌN LÝ DO */}
                <Select
                    style={{ width: '100%', marginBottom: 15 }}
                    placeholder="-- Chọn lý do hủy --"
                    onChange={(value) => setSelectedReason(value)}
                    value={selectedReason}
                >
                    {CANCELLATION_REASONS.map(reason => (
                        <Option key={reason} value={reason}>{reason}</Option>
                    ))}
                </Select>

                {/* 2. TEXTAREA (Chỉ hiện khi chọn 'Khác') */}
                {selectedReason === "Khác (Nhập lý do cụ thể...)" && (
                    <TextArea 
                        rows={3} 
                        placeholder="Nhập lý do cụ thể của bạn..." 
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default OrderHistory;
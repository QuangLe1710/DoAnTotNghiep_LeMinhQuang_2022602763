import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Radio, Row, Col, Card, Typography, message, Divider, Space, Tag, Modal, List } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, EnvironmentOutlined, CreditCardOutlined, GiftOutlined, HomeOutlined } from '@ant-design/icons';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Checkout = () => {
    const { cartItems, totalAmount, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    // --- STATE VOUCHER ---
    const [voucherCode, setVoucherCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [finalTotal, setFinalTotal] = useState(totalAmount);
    const [appliedVoucher, setAppliedVoucher] = useState(null);

    // --- STATE SỔ ĐỊA CHỈ (MỚI) ---
    const [addresses, setAddresses] = useState([]);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    // Cập nhật finalTotal khi totalAmount đổi
    useEffect(() => {
        setFinalTotal(Math.max(0, totalAmount - discount));
    }, [totalAmount, discount]);

    // Check Login & Load dữ liệu
    useEffect(() => {
        const username = localStorage.getItem('username');
        if (!username) {
            message.warning("Vui lòng đăng nhập để thanh toán!");
            navigate('/login');
            return;
        }
        
        // Load Sổ địa chỉ của User
        const fetchAddresses = async () => {
            try {
                const res = await api.get('/addresses');
                setAddresses(res.data);
                
                // Nếu có địa chỉ mặc định -> Tự điền vào Form
                const defaultAddr = res.data.find(a => a.isDefault);
                if (defaultAddr) {
                    fillFormWithAddress(defaultAddr);
                }
            } catch (error) {
                console.error("Lỗi tải địa chỉ", error);
            }
        };
        fetchAddresses();

    }, [navigate]);

    // Hàm điền thông tin vào Form
    const fillFormWithAddress = (addr) => {
        form.setFieldsValue({
            receiverName: addr.receiverName,
            phone: addr.phone,
            address: `${addr.detailAddress}, ${addr.city}` // Ghép địa chỉ chi tiết + thành phố
        });
        // message.success("Đã chọn địa chỉ: " + addr.detailAddress); // (Optional)
    };

    // --- XỬ LÝ VOUCHER ---
    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) {
            message.error("Vui lòng nhập mã giảm giá!");
            return;
        }
        try {
            const res = await api.get(`/vouchers/check?code=${voucherCode}&total=${totalAmount}`);
            const { discount, finalTotal } = res.data;
            setDiscount(discount);
            setFinalTotal(finalTotal);
            setAppliedVoucher(voucherCode);
            message.success(`Đã áp dụng mã: Giảm ${discount.toLocaleString()} đ`);
        } catch (error) {
            setDiscount(0);
            setFinalTotal(totalAmount);
            setAppliedVoucher(null);
            message.error(error.response?.data || "Mã không hợp lệ!");
        }
    };

    // --- XỬ LÝ ĐẶT HÀNG ---
    const onFinish = async (values) => {
        setLoading(true);
        try {
            const orderData = {
                receiverName: values.receiverName,
                phone: values.phone,
                address: values.address,
                note: values.note,
                paymentMethod: values.paymentMethod,
                voucherCode: appliedVoucher
            };

            // 1. Tạo đơn
            await api.post('/orders/place', orderData);

            // 2. Thanh toán
            if (values.paymentMethod === 'VN_PAY') {
                try {
                    const paymentRes = await api.get(`/payment/vn-pay?amount=${finalTotal}`);
                    if (paymentRes.data.code === 'ok') {
                        window.location.href = paymentRes.data.paymentUrl;
                    } else {
                        navigate('/payment-success');
                    }
                } catch (e) {
                    message.error("Lỗi kết nối VNPay");
                    setLoading(false);
                }
            } else {
                clearCart();
                message.success("Đặt hàng thành công!");
                navigate('/payment-success');
            }
        } catch (error) {
            message.error(error.response?.data || "Đặt hàng thất bại!");
            setLoading(false);
        }
    };

    if (cartItems.length === 0 && !loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: 100 }}>
                <Title level={4}>Giỏ hàng trống!</Title>
                <Button type="primary" onClick={() => navigate('/')}>Về trang chủ</Button>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 50px', background: '#f5f5f5', minHeight: '100vh' }}>
            <Title level={2} style={{ marginBottom: 30, textAlign: 'center', color: '#1890ff' }}>
                <CreditCardOutlined /> Xác nhận thanh toán
            </Title>

            <Row gutter={24}>
                {/* --- CỘT TRÁI: FORM --- */}
                <Col xs={24} lg={14}>
                    <Card 
                        title={
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <span><EnvironmentOutlined /> Thông tin giao hàng</span>
                                {/* Nút mở Sổ địa chỉ */}
                                {addresses.length > 0 && (
                                    <Button type="link" onClick={() => setIsAddressModalOpen(true)}>
                                        Chọn từ sổ địa chỉ
                                    </Button>
                                )}
                            </div>
                        } 
                        bordered={false} 
                        style={{ borderRadius: 8 }}
                    >
                        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ paymentMethod: 'COD' }}>
                            <Form.Item name="receiverName" label="Họ và tên người nhận" rules={[{ required: true }]}>
                                <Input size="large" placeholder="Nguyễn Văn A" />
                            </Form.Item>
                            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
                                <Input size="large" placeholder="0909xxxxxx" />
                            </Form.Item>
                            <Form.Item name="address" label="Địa chỉ nhận hàng" rules={[{ required: true }]}>
                                <Input size="large" placeholder="Số nhà, đường, phường, quận..." />
                            </Form.Item>
                            <Form.Item name="note" label="Ghi chú đơn hàng">
                                <TextArea rows={3} />
                            </Form.Item>

                            <Divider orientation="left">Phương thức thanh toán</Divider>
                            <Form.Item name="paymentMethod">
                                <Radio.Group style={{ width: '100%' }}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Radio value="COD" style={{ padding: '15px', border: '1px solid #d9d9d9', borderRadius: 8, width: '100%' }}>
                                            <Space>
                                                <DollarOutlined style={{ color: '#faad14', fontSize: 24 }} />
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>Thanh toán khi nhận hàng (COD)</div>
                                                    <div style={{ fontSize: 13, color: '#888' }}>Thanh toán tiền mặt cho shipper.</div>
                                                </div>
                                            </Space>
                                        </Radio>
                                        <Radio value="VN_PAY" style={{ padding: '15px', border: '1px solid #d9d9d9', borderRadius: 8, width: '100%' }}>
                                            <Space>
                                                <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png" alt="VNPay" width={30} />
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>Thanh toán qua VNPAY</div>
                                                    <div style={{ fontSize: 13, color: '#888' }}>Quét mã QR hoặc thẻ ATM/Visa.</div>
                                                </div>
                                            </Space>
                                        </Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>

                            <Form.Item style={{ marginTop: 20 }}>
                                <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ height: 50, fontSize: 18, fontWeight: 'bold' }}>
                                    ĐẶT HÀNG NGAY ({finalTotal.toLocaleString()} đ)
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                {/* --- CỘT PHẢI: ĐƠN HÀNG --- */}
                <Col xs={24} lg={10}>
                    <Card title={<><ShoppingCartOutlined /> Đơn hàng của bạn</>} bordered={false} style={{ borderRadius: 8 }}>
                        {cartItems.map((item) => (
                            <div key={item.id} style={{ display: 'flex', marginBottom: 15, borderBottom: '1px dashed #f0f0f0', paddingBottom: 15 }}>
                                <img src={item.thumbnail || 'https://via.placeholder.com/60'} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, marginRight: 10, border: '1px solid #f0f0f0' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                                    <div style={{ color: '#888', fontSize: 12 }}>x{item.quantity}</div>
                                </div>
                                <div style={{ fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString()} đ</div>
                            </div>
                        ))}

                        {/* --- NHẬP VOUCHER --- */}
                        <div style={{ marginTop: 20, background: '#f9f9f9', padding: 15, borderRadius: 8 }}>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <Input 
                                    prefix={<GiftOutlined />} 
                                    placeholder="Nhập mã giảm giá" 
                                    value={voucherCode}
                                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                    disabled={!!appliedVoucher}
                                />
                                {appliedVoucher ? (
                                    <Button danger onClick={() => {
                                        setAppliedVoucher(null);
                                        setDiscount(0);
                                        setVoucherCode('');
                                        message.info("Đã bỏ mã");
                                    }}>Bỏ chọn</Button>
                                ) : (
                                    <Button type="primary" onClick={handleApplyVoucher}>Áp dụng</Button>
                                )}
                            </div>
                            {appliedVoucher && <Tag color="green" style={{ marginTop: 10 }}>Đã áp dụng mã: {appliedVoucher}</Tag>}
                        </div>

                        <div style={{ marginTop: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <Text>Tạm tính:</Text>
                                <Text>{totalAmount.toLocaleString()} đ</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <Text>Phí vận chuyển:</Text>
                                <Text type="success">Miễn phí</Text>
                            </div>
                            {discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, color: '#52c41a' }}>
                                    <Text type="success">Voucher:</Text>
                                    <Text type="success">- {discount.toLocaleString()} đ</Text>
                                </div>
                            )}
                            <Divider />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Title level={4} style={{ margin: 0 }}>Tổng cộng:</Title>
                                <Title level={3} type="danger" style={{ margin: 0 }}>{finalTotal.toLocaleString()} đ</Title>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* --- MODAL CHỌN ĐỊA CHỈ --- */}
            <Modal
                title="Chọn địa chỉ giao hàng"
                open={isAddressModalOpen}
                onCancel={() => setIsAddressModalOpen(false)}
                footer={null}
            >
                <List
                    dataSource={addresses}
                    renderItem={(item) => (
                        <List.Item 
                            actions={[<Button type="primary" ghost onClick={() => {
                                fillFormWithAddress(item);
                                setIsAddressModalOpen(false);
                            }}>Chọn</Button>]}
                        >
                            <List.Item.Meta
                                avatar={<HomeOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                                title={
                                    <Space>
                                        <Text strong>{item.receiverName}</Text>
                                        <Text type="secondary">| {item.phone}</Text>
                                        {item.isDefault && <Tag color="blue">Mặc định</Tag>}
                                    </Space>
                                }
                                description={`${item.detailAddress}, ${item.city}`}
                            />
                        </List.Item>
                    )}
                />
                <Button block type="dashed" onClick={() => {
                    setIsAddressModalOpen(false);
                    navigate('/profile'); // Chuyển sang trang Profile để thêm địa chỉ mới
                }} style={{marginTop: 10}}>
                    + Thêm địa chỉ mới
                </Button>
            </Modal>
        </div>
    );
};

export default Checkout;
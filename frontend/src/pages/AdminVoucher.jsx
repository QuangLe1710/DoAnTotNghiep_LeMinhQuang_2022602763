import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, message, Space, Tag, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../services/api';
import dayjs from 'dayjs'; // Thư viện xử lý ngày tháng (Antd dùng cái này)

const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminVoucher = () => {
    const [vouchers, setVouchers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [form] = Form.useForm();

    const fetchVouchers = async () => {
        try {
            const res = await api.get('/vouchers');
            setVouchers(res.data);
        } catch (error) {
            message.error("Lỗi tải danh sách voucher");
        }
    };

    useEffect(() => { fetchVouchers(); }, []);

    const handleAddNew = () => {
        setEditingVoucher(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingVoucher(record);
        form.setFieldsValue({
            ...record,
            // Convert chuỗi ngày về object dayjs cho DatePicker
            dates: record.startDate && record.endDate ? [dayjs(record.startDate), dayjs(record.endDate)] : []
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Bạn chắc chắn muốn xóa?")) return;
        try {
            await api.delete(`/vouchers/${id}`);
            message.success("Đã xóa!");
            fetchVouchers();
        } catch (e) { message.error("Lỗi xóa!"); }
    };

    const handleFinish = async (values) => {
        try {
            // Chuẩn bị dữ liệu
            const payload = {
                ...values,
                startDate: values.dates ? values.dates[0].toDate() : null,
                endDate: values.dates ? values.dates[1].toDate() : null,
            };

            if (editingVoucher) {
                await api.put(`/vouchers/${editingVoucher.id}`, payload);
                message.success("Cập nhật thành công!");
            } else {
                await api.post('/vouchers', payload);
                message.success("Tạo mã thành công!");
            }
            setIsModalOpen(false);
            fetchVouchers();
        } catch (error) {
            message.error(error.response?.data || "Có lỗi xảy ra!");
        }
    };

    const columns = [
        { title: 'Mã Code', dataIndex: 'code', render: t => <Tag color="blue" style={{fontSize: 14}}>{t}</Tag> },
        { 
            title: 'Giảm giá', 
            render: (_, r) => r.discountType === 'PERCENT' ? `${r.discountValue}%` : `${r.discountValue.toLocaleString()} đ` 
        },
        { title: 'Đơn tối thiểu', dataIndex: 'minOrderValue', render: v => `${v.toLocaleString()} đ` },
        { 
            title: 'Lượt dùng', 
            render: (_, r) => `${r.usageCount} / ${r.maxUsage}` 
        },
        {
            title: 'Thời hạn',
            width: 200,
            render: (_, r) => (
                <div style={{fontSize: 12}}>
                    <div>{dayjs(r.startDate).format('DD/MM/YYYY')}</div>
                    <div>{dayjs(r.endDate).format('DD/MM/YYYY')}</div>
                </div>
            )
        },
        { 
            title: 'TT', 
            dataIndex: 'status', 
            render: s => s ? <Tag color="green">Active</Tag> : <Tag color="red">Stop</Tag> 
        },
        {
            title: 'Hành động',
            render: (_, r) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(r)} />
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Quản lý Khuyến mãi</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>Tạo mã mới</Button>
            </div>

            <Table dataSource={vouchers} columns={columns} rowKey="id" bordered />

            <Modal 
                title={editingVoucher ? "Sửa mã giảm giá" : "Tạo mã giảm giá"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ discountType: 'FIXED', status: true }}>
                    <Form.Item name="code" label="Mã Code (VD: SALE50)" rules={[{ required: true }]}>
                        <Input style={{ textTransform: 'uppercase' }} />
                    </Form.Item>
                    
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Form.Item name="discountType" label="Loại giảm" style={{ width: 120 }}>
                            <Select>
                                <Option value="FIXED">Tiền mặt</Option>
                                <Option value="PERCENT">Phần trăm</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="discountValue" label="Giá trị giảm" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                    </div>

                    <Form.Item name="minOrderValue" label="Đơn hàng tối thiểu (VNĐ)" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>

                    <Form.Item name="maxUsage" label="Tổng số lượng mã" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="dates" label="Thời gian hiệu lực" rules={[{ required: true }]}>
                        <RangePicker showTime style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="status" label="Trạng thái kích hoạt" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block>Lưu thông tin</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminVoucher;
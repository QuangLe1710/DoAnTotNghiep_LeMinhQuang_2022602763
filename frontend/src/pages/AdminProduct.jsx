import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Upload, message, Space, InputNumber, Select, Typography, Tag, Image } from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

const AdminProduct = () => {
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]); // Lưu danh sách Hãng từ API
    const [categories, setCategories] = useState([]); // Lưu danh sách Danh mục từ API
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); 
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');

    // 1. Load dữ liệu (Sản phẩm, Hãng, Danh mục)
    const fetchData = async () => {
        try {
            const [productsRes, brandsRes, categoriesRes] = await Promise.all([
                api.get('/products'),
                api.get('/products/brands'),
                api.get('/products/categories')
            ]);
            setProducts(productsRes.data);
            setBrands(brandsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            message.error("Không thể tải dữ liệu!");
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAddNew = () => {
        setEditingProduct(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingProduct(record);
        // Map dữ liệu cũ vào Form
        form.setFieldsValue({
            ...record,
            brandId: record.brand?.id || record.brandId, // Lấy ID của Brand
            categoryId: record.category?.id || record.categoryId, // Lấy ID của Category
            files: [] // Reset ô upload ảnh
        });
        setIsModalOpen(true);
    };

    // --- XỬ LÝ SUBMIT FORM ---
    const handleFinish = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            // 1. Thông tin cơ bản
            formData.append('name', values.name);
            formData.append('price', values.price);
            formData.append('salePrice', values.salePrice || 0);
            formData.append('stockQuantity', values.stockQuantity);
            formData.append('warrantyPeriod', values.warrantyPeriod);
            formData.append('description', values.description || '');
            formData.append('shortDescription', values.shortDescription || '');

            // 2. Thông số kỹ thuật (Specs)
            formData.append('cpu', values.cpu || '');
            formData.append('ram', values.ram || '');
            formData.append('storage', values.storage || '');
            formData.append('screen', values.screen || '');
            formData.append('gpu', values.gpu || '');
            formData.append('battery', values.battery || '');
            formData.append('weight', values.weight || 0);

            // 3. ID Quan hệ (Brand & Category)
            formData.append('brandId', values.brandId);
            formData.append('categoryId', values.categoryId);

            // 4. Xử lý nhiều ảnh
            if (values.files && values.files.fileList) {
                values.files.fileList.forEach(file => {
                    if (file.originFileObj) {
                        formData.append('files', file.originFileObj);
                    }
                });
            }

            if (editingProduct) {
                // API Update
                await api.put(`/products/update/${editingProduct.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                message.success("Cập nhật thành công!");
            } else {
                // API Add
                await api.post('/products/add', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                message.success("Thêm sản phẩm thành công!");
            }

            setIsModalOpen(false);
            fetchData(); 
        } catch (error) {
            console.error(error);
            message.error("Có lỗi xảy ra: " + (error.response?.data || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Xóa sản phẩm này?',
            okText: 'Xóa',
            okType: 'danger',
            onOk: async () => {
                try {
                    await api.delete(`/products/${id}`);
                    message.success("Đã xóa!");
                    fetchData();
                } catch (error) { message.error("Lỗi xóa!"); }
            }
        });
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
        { 
            title: 'Ảnh',
            dataIndex: 'thumbnail', // Backend trả về field thumbnail
            render: (src) => src ? <Image src={src} width={50} height={50} style={{objectFit: 'cover', borderRadius: 4}} /> : <Tag>No Image</Tag>
        },
        { 
            title: 'Tên Laptop', 
            dataIndex: 'name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
                <Input.Search
                    placeholder="Tìm tên..."
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onSearch={() => confirm()}
                    style={{ display: 'block' }}
                />
            ),
            filterIcon: <SearchOutlined />,
            onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
        },
        { 
            title: 'Giá bán', dataIndex: 'price', 
            render: (p) => <span style={{color: '#d4380d', fontWeight: 'bold'}}>{p?.toLocaleString()} đ</span>,
            sorter: (a, b) => a.price - b.price
        },
        { 
            title: 'Hãng', 
            dataIndex: 'brandName', // Dùng brandName từ DTO
            filters: brands.map(b => ({ text: b.name, value: b.name })),
            onFilter: (value, record) => record.brandName === value,
        },
        { 
            title: 'Kho', 
            dataIndex: 'stockQuantity',
            render: (q) => q > 0 ? <Tag color="green">{q}</Tag> : <Tag color="red">Hết</Tag>
        },
        {
            title: 'Hành động',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} type="primary" ghost onClick={() => handleEdit(record)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Typography.Title level={3} style={{ margin: 0 }}>Quản lý Kho Hàng</Typography.Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew} size="large">
                    Nhập hàng mới
                </Button>
            </div>

            <Table columns={columns} dataSource={products} rowKey="id" bordered pagination={{ pageSize: 6 }} />

            <Modal 
                title={editingProduct ? "Cập nhật sản phẩm" : "Nhập hàng mới"} 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={900}
                style={{ top: 20 }}
            >
                <Form form={form} onFinish={handleFinish} layout="vertical">
                    <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}><Input /></Form.Item>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        {/* BRAND ID - Load động từ API */}
                        <Form.Item name="brandId" label="Hãng sản xuất" rules={[{ required: true }]}>
                            <Select placeholder="Chọn hãng">
                                {brands.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
                            </Select>
                        </Form.Item>

                        {/* CATEGORY ID - Load động từ API */}
                        <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
                            <Select placeholder="Chọn danh mục">
                                {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                            </Select>
                        </Form.Item>

                        <Form.Item name="stockQuantity" label="Số lượng nhập" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        <Form.Item name="price" label="Giá gốc (VNĐ)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
                        <Form.Item name="salePrice" label="Giá khuyến mãi"><InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
                        <Form.Item name="warrantyPeriod" label="Bảo hành (Tháng)"><InputNumber style={{ width: '100%' }} /></Form.Item>
                    </div>

                    <Typography.Text strong>Cấu hình chi tiết:</Typography.Text>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f9f9f9', padding: 15, borderRadius: 8, marginTop: 5, marginBottom: 15 }}>
                        <Form.Item name="cpu" label="CPU"><Input placeholder="VD: Core i7 12700H" /></Form.Item>
                        <Form.Item name="ram" label="RAM"><Input placeholder="VD: 16GB DDR5" /></Form.Item>
                        <Form.Item name="storage" label="Ổ cứng"><Input placeholder="VD: 512GB SSD" /></Form.Item>
                        <Form.Item name="screen" label="Màn hình"><Input placeholder="VD: 15.6 inch FHD" /></Form.Item>
                        <Form.Item name="gpu" label="Card đồ họa"><Input placeholder="VD: RTX 3060 6GB" /></Form.Item>
                        <Form.Item name="battery" label="Pin"><Input placeholder="VD: 90Wh" /></Form.Item>
                        <Form.Item name="weight" label="Trọng lượng (kg)"><InputNumber step={0.1} style={{ width: '100%' }} /></Form.Item>
                    </div>

                    <Form.Item name="description" label="Mô tả chi tiết"><TextArea rows={3} /></Form.Item>

                    <Form.Item name="files" label="Hình ảnh (Chọn nhiều)">
                        <Upload beforeUpload={() => false} listType="picture-card" multiple maxCount={5}>
                            <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block size="large">
                            {editingProduct ? "Cập nhật sản phẩm" : "Lưu sản phẩm mới"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminProduct;
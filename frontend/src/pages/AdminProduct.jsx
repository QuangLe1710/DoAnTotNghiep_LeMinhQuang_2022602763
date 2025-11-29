import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Upload, message, Space, InputNumber, Select, Typography, Tag, Image } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

const AdminProduct = () => {
    // 1. STATE QUẢN LÝ DỮ LIỆU
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State phân trang & tìm kiếm
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    const [searchText, setSearchText] = useState('');

    // State dữ liệu danh mục (Dropdown)
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // State Modal & Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); 
    const [form] = Form.useForm();

    // 2. HÀM LOAD DỮ LIỆU TỪ SERVER (QUAN TRỌNG)
    const fetchProducts = async (page = 1, pageSize = 5, search = '') => {
        setLoading(true);
        try {
            // Gọi API phân trang Backend (Lưu ý: Backend page bắt đầu từ 0)
            const response = await api.get(`/products?page=${page - 1}&limit=${pageSize}&search=${search}`);
            
            // Cập nhật bảng và bộ phân trang
            setProducts(response.data.products);
            setPagination({
                current: page,
                pageSize: pageSize,
                total: response.data.totalItems, 
            });
        } catch (error) {
            // Nếu API phân trang chưa có, fallback về API thường (để code không chết)
            try {
                const resFallback = await api.get('/products');
                setProducts(resFallback.data);
            } catch (e) {
                message.error("Lỗi tải danh sách sản phẩm!");
            }
        } finally {
            setLoading(false);
        }
    };

    // Load dữ liệu lần đầu (Brands, Categories + Trang 1 sản phẩm)
    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [bRes, cRes] = await Promise.all([
                    api.get('/products/brands'),
                    api.get('/products/categories')
                ]);
                setBrands(bRes.data);
                setCategories(cRes.data);
            } catch (error) {}
        };
        fetchMeta();
        fetchProducts(1, 5, '');
    }, []);

    // 3. XỬ LÝ SỰ KIỆN BẢNG (CHUYỂN TRANG)
    const handleTableChange = (newPagination) => {
        fetchProducts(newPagination.current, newPagination.pageSize, searchText);
    };

    // Xử lý tìm kiếm
    const onSearch = (value) => {
        setSearchText(value);
        fetchProducts(1, pagination.pageSize, value); // Reset về trang 1 khi tìm kiếm
    };

    // 4. CÁC HÀM CRUD (THÊM / SỬA / XÓA)
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
            brandId: record.brand?.id || record.brandId,
            categoryId: record.category?.id || record.categoryId,
            files: [] // Reset ô upload
        });
        setIsModalOpen(true);
    };

    const handleFinish = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            // Map dữ liệu form vào FormData
            formData.append('name', values.name);
            formData.append('price', values.price);
            formData.append('salePrice', values.salePrice || 0);
            formData.append('stockQuantity', values.stockQuantity);
            formData.append('warrantyPeriod', values.warrantyPeriod);
            formData.append('description', values.description || '');
            
            // Specs
            formData.append('cpu', values.cpu || '');
            formData.append('ram', values.ram || '');
            formData.append('storage', values.storage || '');
            formData.append('screen', values.screen || '');
            formData.append('gpu', values.gpu || '');
            formData.append('battery', values.battery || '');
            formData.append('weight', values.weight || 0);

            // IDs
            formData.append('brandId', values.brandId);
            formData.append('categoryId', values.categoryId);

            // Files ảnh
            if (values.files && values.files.fileList) {
                values.files.fileList.forEach(file => {
                    if (file.originFileObj) {
                        formData.append('files', file.originFileObj);
                    }
                });
            }

            if (editingProduct) {
                await api.put(`/products/update/${editingProduct.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                message.success("Cập nhật thành công!");
            } else {
                await api.post('/products/add', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                message.success("Thêm mới thành công!");
            }

            setIsModalOpen(false);
            // Load lại đúng trang hiện tại
            fetchProducts(pagination.current, pagination.pageSize, searchText); 
        } catch (error) {
            console.error(error);
            message.error("Lỗi: " + (error.response?.data || error.message));
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
                    // Nếu xóa hết dòng ở trang cuối, lùi về trang trước
                    if (products.length === 1 && pagination.current > 1) {
                        fetchProducts(pagination.current - 1, pagination.pageSize, searchText);
                    } else {
                        fetchProducts(pagination.current, pagination.pageSize, searchText);
                    }
                } catch (error) { message.error("Lỗi xóa!"); }
            }
        });
    };

    // 5. CẤU HÌNH CỘT BẢNG
    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
        { 
            title: 'Ảnh',
            dataIndex: 'thumbnail', // Backend DTO trả về thumbnail
            align: 'center',
            render: (src) => src ? <Image src={src} width={50} height={50} style={{objectFit: 'cover', borderRadius: 4}} /> : <Tag>No Img</Tag>
        },
        { title: 'Tên Laptop', dataIndex: 'name' },
        { 
            title: 'Giá bán', dataIndex: 'price', 
            render: (p) => <span style={{color: '#d4380d', fontWeight: 'bold'}}>{p?.toLocaleString()}</span>,
        },
        { 
            title: 'Hãng', dataIndex: 'brandName',
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        { 
            title: 'Kho', dataIndex: 'stockQuantity', align: 'center',
            render: (q) => q > 0 ? <Tag color="green">{q}</Tag> : <Tag color="red">Hết</Tag>
        },
        {
            title: 'Hành động', align: 'center',
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
            {/* Header + Nút Thêm */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Typography.Title level={3} style={{ margin: 0 }}>Quản lý Kho Hàng</Typography.Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew} size="large">
                    Nhập hàng mới
                </Button>
            </div>

            {/* Thanh Tìm kiếm Server-side */}
            <Input.Search 
                placeholder="Tìm tên sản phẩm..." 
                allowClear
                enterButton="Tìm kiếm"
                size="middle"
                style={{ marginBottom: 16, maxWidth: 400 }} 
                onSearch={onSearch}
            />

            {/* Bảng Dữ liệu */}
            <Table 
                columns={columns} 
                dataSource={products} 
                rowKey="id" 
                bordered 
                loading={loading}
                // Cấu hình phân trang
                pagination={{ 
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showTotal: (total) => `Tổng ${total} sản phẩm`,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20']
                }} 
                onChange={handleTableChange} // Sự kiện bấm chuyển trang
            />

            {/* Modal Form */}
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
                        <Form.Item name="brandId" label="Hãng sản xuất" rules={[{ required: true }]}>
                            <Select placeholder="Chọn hãng">
                                {brands.map(b => <Option key={b.id} value={b.id}>{b.name}</Option>)}
                            </Select>
                        </Form.Item>
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
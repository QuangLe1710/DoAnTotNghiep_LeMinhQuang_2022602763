import React, { useState, useRef, useEffect } from 'react';
import { FloatButton, Card, Input, Button, List, Avatar, Spin } from 'antd';
import { RobotOutlined, SendOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import api from '../services/api';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Xin chào! Tôi là trợ lý ảo MyLap. Bạn cần tìm laptop loại nào?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Tự động cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        // 1. Hiện tin nhắn người dùng
        const userMsg = inputValue;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInputValue('');
        setLoading(true);

        try {
            // 2. Gọi API Backend
            const res = await api.post('/chat', { message: userMsg });
            
            // 3. Hiện tin nhắn Bot
            setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'bot', text: 'Xin lỗi, tôi đang gặp sự cố kết nối!' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Nút mở chat */}
            <FloatButton 
                icon={<RobotOutlined />} 
                type="primary" 
                style={{ right: 90, bottom: 24 }} // Đặt cạnh nút tiện ích cũ
                onClick={() => setIsOpen(!isOpen)}
                tooltip="Chat với AI"
            />

            {/* Cửa sổ chat */}
            {isOpen && (
                <Card 
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <RobotOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                            <span>Trợ lý ảo MyLap</span>
                        </div>
                    }
                    extra={<Button type="text" icon={<CloseOutlined />} onClick={() => setIsOpen(false)} />}
                    style={{
                        position: 'fixed', right: 90, bottom: 80, 
                        width: 350, height: 500, zIndex: 1000,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        display: 'flex', flexDirection: 'column'
                    }}
                    bodyStyle={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}
                >
                    {/* Danh sách tin nhắn */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 15, background: '#f5f5f5' }}>
                        <List
                            dataSource={messages}
                            renderItem={item => (
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start',
                                    marginBottom: 10 
                                }}>
                                    {item.sender === 'bot' && <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff', marginRight: 5 }} />}
                                    <div style={{
                                        background: item.sender === 'user' ? '#1890ff' : '#fff',
                                        color: item.sender === 'user' ? '#fff' : '#333',
                                        padding: '8px 12px',
                                        borderRadius: 12,
                                        maxWidth: '70%',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }}>
                                        {item.text}
                                    </div>
                                    {item.sender === 'user' && <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068', marginLeft: 5 }} />}
                                </div>
                            )}
                        />
                        {loading && <div style={{ textAlign: 'center', color: '#999' }}><Spin size="small" /> Đang suy nghĩ...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Ô nhập liệu */}
                    <div style={{ padding: 10, background: '#fff', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 10 }}>
                        <Input 
                            placeholder="Hỏi gì đó đi..." 
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onPressEnter={handleSend}
                        />
                        <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} />
                    </div>
                </Card>
            )}
        </>
    );
};

export default ChatWidget;
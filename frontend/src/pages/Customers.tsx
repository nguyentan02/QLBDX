import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, Form, Input, message, Popconfirm, Tag, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { AxiosError } from 'axios';
import api from '../api/axios';
import { Customer, CustomerForm } from '../types';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [search, setSearch] = useState<string>('');
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [form] = Form.useForm<CustomerForm>();

  const fetchCustomers = async (searchTerm: string = '') => {
    setLoading(true);
    try {
      const res = await api.get<Customer[]>('/customers', { params: { search: searchTerm, includeInactive: showInactive ? 'true' : undefined } });
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(search); }, [showInactive]);

  const handleSubmit = async (values: CustomerForm) => {
    try {
      if (editing) {
        await api.put(`/customers/${editing.id}`, values);
        message.success('Cập nhật thành công');
      } else {
        await api.post('/customers', values);
        message.success('Thêm khách hàng thành công');
      }
      setModal(false);
      form.resetFields();
      setEditing(null);
      fetchCustomers(search);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (record: Customer) => {
    setEditing(record);
    form.setFieldsValue({
      fullName: record.fullName,
      phone: record.phone,
      email: record.email,
      address: record.address,
      identityCard: record.identityCard,
    });
    setModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/customers/${id}`);
      message.success('Xóa thành công');
      fetchCustomers(search);
    } catch (err) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleToggleActive = async (record: Customer) => {
    try {
      const res = await api.patch(`/customers/${record.id}/toggle-active`);
      message.success(res.data.message);
      fetchCustomers(search);
    } catch (err) {
      message.error('Có lỗi xảy ra');
    }
  };

  const columns = [
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName', render: (t: string) => <span style={{ fontWeight: 500 }}>{t}</span> },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (t?: string) => t || '-' },
    { title: 'CMND/CCCD', dataIndex: 'identityCard', key: 'identityCard', render: (t?: string) => t || '-' },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address', render: (t?: string) => t || '-' },
    { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', width: 120, render: (active: boolean) => active ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Vô hiệu</Tag> },
    {
      title: 'Thao tác', key: 'action', width: 240, render: (_: any, r: Customer) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(r)} size="small">Sửa</Button>
          <Popconfirm title={r.isActive ? 'Vô hiệu hóa khách hàng này?' : 'Kích hoạt lại khách hàng này?'} onConfirm={() => handleToggleActive(r)}>
            <Button icon={r.isActive ? <StopOutlined /> : <CheckCircleOutlined />} size="small" danger={r.isActive} type={r.isActive ? 'default' : 'primary'} ghost={!r.isActive}>{r.isActive ? 'Vô hiệu' : 'Kích hoạt'}</Button>
          </Popconfirm>
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(r.id)}>
            <Button icon={<DeleteOutlined />} danger size="small">Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2 className="page-title">Quản lý khách hàng</h2>
      <Card>
        <div className="toolbar">
          <Input.Search
            placeholder="Tìm theo tên, SĐT, CMND..."
            style={{ width: 300 }}
            onSearch={(v) => { setSearch(v); fetchCustomers(v); }}
            allowClear
          />
          <div className="toolbar-right" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>
              <Switch size="small" checked={showInactive} onChange={setShowInactive} /> Hiển thị đã vô hiệu
            </span>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModal(true); }}>
              Thêm khách hàng
            </Button>
          </div>
        </div>
        <Table columns={columns} dataSource={customers} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editing ? 'Sửa khách hàng' : 'Thêm khách hàng'}
        open={modal}
        onCancel={() => { setModal(false); setEditing(null); form.resetFields(); }}
        onOk={() => form.submit()}
        okText={editing ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="identityCard" label="CMND/CCCD">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;

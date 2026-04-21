import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, Form, Select, DatePicker, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons';
import { AxiosError } from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import api from '../api/axios';
import { CustomerPackage, Customer, ParkingPackage, Vehicle, CustomerPackageForm } from '../types';

const CustomerPackages: React.FC = () => {
  const [customerPackages, setCustomerPackages] = useState<CustomerPackage[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [packages, setPackages] = useState<ParkingPackage[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [editModal, setEditModal] = useState<boolean>(false);
  const [editingPkg, setEditingPkg] = useState<CustomerPackage | null>(null);
  const [editForm] = Form.useForm();
  const [form] = Form.useForm<CustomerPackageForm>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cpRes, cRes, pRes, vRes] = await Promise.all([
        api.get<CustomerPackage[]>('/customer-packages', { params: { status: statusFilter } }),
        api.get<Customer[]>('/customers'),
        api.get<ParkingPackage[]>('/packages'),
        api.get<Vehicle[]>('/vehicles'),
      ]);
      setCustomerPackages(cpRes.data);
      setCustomers(cRes.data);
      setPackages(pRes.data);
      setVehicles(vRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const handleSubmit = async (values: CustomerPackageForm) => {
    try {
      const payload = {
        customerId: values.customerId,
        packageId: values.packageId,
        vehicleId: values.vehicleId,
        startDate: values.startDate.format('YYYY-MM-DD'),
      };
      await api.post('/customer-packages', payload);
      message.success('Đăng ký gói thành công');
      setModal(false);
      form.resetFields();
      fetchData();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (record: CustomerPackage) => {
    setEditingPkg(record);
    editForm.setFieldsValue({
      customerId: record.customerId,
      vehicleId: record.vehicleId,
      status: record.status,
    });
    setEditModal(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingPkg) return;
    try {
      await api.put(`/customer-packages/${editingPkg.id}`, {
        customerId: values.customerId,
        vehicleId: values.vehicleId,
        status: values.status,
      });
      message.success('Cập nhật thành công');
      setEditModal(false);
      setEditingPkg(null);
      editForm.resetFields();
      fetchData();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa gói dịch vụ này? Thanh toán liên quan cũng sẽ bị xóa.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.delete(`/customer-packages/${id}`);
          message.success('Xóa thành công');
          fetchData();
        } catch (err) {
          const error = err as AxiosError<{ message: string }>;
          message.error(error.response?.data?.message || 'Không thể xóa');
        }
      },
    });
  };

  const columns = [
    { title: 'Khách hàng', key: 'customerName', render: (_: any, r: CustomerPackage) => <span style={{ fontWeight: 500 }}>{r.customer?.fullName || '-'}</span> },
    { title: 'Gói', key: 'packageName', render: (_: any, r: CustomerPackage) => r.parkingPackage?.name || '-' },
    { title: 'Phương tiện', key: 'vehiclePlate', render: (_: any, r: CustomerPackage) => r.vehicle?.licensePlate || '-' },
    { title: 'Bắt đầu', dataIndex: 'startDate', key: 'startDate', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    { title: 'Kết thúc', dataIndex: 'endDate', key: 'endDate', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 160, render: (s: string, r: CustomerPackage) => {
        if (s === 'cancelled') return <Tag color="red">Đã hủy</Tag>;
        if (s === 'expired') return <Tag>Hết hạn</Tag>;
        // active - show remaining days
        const daysLeft = dayjs(r.endDate).diff(dayjs(), 'day');
        if (daysLeft <= 0) return <Tag>Hết hạn</Tag>;
        if (daysLeft <= 7) return <Tag color="orange">Còn {daysLeft} ngày</Tag>;
        return <Tag className="chip-available">Còn {daysLeft} ngày</Tag>;
      }
    },
    {
      title: 'Thao tác', key: 'action', width: 160, render: (_: any, r: CustomerPackage) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(r)} size="small">Sửa</Button>
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} size="small" danger>Xóa</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2 className="page-title">Gói dịch vụ của khách hàng</h2>
      <Card>
        <div className="toolbar">
          <Select
            placeholder="Lọc trạng thái"
            allowClear
            style={{ width: 200 }}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
          >
            <Select.Option value="active">Đang hoạt động</Select.Option>
            <Select.Option value="expired">Hết hạn</Select.Option>
            <Select.Option value="cancelled">Đã hủy</Select.Option>
          </Select>
          <div className="toolbar-right">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModal(true); }}>
              Đăng ký gói dịch vụ
            </Button>
          </div>
        </div>
        <Table columns={columns} dataSource={customerPackages} rowKey="id" loading={loading} />
      </Card>

      <Modal
        title="Đăng ký gói dịch vụ"
        open={modal}
        onCancel={() => { setModal(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Đăng ký"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="customerId" label="Khách hàng" rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}>
            <Select
              showSearch
              placeholder="Chọn khách hàng"
              filterOption={(input, option) => String(option?.children).toLowerCase().includes(input.toLowerCase())}
            >
              {customers.map((c) => <Select.Option key={c.id} value={c.id}>{c.fullName} - {c.phone}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="packageId" label="Gói dịch vụ" rules={[{ required: true, message: 'Vui lòng chọn gói' }]}>
            <Select placeholder="Chọn gói">
              {packages.map((p) => <Select.Option key={p.id} value={p.id}>{p.name} - {Number(p.price).toLocaleString()}đ</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="vehicleId" label="Phương tiện" rules={[{ required: true, message: 'Vui lòng chọn phương tiện' }]}>
            <Select showSearch placeholder="Chọn phương tiện" filterOption={(input, option) => String(option?.children).toLowerCase().includes(input.toLowerCase())}>
              {vehicles.filter(v => !form.getFieldValue('customerId') || v.customerId === form.getFieldValue('customerId')).map((v) => <Select.Option key={v.id} value={v.id}>{v.licensePlate} - {v.customer?.fullName || ''}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]} initialValue={dayjs()}>
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Cập nhật gói dịch vụ"
        open={editModal}
        onCancel={() => { setEditModal(false); setEditingPkg(null); editForm.resetFields(); }}
        onOk={() => editForm.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        {editingPkg && (
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <div style={{ marginBottom: 16, padding: '8px 12px', background: 'var(--surface-variant, #f5f5f5)', borderRadius: 8 }}>
              <div><strong>Gói:</strong> {editingPkg.parkingPackage?.name}</div>
              <div><strong>Thời hạn:</strong> {dayjs(editingPkg.startDate).format('DD/MM/YYYY')} — {dayjs(editingPkg.endDate).format('DD/MM/YYYY')}</div>
            </div>
            <Form.Item name="customerId" label="Khách hàng" rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}>
              <Select showSearch placeholder="Chọn khách hàng" filterOption={(input, option) => String(option?.children).toLowerCase().includes(input.toLowerCase())}>
                {customers.map((c) => <Select.Option key={c.id} value={c.id}>{c.fullName} - {c.phone}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="vehicleId" label="Phương tiện" rules={[{ required: true, message: 'Vui lòng chọn phương tiện' }]}>
              <Select showSearch placeholder="Chọn phương tiện" filterOption={(input, option) => String(option?.children).toLowerCase().includes(input.toLowerCase())}>
                {vehicles.map((v) => <Select.Option key={v.id} value={v.id}>{v.licensePlate} - {v.customer?.fullName || ''}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="active">Hoạt động</Select.Option>
                <Select.Option value="expired">Hết hạn</Select.Option>
                <Select.Option value="cancelled">Đã hủy</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default CustomerPackages;

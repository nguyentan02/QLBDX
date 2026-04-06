import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, message, Row, Col, Tag, Table } from 'antd';
import { AxiosError } from 'axios';
import api from '../api/axios';
import { VehicleType, ParkingSpot, Vehicle, ParkingEntryForm, ParkingRecord } from '../types';

const ParkingEntry: React.FC = () => {
  const [form] = Form.useForm<ParkingEntryForm>();
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [vehicleInfo, setVehicleInfo] = useState<Vehicle | null>(null);
  const [parkedRecords, setParkedRecords] = useState<ParkingRecord[]>([]);

  const fetchData = async () => {
    try {
      const [vtRes, spRes, prRes] = await Promise.all([
        api.get<VehicleType[]>('/vehicle-types'),
        api.get<ParkingSpot[]>('/parking-spots', { params: { status: 'available' } }),
        api.get<ParkingRecord[]>('/parking', { params: { status: 'parked' } }),
      ]);
      setVehicleTypes(vtRes.data);
      setSpots(spRes.data);
      setParkedRecords(prRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const normalizePlate = (val: string) => val.replace(/[-\s.]/g, '').toUpperCase();

  const lookupPlate = async () => {
    const raw = form.getFieldValue('licensePlate');
    if (!raw) return;
    const plate = normalizePlate(raw);
    form.setFieldsValue({ licensePlate: plate });
    try {
      const res = await api.get<Vehicle>(`/vehicles/by-plate/${encodeURIComponent(plate)}`);
      setVehicleInfo(res.data);
      form.setFieldsValue({ vehicleTypeId: res.data.vehicleTypeId });
      message.info(`Xe của: ${res.data.customer?.fullName || 'Không rõ'}`);
    } catch {
      setVehicleInfo(null);
    }
  };

  const onFinish = async (values: ParkingEntryForm) => {
    setLoading(true);
    try {
      await api.post('/parking/entry', { ...values, licensePlate: normalizePlate(values.licensePlate) });
      message.success('Ghi nhận xe vào thành công!');
      form.resetFields();
      setVehicleInfo(null);
      fetchData();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const zoneGroups = Array.from(new Set(spots.map(s => s.zone?.name))).filter(Boolean);

  const parkedColumns = [
    { title: 'Biển số', dataIndex: 'licensePlate', key: 'licensePlate', render: (t: string) => <Tag className="plate-tag">{t}</Tag> },
    { title: 'Loại xe', key: 'vehicleType', render: (_: any, r: ParkingRecord) => r.vehicleType?.name || '-' },
    { title: 'Chỗ đỗ', key: 'spot', render: (_: any, r: ParkingRecord) => r.parkingSpot ? `${r.parkingSpot.zone?.name} — ${r.parkingSpot.spotNumber}` : '-' },
    { title: 'Khách hàng', key: 'customer', render: (_: any, r: ParkingRecord) => r.vehicle?.customer?.fullName || 'Khách vãng lai' },
    { title: 'Giờ vào', dataIndex: 'entryTime', key: 'entryTime', render: (t: string) => new Date(t).toLocaleString('vi-VN') },
    {
      title: 'Thời gian đỗ', key: 'duration', render: (_: any, r: ParkingRecord) => {
        const mins = Math.ceil((Date.now() - new Date(r.entryTime).getTime()) / 60000);
        const hours = Math.floor(mins / 60);
        return hours > 0 ? `${hours}h ${mins % 60}p` : `${mins}p`;
      }
    },
  ];

  return (
    <div>
      <h2 className="page-title">Ghi nhận xe vào</h2>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item label="Biển số xe" name="licensePlate" rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }, { pattern: /^\d{2}[A-Z]\d{4,5}$/, message: 'Biển số không đúng định dạng (VD: 29A87642)' }]}>
                <Input placeholder="VD: 29A87642" onBlur={lookupPlate} style={{ textTransform: 'uppercase' }} />
              </Form.Item>
              <Form.Item label="Loại xe" name="vehicleTypeId" rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}>
                <Select placeholder="Chọn loại xe">
                  {vehicleTypes.map((vt) => (
                    <Select.Option key={vt.id} value={vt.id}>{vt.name} — {Number(vt.hourlyRate).toLocaleString()}đ/lượt</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Chỗ đỗ" name="parkingSpotId">
                <Select placeholder="Chọn chỗ đỗ (tùy chọn)" allowClear showSearch
                  filterOption={(input, option) => String(option?.children).toLowerCase().includes(input.toLowerCase())}>
                  {spots.map((s) => (
                    <Select.Option key={s.id} value={s.id}>{s.zone?.name} — {s.spotNumber}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Ghi chú" name="notes">
                <Input.TextArea rows={2} placeholder="Ghi chú thêm..." />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={loading} size="large" block style={{ height: 48, fontWeight: 600 }}>
                  Ghi nhận xe vào
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          {vehicleInfo && (
            <Card className="info-panel" style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 16 }}>Thông tin xe</div>
              <div className="info-row"><span className="info-label">Chủ xe</span><span className="info-value">{vehicleInfo.customer?.fullName || '-'}</span></div>
              <div className="info-row"><span className="info-label">Loại xe</span><span className="info-value">{vehicleInfo.vehicleType?.name || '-'}</span></div>
              <div className="info-row"><span className="info-label">Biển số</span><span className="info-value" style={{ fontWeight: 600, letterSpacing: '0.02em' }}>{vehicleInfo.licensePlate}</span></div>
              <div className="info-row"><span className="info-label">Hãng</span><span className="info-value">{vehicleInfo.brand || '-'}</span></div>
              <div className="info-row"><span className="info-label">Màu</span><span className="info-value">{vehicleInfo.color || '-'}</span></div>
            </Card>
          )}
          <Card>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 16 }}>Chỗ đỗ trống</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 16 }}>{spots.length}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {zoneGroups.map(zone => (
                <Tag key={zone} className="chip-available" style={{ borderRadius: 9999 }}>{zone}: {spots.filter(s => s.zone?.name === zone).length}</Tag>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 16 }}>
          Xe đang trong bãi ({parkedRecords.length})
        </div>
        <Table columns={parkedColumns} dataSource={parkedRecords} rowKey="id" pagination={{ pageSize: 10 }} size="small" />
      </Card>
    </div>
  );
};

export default ParkingEntry;

import React, { useState, useEffect } from 'react';
import { Table, Card, DatePicker, Input, Tag, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import api from '../api/axios';
import { ParkingRecord } from '../types';

const { RangePicker } = DatePicker;

interface Filters {
  from: string | null;
  to: string | null;
  licensePlate: string;
}

const ParkingHistory: React.FC = () => {
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({ from: null, to: null, licensePlate: '' });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.licensePlate) params.licensePlate = filters.licensePlate;
      const res = await api.get<ParkingRecord[]>('/parking/history', { params });
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const columns = [
    { title: 'Biển số', dataIndex: 'licensePlate', key: 'licensePlate', render: (t: string) => <Tag className="plate-tag">{t}</Tag> },
    { title: 'Loại xe', key: 'vehicleTypeName', render: (_: any, r: ParkingRecord) => r.vehicleType?.name || '-' },
    { title: 'Chỗ đỗ', key: 'spot', render: (_: any, r: ParkingRecord) => r.parkingSpot ? `${r.parkingSpot.zone?.name} — ${r.parkingSpot.spotNumber}` : '-' },
    { title: 'Giờ vào', dataIndex: 'entryTime', key: 'entryTime', render: (t: string) => new Date(t).toLocaleString('vi-VN') },
    { title: 'Giờ ra', dataIndex: 'exitTime', key: 'exitTime', render: (t?: string) => t ? new Date(t).toLocaleString('vi-VN') : '-' },
    { title: 'Thời gian (phút)', dataIndex: 'duration', key: 'duration' },
    { title: 'Phí (đ)', dataIndex: 'fee', key: 'fee', render: (v?: number) => v ? Number(v).toLocaleString() : '0' },
  ];

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setFilters({
      ...filters,
      from: dates && dates[0] ? dates[0].format('YYYY-MM-DD') : null,
      to: dates && dates[1] ? dates[1].format('YYYY-MM-DD') : null,
    });
  };

  return (
    <div>
      <h2 className="page-title">Lịch sử xe ra vào</h2>
      <Card>
        <div className="toolbar">
          <RangePicker onChange={handleDateChange} format="DD/MM/YYYY" placeholder={['Từ ngày', 'Đến ngày']} />
          <Input.Search
            placeholder="Tìm biển số..."
            style={{ width: 220 }}
            onSearch={(v) => { setFilters({ ...filters, licensePlate: v }); }}
            allowClear
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={fetchRecords}>Tìm kiếm</Button>
        </div>
        <Table columns={columns} dataSource={records} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>
    </div>
  );
};

export default ParkingHistory;

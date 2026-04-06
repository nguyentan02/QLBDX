import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Row, Col, Table, message } from 'antd';
import { DollarOutlined, CarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import { RevenueReport, VehicleStats } from '../types';

const { RangePicker } = DatePicker;

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [revenue, setRevenue] = useState<RevenueReport[]>([]);
  const [vehicleStats, setVehicleStats] = useState<VehicleStats[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalVehicles, setTotalVehicles] = useState<number>(0);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        fromDate: dateRange[0].format('YYYY-MM-DD'),
        toDate: dateRange[1].format('YYYY-MM-DD'),
      };
      const [revRes, vehRes] = await Promise.all([
        api.get<RevenueReport[]>('/reports/revenue', { params }),
        api.get<VehicleStats[]>('/reports/vehicle-stats', { params }),
      ]);
      setRevenue(revRes.data);
      setVehicleStats(vehRes.data);
      const totRev = revRes.data.reduce((sum, r) => sum + Number(r.totalRevenue), 0);
      const totVeh = vehRes.data.reduce((sum, v) => sum + v.totalRecords, 0);
      setTotalRevenue(totRev);
      setTotalVehicles(totVeh);
    } catch (err) {
      message.error('Lỗi tải báo cáo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [dateRange]);

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  const revenueColumns = [
    { title: 'Ngày', dataIndex: 'period', key: 'period', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    { title: 'Doanh thu (đ)', dataIndex: 'totalRevenue', key: 'totalRevenue', render: (v: number) => <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{Number(v).toLocaleString()}</span> },
  ];

  const vehicleColumns = [
    { title: 'Loại xe', dataIndex: 'vehicleType', key: 'vehicleType' },
    { title: 'Số lượt', dataIndex: 'totalRecords', key: 'totalRecords', render: (v: number) => <span style={{ fontWeight: 600 }}>{v}</span> },
  ];

  const chartData = revenue.map((r) => ({ date: dayjs(r.period).format('DD/MM'), revenue: Number(r.totalRevenue) }));

  return (
    <div>
      <h2 className="page-title">Báo cáo thống kê</h2>

      <div className="toolbar">
        <RangePicker format="DD/MM/YYYY" value={dateRange} onChange={handleDateChange} placeholder={['Từ ngày', 'Đến ngày']} />
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card className="stat-card stat-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-default)', background: 'var(--info-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarOutlined style={{ fontSize: 22, color: 'var(--info)' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tổng doanh thu</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--on-surface)' }}>{totalRevenue.toLocaleString()}đ</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card className="stat-card stat-success">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-default)', background: 'var(--success-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CarOutlined style={{ fontSize: 22, color: 'var(--success)' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tổng số lượt xe</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--on-surface)' }}>{totalVehicles.toLocaleString()}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card className="chart-card" title="Doanh thu theo ngày" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--on-surface-variant)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--on-surface-variant)' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 8px 24px rgba(19,27,44,0.12)' }} formatter={(value: number) => `${value.toLocaleString()}đ`} />
                <Legend />
                <Bar dataKey="revenue" fill="var(--primary)" name="Doanh thu" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <Table columns={revenueColumns} dataSource={revenue} rowKey="period" pagination={false} style={{ marginTop: 16 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Phân loại xe" loading={loading}>
            <Table columns={vehicleColumns} dataSource={vehicleStats} rowKey="vehicleType" pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;

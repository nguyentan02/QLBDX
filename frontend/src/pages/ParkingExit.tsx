import React, { useState, useEffect } from 'react';
import { Table, Button, Card, message, Modal, Select, Tag, Input, Alert } from 'antd';
import { AxiosError } from 'axios';
import api from '../api/axios';
import { ParkingRecord, ParkingExitRequest } from '../types';

interface ExitResponse {
  message: string;
  data: {
    entryTime: string;
    exitTime: string;
    durationMinutes: number;
    fee: number;
    hasPackage: boolean;
  };
}

interface PreviewFee {
  fee: number;
  hasPackage: boolean;
  durationMinutes: number;
  packageEndDate?: string | null;
  daysUntilExpiry?: number | null;
}

const ParkingExit: React.FC = () => {
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [exitModal, setExitModal] = useState<ParkingRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [searchPlate, setSearchPlate] = useState<string>('');
  const [previewFee, setPreviewFee] = useState<PreviewFee | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get<ParkingRecord[]>('/parking', { params: { status: 'parked' } });
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleExit = async () => {
    if (!exitModal) return;
    try {
      const res = await api.post<ExitResponse>('/parking/exit', {
        parkingRecordId: exitModal.id,
        paymentMethod,
      } as ParkingExitRequest);
      message.success(`Xe ra thành công! Phí: ${Number(res.data.data.fee).toLocaleString()}đ`);
      setExitModal(null);
      fetchRecords();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const filteredRecords = records.filter(r =>
    !searchPlate || r.licensePlate.toLowerCase().includes(searchPlate.toLowerCase())
  );

  const columns = [
    { title: 'Biển số', dataIndex: 'licensePlate', key: 'licensePlate', render: (t: string) => <Tag className="plate-tag">{t}</Tag> },
    { title: 'Loại xe', key: 'vehicleTypeName', render: (_: any, r: ParkingRecord) => r.vehicleType?.name || '-' },
    { title: 'Chỗ đỗ', key: 'spot', render: (_: any, r: ParkingRecord) => r.parkingSpot ? `${r.parkingSpot.zone?.name} — ${r.parkingSpot.spotNumber}` : '-' },
    { title: 'Khách hàng', key: 'customerName', render: (_: any, r: ParkingRecord) => r.vehicle?.customer?.fullName || 'Khách vãng lai' },
    { title: 'Giờ vào', dataIndex: 'entryTime', key: 'entryTime', render: (t: string) => new Date(t).toLocaleString('vi-VN') },
    {
      title: 'Thời gian đỗ', key: 'duration', render: (_: any, r: ParkingRecord) => {
        const mins = Math.ceil((Date.now() - new Date(r.entryTime).getTime()) / 60000);
        const hours = Math.floor(mins / 60);
        return hours > 0 ? `${hours}h ${mins % 60}p` : `${mins}p`;
      }
    },
    {
      title: 'Thao tác', key: 'action', width: 120,
      render: (_: any, record: ParkingRecord) => (
        <Button type="primary" onClick={() => openExitModal(record)} size="small">Cho xe ra</Button>
      ),
    },
  ];

  const openExitModal = async (record: ParkingRecord) => {
    setExitModal(record);
    setPreviewFee(null);
    setPreviewLoading(true);
    try {
      const res = await api.get(`/parking/${record.id}/preview`);
      setPreviewFee(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">Ghi nhận xe ra</h2>
      <Card>
        <div className="toolbar">
          <Input.Search
            placeholder="Tìm biển số xe..."
            style={{ width: 300 }}
            value={searchPlate}
            onChange={(e) => setSearchPlate(e.target.value)}
            allowClear
          />
        </div>
        <Table columns={columns} dataSource={filteredRecords} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="Xác nhận xe ra" open={!!exitModal} onOk={handleExit} onCancel={() => setExitModal(null)} okText="Xác nhận" cancelText="Hủy">
        {exitModal && (
          <div>
            <div className="info-panel" style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-default)', padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
              <div className="info-row"><span className="info-label">Biển số</span><Tag className="plate-tag">{exitModal.licensePlate}</Tag></div>
              <div className="info-row"><span className="info-label">Loại xe</span><span className="info-value">{exitModal.vehicleType?.name || '-'}</span></div>
              <div className="info-row"><span className="info-label">Giờ vào</span><span className="info-value">{new Date(exitModal.entryTime).toLocaleString('vi-VN')}</span></div>
              <div className="info-row"><span className="info-label">Giờ ra</span><span className="info-value">{new Date().toLocaleString('vi-VN')}</span></div>
              {previewLoading ? (
                <div className="info-row"><span className="info-label">Phí gửi xe</span><span className="info-value">Đang tính...</span></div>
              ) : previewFee && (
                <>
                  <div className="info-row"><span className="info-label">Thời gian đỗ</span><span className="info-value">{Math.floor(previewFee.durationMinutes / 60) > 0 ? `${Math.floor(previewFee.durationMinutes / 60)}h ${previewFee.durationMinutes % 60}p` : `${previewFee.durationMinutes}p`}</span></div>
                  <div className="info-row">
                    <span className="info-label">Phí gửi xe</span>
                    <span className="info-value" style={{ fontSize: '1.25rem', fontWeight: 700, color: previewFee.hasPackage ? 'var(--success)' : 'var(--error)' }}>
                      {previewFee.hasPackage ? 'Miễn phí (có gói)' : `${Number(previewFee.fee).toLocaleString()}đ`}
                    </span>
                  </div>
                  {previewFee.hasPackage && previewFee.daysUntilExpiry !== null && previewFee.daysUntilExpiry !== undefined && (
                    previewFee.daysUntilExpiry === 0 ? (
                      <Alert
                        type="error"
                        showIcon
                        message="Gói hết hạn hôm nay!"
                        description="Đây là lần sử dụng cuối. Nhắc khách gia hạn gói để tiếp tục miễn phí."
                        style={{ marginTop: 12, borderRadius: 6 }}
                      />
                    ) : previewFee.daysUntilExpiry <= 7 ? (
                      <Alert
                        type="warning"
                        showIcon
                        message={`Gói sắp hết hạn — còn ${previewFee.daysUntilExpiry} ngày`}
                        description={`Hết hạn ngày ${
                          previewFee.packageEndDate
                            ? new Date(previewFee.packageEndDate).toLocaleDateString('vi-VN')
                            : ''
                        }. Nhắc khách hàng gia hạn sớm.`}
                        style={{ marginTop: 12, borderRadius: 6 }}
                      />
                    ) : null
                  )}
                </>
              )}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--on-surface-variant)', marginBottom: 8 }}>Phương thức thanh toán</div>
              <Select value={paymentMethod} onChange={setPaymentMethod} style={{ width: '100%' }}>
                <Select.Option value="cash">Tiền mặt</Select.Option>
                <Select.Option value="card">Thẻ</Select.Option>
                <Select.Option value="transfer">Chuyển khoản</Select.Option>
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ParkingExit;

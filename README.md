# Hệ thống Quản lý Bãi đỗ xe

## Công nghệ sử dụng

| Thành phần   | Công nghệ                                      |
| ------------ | ----------------------------------------------- |
| **Backend**  | Node.js + Express + TypeScript + Prisma ORM     |
| **Frontend** | ReactJS + TypeScript + Ant Design 5 + Recharts  |
| **Database** | Microsoft SQL Server                            |
| **Auth**     | JWT (JSON Web Token)                            |

## Tính năng

1. **Quản lý xe ra/vào** - Ghi nhận xe vào, xe ra, tính phí tự động
2. **Quản lý bãi đỗ** - Phân khu (Khu A–D), chỗ đỗ, trạng thái
3. **Quản lý khách hàng** - Thông tin khách hàng, phương tiện
4. **Gói dịch vụ** - Vé tháng/quý/năm cho từng loại xe
5. **Tính phí & thanh toán** - Tính phí theo giờ/ngày, nhiều phương thức thanh toán
6. **Quản lý người dùng** - Admin/nhân viên, phân quyền
7. **Báo cáo thống kê** - Doanh thu, lượt xe, biểu đồ
8. **Nhật ký hoạt động** - Ghi lại mọi thao tác của người dùng (chỉ Admin xem được)

---

## Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo máy tính đã cài đặt:

- **Node.js** >= 18.x — [Tải tại đây](https://nodejs.org/)
- **npm** >= 9.x (đi kèm Node.js)
- **Microsoft SQL Server** (2019 trở lên khuyến nghị) — [Tải SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- **SQL Server Management Studio (SSMS)** (tuỳ chọn, để quản lý DB bằng giao diện) — [Tải SSMS](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)
- **Git** — [Tải tại đây](https://git-scm.com/)

---

## Hướng dẫn cài đặt & chạy

### Bước 1: Clone dự án

```bash
git clone <repository-url>
cd NMCNPM
```

### Bước 2: Tạo Database

#### Cách 1: Dùng SSMS (giao diện)
1. Mở **SQL Server Management Studio**
2. Kết nối đến SQL Server instance (thường là `localhost` hoặc `localhost\SQLEXPRESS`)
3. Mở file `database/schema.sql`
4. Nhấn **Execute (F5)** để chạy — script sẽ tự tạo database `ParkingManagement` và các bảng

#### Cách 2: Dùng command line (sqlcmd)
```bash
sqlcmd -S localhost -U sa -P <mật_khẩu_sa> -i database/schema.sql
```
> Thay `localhost` bằng tên SQL Server instance nếu khác (ví dụ: `localhost\SQLEXPRESS`)

### Bước 3: Cài đặt Backend

```bash
cd backend
npm install
```

#### Tạo file `.env`

Tạo file `backend/.env` với nội dung sau:

```env
# Port server (mặc định 5000)
PORT=5000

# JWT Secret - thay bằng chuỗi bí mật của riêng bạn
JWT_SECRET=your-secret-key-change-me

# Thời gian hết hạn token
JWT_EXPIRES_IN=24h

# Chuỗi kết nối SQL Server (Prisma)
# Format: sqlserver://HOST:PORT;database=DATABASE;user=USER;password=PASSWORD;encrypt=false;trustServerCertificate=true
DATABASE_URL="sqlserver://localhost:1433;database=ParkingManagement;user=sa;password=your_password;encrypt=false;trustServerCertificate=true"
```

> **Quan trọng:** Thay các giá trị sau cho phù hợp với SQL Server của bạn:
> - `localhost:1433` → địa chỉ và port SQL Server
> - `sa` → tên user SQL Server
> - `your_password` → mật khẩu SQL Server
> - Nếu dùng **SQL Server Express**, chuỗi kết nối có thể là:
>   ```
>   DATABASE_URL="sqlserver://localhost\SQLEXPRESS;database=ParkingManagement;user=sa;password=your_password;encrypt=false;trustServerCertificate=true"
>   ```
> - Nếu dùng **Windows Authentication**, chuỗi kết nối là:
>   ```
>   DATABASE_URL="sqlserver://localhost;database=ParkingManagement;integratedSecurity=true;trustServerCertificate=true"
>   ```

#### Đồng bộ Prisma với Database

```bash
# Tạo Prisma Client từ schema
npx prisma generate

# Đồng bộ schema với database (nếu dùng Prisma migration)
npx prisma migrate dev
```

#### Tạo dữ liệu mẫu (Seed)

```bash
npm run prisma:seed
```

Lệnh này sẽ tạo sẵn:
- **Tài khoản admin** (username: `admin`, password: `admin123`)
- **4 loại xe:** Xe máy, Ô tô con, Ô tô lớn, Xe đạp (kèm biểu phí)
- **4 khu vực đỗ:** Khu A (50 chỗ), Khu B (30 chỗ), Khu C (20 chỗ), Khu D VIP (10 chỗ)
- **110 chỗ đỗ xe** (A01–A50, B01–B30, C01–C20, D01–D10)
- **7 gói dịch vụ:** Vé tháng/quý/năm cho xe máy, ô tô con, ô tô lớn

#### Chạy Backend

```bash
npm run dev
```

Server sẽ chạy tại: **http://localhost:5000**

Kiểm tra bằng cách truy cập http://localhost:5000 — nếu thấy `{"message":"Parking Management API"}` là thành công.

### Bước 4: Cài đặt & chạy Frontend

Mở terminal mới:

```bash
cd frontend
npm install
npm start
```

Ứng dụng sẽ mở tự động tại: **http://localhost:3000**

### Bước 5: Đăng nhập

Truy cập http://localhost:3000 và đăng nhập với:

| Trường       | Giá trị      |
| ------------ | ------------ |
| **Username** | `admin`      |
| **Password** | `admin123`   |

---

## Các lệnh hữu ích

### Backend

| Lệnh                        | Mô tả                                    |
| ---------------------------- | ----------------------------------------- |
| `npm run dev`                | Chạy server ở chế độ development (tự reload) |
| `npm run build`              | Build TypeScript sang JavaScript          |
| `npm start`                  | Chạy server từ bản build (production)     |
| `npm run prisma:generate`    | Tạo lại Prisma Client                    |
| `npm run prisma:migrate`     | Chạy database migration                  |
| `npm run prisma:studio`      | Mở Prisma Studio (xem/sửa DB qua trình duyệt) |
| `npm run prisma:seed`        | Tạo dữ liệu mẫu                         |

### Frontend

| Lệnh              | Mô tả                              |
| ------------------ | ----------------------------------- |
| `npm start`        | Chạy ứng dụng ở chế độ development |
| `npm run build`    | Build ứng dụng cho production       |

---

## Cấu trúc dự án

```
├── backend/                        # Backend API (TypeScript + Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma           # Định nghĩa database schema
│   │   ├── seed.ts                 # Dữ liệu mẫu
│   │   └── migrations/             # Lịch sử migration
│   ├── src/
│   │   ├── server.ts               # Entry point
│   │   ├── config/                 # Cấu hình (env, prisma client)
│   │   ├── controllers/            # Xử lý request/response
│   │   ├── services/               # Business logic
│   │   ├── routes/                 # Định nghĩa API routes
│   │   ├── middlewares/            # Auth, validation, activity logger
│   │   └── validators/            # Validate input (Zod)
│   ├── package.json
│   └── .env                        # Biến môi trường (tự tạo)
│
├── frontend/                       # Frontend (React + TypeScript + Ant Design)
│   ├── public/                     # Static files
│   ├── src/
│   │   ├── App.tsx                 # Routing & theme config
│   │   ├── api/axios.ts            # HTTP client (base URL: localhost:5000/api)
│   │   ├── context/AuthContext.tsx  # Quản lý auth state
│   │   ├── components/Layout/      # Layout chung
│   │   ├── pages/                  # Các trang chức năng
│   │   └── types/                  # TypeScript types
│   └── package.json
│
├── database/
│   └── schema.sql                  # Script tạo database SQL Server
│
└── README.md
```

---

## Xử lý sự cố

### Backend không kết nối được SQL Server
- Kiểm tra SQL Server đang chạy (Services → SQL Server)
- Kiểm tra port 1433 đã mở (SQL Server Configuration Manager → TCP/IP → Enabled)
- Kiểm tra thông tin `DATABASE_URL` trong file `.env` đúng chưa
- Nếu dùng SQL Server Express, đảm bảo SQL Server Browser service đang chạy

### Lỗi Prisma migrate
- Đảm bảo database `ParkingManagement` đã tồn tại (chạy `schema.sql` trước)
- Thử chạy `npx prisma db push` thay cho `npx prisma migrate dev`

### Frontend không gọi được API
- Kiểm tra backend đang chạy tại port 5000
- Kiểm tra không có firewall chặn port 5000
- Mở Console trình duyệt (F12) xem lỗi chi tiết

### Lỗi khi npm install
- Xóa `node_modules` và `package-lock.json`, chạy lại `npm install`
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

---

## Tài khoản mặc định

| Vai trò   | Username | Password   |
| --------- | -------- | ---------- |
| **Admin** | `admin`  | `admin123` |

> Tài khoản được tạo tự động khi chạy lệnh `npm run prisma:seed`

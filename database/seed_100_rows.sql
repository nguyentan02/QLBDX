-- =============================================
-- SEED ~100 ROWS FOR EACH TABLE (SQL Server)
-- Run after schema.sql
-- =============================================

SET NOCOUNT ON;

DECLARE @RunTag NVARCHAR(30) = REPLACE(REPLACE(REPLACE(REPLACE(CONVERT(NVARCHAR(23), GETDATE(), 121), '-', ''), ':', ''), ' ', ''), '.', '');
DECLARE @i INT;

DECLARE @baseUserId INT;
DECLARE @baseCustomerId INT;
DECLARE @baseVehicleTypeId INT;
DECLARE @baseZoneId INT;
DECLARE @baseSpotId INT;
DECLARE @baseVehicleId INT;
DECLARE @basePackageId INT;
DECLARE @baseCustomerPackageId INT;
DECLARE @baseParkingRecordId INT;

-- 1) Users
SET @baseUserId = ISNULL((SELECT MAX(Id) FROM Users), 0);
SET @i = 1;
WHILE @i <= 100
BEGIN
    INSERT INTO Users (Username, PasswordHash, FullName, Email, Phone, Role, IsActive)
    VALUES (
        CONCAT('seed_u_', @RunTag, '_', RIGHT('0000' + CAST(@i AS VARCHAR(4)), 4)),
        '$2a$10$Bs05VT1LKEsgQITT8qC2aejWgOckfkD9MfgDMtv5eIheiH2.Gm1j6',
        CONCAT(N'Nhân viên seed ', @i),
        CONCAT('seed_user_', @RunTag, '_', @i, '@parking.local'),
        CONCAT('09', RIGHT('00000000' + CAST(100000 + @i AS VARCHAR(8)), 8)),
        CASE WHEN @i % 20 = 0 THEN 'admin' ELSE 'staff' END,
        CASE WHEN @i % 15 = 0 THEN 0 ELSE 1 END
    );

    SET @i = @i + 1;
END;

-- 2) Customers
SET @baseCustomerId = ISNULL((SELECT MAX(Id) FROM Customers), 0);
SET @i = 1;
WHILE @i <= 100
BEGIN
    INSERT INTO Customers (FullName, Phone, Email, Address, IdentityCard, IsActive)
    VALUES (
        CONCAT(N'Khách hàng ', @i),
        CONCAT('08', RIGHT('00000000' + CAST(200000 + @i AS VARCHAR(8)), 8)),
        CONCAT('customer_', @RunTag, '_', @i, '@mail.local'),
        CONCAT(N'Số ', @i, N' Đường Seed, Quận ', ((@i - 1) % 12) + 1),
        CONCAT('ID', RIGHT('0000000000' + CAST(300000 + @i AS VARCHAR(10)), 10)),
        CASE WHEN @i % 12 = 0 THEN 0 ELSE 1 END
    );

    SET @i = @i + 1;
END;

-- 3) VehicleTypes
SET @baseVehicleTypeId = ISNULL((SELECT MAX(Id) FROM VehicleTypes), 0);
SET @i = 1;
WHILE @i <= 100
BEGIN
    INSERT INTO VehicleTypes (Name, Description, HourlyRate, DailyRate, MonthlyRate)
    VALUES (
        CONCAT(N'Loại xe seed ', @i),
        CONCAT(N'Loại phương tiện test số ', @i),
        3000 + (@i * 100),
        20000 + (@i * 1000),
        300000 + (@i * 10000)
    );

    SET @i = @i + 1;
END;

-- 4) ParkingZones
SET @baseZoneId = ISNULL((SELECT MAX(Id) FROM ParkingZones), 0);
SET @i = 1;
WHILE @i <= 100
BEGIN
    INSERT INTO ParkingZones (Name, Description, TotalSpots)
    VALUES (
        CONCAT(N'Khu seed ', @i),
        CONCAT(N'Khu vực kiểm thử ', @i),
        40 + (@i % 60)
    );

    SET @i = @i + 1;
END;

-- 5) ParkingSpots (1 spot for each new zone)
SET @baseSpotId = ISNULL((SELECT MAX(Id) FROM ParkingSpots), 0);
SET @i = 1;
WHILE @i <= 100
BEGIN
    INSERT INTO ParkingSpots (ZoneId, SpotNumber, SpotType, Status)
    VALUES (
        @baseZoneId + @i,
        CONCAT('S', RIGHT('000' + CAST(@i AS VARCHAR(3)), 3)),
        CASE WHEN @i % 15 = 0 THEN 'disabled' WHEN @i % 10 = 0 THEN 'vip' ELSE 'standard' END,
        CASE WHEN @i % 13 = 0 THEN 'maintenance' WHEN @i % 4 = 0 THEN 'occupied' ELSE 'available' END
    );

    SET @i = @i + 1;
END;

-- 6) Vehicles
SET @baseVehicleId = ISNULL((SELECT MAX(Id) FROM Vehicles), 0);
SET @i = 1;
WHILE @i <= 100
BEGIN
    INSERT INTO Vehicles (CustomerId, VehicleTypeId, LicensePlate, Brand, Model, Color)
    VALUES (
        @baseCustomerId + @i,
        @baseVehicleTypeId + @i,
        CONCAT('3', RIGHT(@RunTag, 2), 'A', RIGHT('00000' + CAST(@i AS VARCHAR(5)), 5)),
        CONCAT(N'Brand ', ((@i - 1) % 10) + 1),
        CONCAT(N'Model ', ((@i - 1) % 20) + 1),
        CASE (@i % 6)
            WHEN 0 THEN N'Đen'
            WHEN 1 THEN N'Trắng'
            WHEN 2 THEN N'Đỏ'
            WHEN 3 THEN N'Xanh'
            WHEN 4 THEN N'Bạc'
            ELSE N'Vàng'
        END
    );

    SET @i = @i + 1;
END;

-- 7) ParkingPackages
SET @basePackageId = ISNULL((SELECT MAX(Id) FROM ParkingPackages), 0);
SET @i = 1;
WHILE @i <= 100
BEGIN
    INSERT INTO ParkingPackages (Name, VehicleTypeId, DurationDays, Price, Description, IsActive)
    VALUES (
        CONCAT(N'Gói seed ', @i),
        @baseVehicleTypeId + @i,
        CASE (@i % 4)
            WHEN 0 THEN 30
            WHEN 1 THEN 60
            WHEN 2 THEN 90
            ELSE 365
        END,
        150000 + (@i * 25000),
        CONCAT(N'Gói dịch vụ seed số ', @i),
        CASE WHEN @i % 11 = 0 THEN 0 ELSE 1 END
    );

    SET @i = @i + 1;
END;

-- 8) CustomerPackages
SET @baseCustomerPackageId = ISNULL((SELECT MAX(Id) FROM CustomerPackages), 0);
SET @i = 1;
WHILE @i <= 100
BEGIN
    DECLARE @cpPackageId INT = @basePackageId + @i;
    DECLARE @cpDuration INT;

    IF EXISTS (SELECT 1 FROM ParkingPackages WHERE Id = @cpPackageId)
    BEGIN
        SELECT @cpDuration = DurationDays
        FROM ParkingPackages
        WHERE Id = @cpPackageId;
    END
    ELSE
    BEGIN
        SELECT TOP 1
            @cpPackageId = Id,
            @cpDuration = DurationDays
        FROM ParkingPackages
        ORDER BY Id DESC;
    END;

    SET @cpDuration = ISNULL(@cpDuration, 30);
    DECLARE @cpStartDate DATE = DATEADD(DAY, -(@i % 160), CAST(GETDATE() AS DATE));
    DECLARE @cpEndDate DATE = DATEADD(DAY, @cpDuration, @cpStartDate);

    INSERT INTO CustomerPackages (CustomerId, PackageId, VehicleId, StartDate, EndDate, Status)
    VALUES (
        @baseCustomerId + @i,
        @cpPackageId,
        @baseVehicleId + @i,
        @cpStartDate,
        @cpEndDate,
        CASE
            WHEN @i % 14 = 0 THEN 'cancelled'
            WHEN @cpEndDate < CAST(GETDATE() AS DATE) THEN 'expired'
            ELSE 'active'
        END
    );

    SET @i = @i + 1;
END;

-- 9) ParkingRecords
SET @baseParkingRecordId = ISNULL((SELECT MAX(Id) FROM ParkingRecords), 0);
SET @i = 1;
WHILE @i <= 100
BEGIN
    DECLARE @prVehicleId INT = @baseVehicleId + @i;
    DECLARE @prVehicleTypeId INT = (SELECT VehicleTypeId FROM Vehicles WHERE Id = @prVehicleId);
    DECLARE @prEntry DATETIME = DATEADD(HOUR, -(@i * 3), GETDATE());
    DECLARE @prExit DATETIME = CASE WHEN @i % 4 = 0 THEN NULL ELSE DATEADD(MINUTE, 30 + (@i % 180), @prEntry) END;
    DECLARE @prDuration INT = CASE WHEN @prExit IS NULL THEN NULL ELSE DATEDIFF(MINUTE, @prEntry, @prExit) END;
    DECLARE @prFee DECIMAL(10,2) = CASE WHEN @prDuration IS NULL THEN NULL ELSE CAST((@prDuration / 60.0) * (3000 + (@i * 100)) AS DECIMAL(10,2)) END;

    INSERT INTO ParkingRecords (
        VehicleId,
        LicensePlate,
        VehicleTypeId,
        ParkingSpotId,
        EntryTime,
        ExitTime,
        Duration,
        Fee,
        Status,
        Notes,
        CreatedBy
    )
    SELECT
        @prVehicleId,
        v.LicensePlate,
        @prVehicleTypeId,
        @baseSpotId + @i,
        @prEntry,
        @prExit,
        @prDuration,
        @prFee,
        CASE WHEN @prExit IS NULL THEN 'parked' ELSE 'completed' END,
        CONCAT(N'Bản ghi seed ', @i),
        @baseUserId + ((@i - 1) % 100) + 1
    FROM Vehicles v
    WHERE v.Id = @prVehicleId;

    SET @i = @i + 1;
END;

-- 10) Payments
SET @i = 1;
WHILE @i <= 100
BEGIN
    DECLARE @paymentUserId INT = @baseUserId + ((@i - 1) % 100) + 1;

    IF (@i % 2 = 1)
    BEGIN
        DECLARE @payRecordId INT = @baseParkingRecordId + @i;
        DECLARE @payAmountParking DECIMAL(10,2) = ISNULL((SELECT Fee FROM ParkingRecords WHERE Id = @payRecordId), 50000);

        INSERT INTO Payments (ParkingRecordId, CustomerPackageId, Amount, PaymentMethod, PaymentType, Status, CreatedBy, Notes)
        VALUES (
            @payRecordId,
            NULL,
            @payAmountParking,
            CASE (@i % 3) WHEN 0 THEN 'transfer' WHEN 1 THEN 'cash' ELSE 'card' END,
            'parking',
            'completed',
            @paymentUserId,
            CONCAT(N'Thanh toán gửi lượt seed ', @i)
        );
    END
    ELSE
    BEGIN
        DECLARE @payCustomerPackageId INT = @baseCustomerPackageId + @i;
        DECLARE @payAmountPackage DECIMAL(10,2) = ISNULL((
            SELECT pp.Price
            FROM CustomerPackages cp
            JOIN ParkingPackages pp ON pp.Id = cp.PackageId
            WHERE cp.Id = @payCustomerPackageId
        ), 200000);

        INSERT INTO Payments (ParkingRecordId, CustomerPackageId, Amount, PaymentMethod, PaymentType, Status, CreatedBy, Notes)
        VALUES (
            NULL,
            @payCustomerPackageId,
            @payAmountPackage,
            CASE (@i % 3) WHEN 0 THEN 'transfer' WHEN 1 THEN 'cash' ELSE 'card' END,
            'package',
            CASE WHEN @i % 10 = 0 THEN 'pending' ELSE 'completed' END,
            @paymentUserId,
            CONCAT(N'Thanh toán gói seed ', @i)
        );
    END;

    SET @i = @i + 1;
END;

-- 11) UserActivityLogs
SET @i = 1;
WHILE @i <= 100
BEGIN
    DECLARE @logUserId INT = CASE WHEN @i % 12 = 0 THEN NULL ELSE @baseUserId + ((@i - 1) % 100) + 1 END;
    DECLARE @logUsername NVARCHAR(50) = ISNULL((SELECT Username FROM Users WHERE Id = @logUserId), CONCAT('guest_seed_', @i));

    INSERT INTO UserActivityLogs (UserId, Username, Action, Entity, EntityId, Details, IpAddress, StatusCode)
    VALUES (
        @logUserId,
        @logUsername,
        CASE (@i % 6)
            WHEN 0 THEN 'LOGIN'
            WHEN 1 THEN 'CREATE'
            WHEN 2 THEN 'UPDATE'
            WHEN 3 THEN 'DELETE'
            WHEN 4 THEN 'LOGOUT'
            ELSE 'LOGIN_FAILED'
        END,
        CASE (@i % 6)
            WHEN 0 THEN 'Auth'
            WHEN 1 THEN 'Customers'
            WHEN 2 THEN 'Vehicles'
            WHEN 3 THEN 'ParkingRecords'
            WHEN 4 THEN 'Payments'
            ELSE 'Users'
        END,
        @i,
        CONCAT(N'{"seed":true,"index":', @i, '}'),
        CONCAT('192.168.1.', (@i % 254) + 1),
        CASE WHEN @i % 6 = 5 THEN 401 ELSE 200 END
    );

    SET @i = @i + 1;
END;

PRINT 'Seed script completed: inserted ~100 rows for each table.';

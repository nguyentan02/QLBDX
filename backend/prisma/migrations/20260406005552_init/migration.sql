BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Username] NVARCHAR(50) NOT NULL,
    [PasswordHash] NVARCHAR(255) NOT NULL,
    [FullName] NVARCHAR(100) NOT NULL,
    [Email] NVARCHAR(100),
    [Phone] NVARCHAR(20),
    [Role] NVARCHAR(20) NOT NULL CONSTRAINT [Users_Role_df] DEFAULT 'staff',
    [IsActive] BIT NOT NULL CONSTRAINT [Users_IsActive_df] DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [Users_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [UpdatedAt] DATETIME2 NOT NULL CONSTRAINT [Users_UpdatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [Users_Username_key] UNIQUE NONCLUSTERED ([Username])
);

-- CreateTable
CREATE TABLE [dbo].[Customers] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [FullName] NVARCHAR(100) NOT NULL,
    [Phone] NVARCHAR(20) NOT NULL,
    [Email] NVARCHAR(100),
    [Address] NVARCHAR(255),
    [IdentityCard] NVARCHAR(20),
    [IsActive] BIT NOT NULL CONSTRAINT [Customers_IsActive_df] DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [Customers_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [UpdatedAt] DATETIME2 NOT NULL CONSTRAINT [Customers_UpdatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Customers_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[VehicleTypes] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Name] NVARCHAR(50) NOT NULL,
    [Description] NVARCHAR(200),
    [HourlyRate] DECIMAL(10,2) NOT NULL,
    [DailyRate] DECIMAL(10,2) NOT NULL,
    [MonthlyRate] DECIMAL(10,2) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [VehicleTypes_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [VehicleTypes_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[Vehicles] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [CustomerId] INT NOT NULL,
    [VehicleTypeId] INT NOT NULL,
    [LicensePlate] NVARCHAR(20) NOT NULL,
    [Brand] NVARCHAR(50),
    [Model] NVARCHAR(50),
    [Color] NVARCHAR(30),
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [Vehicles_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [UpdatedAt] DATETIME2 NOT NULL CONSTRAINT [Vehicles_UpdatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Vehicles_pkey] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [Vehicles_LicensePlate_key] UNIQUE NONCLUSTERED ([LicensePlate])
);

-- CreateTable
CREATE TABLE [dbo].[ParkingZones] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Name] NVARCHAR(50) NOT NULL,
    [Description] NVARCHAR(200),
    [TotalSpots] INT NOT NULL CONSTRAINT [ParkingZones_TotalSpots_df] DEFAULT 0,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [ParkingZones_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ParkingZones_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[ParkingSpots] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [ZoneId] INT NOT NULL,
    [SpotNumber] NVARCHAR(10) NOT NULL,
    [SpotType] NVARCHAR(20) NOT NULL CONSTRAINT [ParkingSpots_SpotType_df] DEFAULT 'standard',
    [Status] NVARCHAR(20) NOT NULL CONSTRAINT [ParkingSpots_Status_df] DEFAULT 'available',
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [ParkingSpots_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ParkingSpots_pkey] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [ParkingSpots_ZoneId_SpotNumber_key] UNIQUE NONCLUSTERED ([ZoneId],[SpotNumber])
);

-- CreateTable
CREATE TABLE [dbo].[ParkingPackages] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Name] NVARCHAR(100) NOT NULL,
    [VehicleTypeId] INT NOT NULL,
    [DurationDays] INT NOT NULL,
    [Price] DECIMAL(10,2) NOT NULL,
    [Description] NVARCHAR(500),
    [IsActive] BIT NOT NULL CONSTRAINT [ParkingPackages_IsActive_df] DEFAULT 1,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [ParkingPackages_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ParkingPackages_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[CustomerPackages] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [CustomerId] INT NOT NULL,
    [PackageId] INT NOT NULL,
    [VehicleId] INT NOT NULL,
    [StartDate] DATE NOT NULL,
    [EndDate] DATE NOT NULL,
    [Status] NVARCHAR(20) NOT NULL CONSTRAINT [CustomerPackages_Status_df] DEFAULT 'active',
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [CustomerPackages_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [CustomerPackages_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[ParkingRecords] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [VehicleId] INT,
    [LicensePlate] NVARCHAR(20) NOT NULL,
    [VehicleTypeId] INT NOT NULL,
    [ParkingSpotId] INT,
    [EntryTime] DATETIME2 NOT NULL CONSTRAINT [ParkingRecords_EntryTime_df] DEFAULT CURRENT_TIMESTAMP,
    [ExitTime] DATETIME2,
    [Duration] INT,
    [Fee] DECIMAL(10,2),
    [Status] NVARCHAR(20) NOT NULL CONSTRAINT [ParkingRecords_Status_df] DEFAULT 'parked',
    [Notes] NVARCHAR(500),
    [CreatedBy] INT,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [ParkingRecords_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ParkingRecords_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[Payments] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [ParkingRecordId] INT,
    [CustomerPackageId] INT,
    [Amount] DECIMAL(10,2) NOT NULL,
    [PaymentMethod] NVARCHAR(30) NOT NULL CONSTRAINT [Payments_PaymentMethod_df] DEFAULT 'cash',
    [PaymentType] NVARCHAR(30) NOT NULL CONSTRAINT [Payments_PaymentType_df] DEFAULT 'parking',
    [Status] NVARCHAR(20) NOT NULL CONSTRAINT [Payments_Status_df] DEFAULT 'completed',
    [PaidAt] DATETIME2 NOT NULL CONSTRAINT [Payments_PaidAt_df] DEFAULT CURRENT_TIMESTAMP,
    [CreatedBy] INT,
    [Notes] NVARCHAR(500),
    CONSTRAINT [Payments_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Vehicles] ADD CONSTRAINT [Vehicles_CustomerId_fkey] FOREIGN KEY ([CustomerId]) REFERENCES [dbo].[Customers]([Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Vehicles] ADD CONSTRAINT [Vehicles_VehicleTypeId_fkey] FOREIGN KEY ([VehicleTypeId]) REFERENCES [dbo].[VehicleTypes]([Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ParkingSpots] ADD CONSTRAINT [ParkingSpots_ZoneId_fkey] FOREIGN KEY ([ZoneId]) REFERENCES [dbo].[ParkingZones]([Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ParkingPackages] ADD CONSTRAINT [ParkingPackages_VehicleTypeId_fkey] FOREIGN KEY ([VehicleTypeId]) REFERENCES [dbo].[VehicleTypes]([Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CustomerPackages] ADD CONSTRAINT [CustomerPackages_CustomerId_fkey] FOREIGN KEY ([CustomerId]) REFERENCES [dbo].[Customers]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CustomerPackages] ADD CONSTRAINT [CustomerPackages_PackageId_fkey] FOREIGN KEY ([PackageId]) REFERENCES [dbo].[ParkingPackages]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CustomerPackages] ADD CONSTRAINT [CustomerPackages_VehicleId_fkey] FOREIGN KEY ([VehicleId]) REFERENCES [dbo].[Vehicles]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ParkingRecords] ADD CONSTRAINT [ParkingRecords_VehicleId_fkey] FOREIGN KEY ([VehicleId]) REFERENCES [dbo].[Vehicles]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ParkingRecords] ADD CONSTRAINT [ParkingRecords_VehicleTypeId_fkey] FOREIGN KEY ([VehicleTypeId]) REFERENCES [dbo].[VehicleTypes]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ParkingRecords] ADD CONSTRAINT [ParkingRecords_ParkingSpotId_fkey] FOREIGN KEY ([ParkingSpotId]) REFERENCES [dbo].[ParkingSpots]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ParkingRecords] ADD CONSTRAINT [ParkingRecords_CreatedBy_fkey] FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[Users]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Payments] ADD CONSTRAINT [Payments_ParkingRecordId_fkey] FOREIGN KEY ([ParkingRecordId]) REFERENCES [dbo].[ParkingRecords]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Payments] ADD CONSTRAINT [Payments_CustomerPackageId_fkey] FOREIGN KEY ([CustomerPackageId]) REFERENCES [dbo].[CustomerPackages]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Payments] ADD CONSTRAINT [Payments_CreatedBy_fkey] FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[Users]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

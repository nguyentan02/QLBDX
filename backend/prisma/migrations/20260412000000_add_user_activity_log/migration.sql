BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[UserActivityLogs] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [UserId] INT,
    [Username] NVARCHAR(50) NOT NULL,
    [Action] NVARCHAR(30) NOT NULL,
    [Entity] NVARCHAR(50),
    [EntityId] INT,
    [Details] NVARCHAR(1000),
    [IpAddress] NVARCHAR(50),
    [StatusCode] INT,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [UserActivityLogs_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [UserActivityLogs_pkey] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [UserActivityLogs_UserId_fkey] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

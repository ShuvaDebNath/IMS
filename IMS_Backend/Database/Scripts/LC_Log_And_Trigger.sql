/*
    LC Audit Log — table + trigger for tbl_lc
    Run once against the IMS database.
    Does NOT modify any existing triggers.
*/

IF OBJECT_ID(N'dbo.LC_Log', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[LC_Log]
    (
        [LogId]       BIGINT         IDENTITY(1,1) NOT NULL,
        [LC_ID]       BIGINT         NOT NULL,
        [ActionType]  NVARCHAR(20)   NOT NULL,          -- CREATE | UPDATE
        [OldDataJson] NVARCHAR(MAX)  NULL,
        [NewDataJson] NVARCHAR(MAX)  NOT NULL,
        [ChangedBy]   BIGINT         NULL,
        [ChangedAt]   DATETIME       NOT NULL CONSTRAINT DF_LC_Log_ChangedAt DEFAULT (GETDATE()),
        [IPAddress]   NVARCHAR(50)   NULL,
        [UserAgent]   NVARCHAR(500)  NULL,
        CONSTRAINT [PK_LC_Log] PRIMARY KEY CLUSTERED ([LogId] ASC)
    );

    CREATE NONCLUSTERED INDEX [IX_LC_Log_LC_ID_ChangedAt]
        ON [dbo].[LC_Log] ([LC_ID] ASC, [ChangedAt] ASC);
END
GO

IF OBJECT_ID(N'dbo.trg_tbl_lc_AuditLog', N'TR') IS NOT NULL
    DROP TRIGGER [dbo].[trg_tbl_lc_AuditLog];
GO

CREATE TRIGGER [dbo].[trg_tbl_lc_AuditLog]
ON [dbo].[tbl_lc]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    /* ── INSERT ─────────────────────────────────────────────────────── */
    INSERT INTO [dbo].[LC_Log]
        ([LC_ID], [ActionType], [OldDataJson], [NewDataJson], [ChangedBy], [ChangedAt])
    SELECT
        i.[LC_ID],
        N'CREATE',
        NULL,
        (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
        TRY_CAST(i.[User_ID] AS BIGINT),
        GETDATE()
    FROM inserted i
    WHERE NOT EXISTS (SELECT 1 FROM deleted);

    /* ── UPDATE ─────────────────────────────────────────────────────── */
    INSERT INTO [dbo].[LC_Log]
        ([LC_ID], [ActionType], [OldDataJson], [NewDataJson], [ChangedBy], [ChangedAt])
    SELECT
        i.[LC_ID],
        N'UPDATE',
        (SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
        (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
        TRY_CAST(i.[User_ID] AS BIGINT),
        GETDATE()
    FROM inserted i
    INNER JOIN deleted d ON d.[LC_ID] = i.[LC_ID];
END
GO

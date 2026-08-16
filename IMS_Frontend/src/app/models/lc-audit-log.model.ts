export interface LcAuditLogEntry {
  eventType: string;
  columnName: string;
  originalValue: string;
  newValue: string;
  changedBy: string;
  changedDate: string | Date;
}

export interface LcAuditLogResponse {
  lcNo: string;
  consigneeName: string;
  logs: LcAuditLogEntry[];
}

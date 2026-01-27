export interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errorDetails: string[];
}

export interface ErrorResponse {
  error: string;
}

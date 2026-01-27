package dev.virtuoso.ims.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ImportResult {
    private int totalRows;      // Tổng số dòng đã đọc (User + Phân quyền)
    private int successCount;   // Số user được lưu thành công
    private int errorCount;     // Số dòng bị lỗi
    private List<String> errorDetails; // Danh sách chi tiết lỗi: "Sheet 1 Dòng 5: Email sai"
    private String message;
}
package dev.virtuoso.ims.util;

import org.apache.poi.ss.usermodel.*;
import org.apache.commons.lang3.StringUtils;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;

public class ExcelUtils {

    private static final DataFormatter DATA_FORMATTER = new DataFormatter();
    public static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // Lấy giá trị chuỗi từ Cell, tự động trim, xử lý null
    public static String getCellValue(Row row, int index) {
        if (row == null) return "";
        Cell cell = row.getCell(index);
        if (cell == null) return "";

        // Dùng DataFormatter để lấy giá trị hiển thị (String) của mọi loại cell (số, text, formula)
        return DATA_FORMATTER.formatCellValue(cell).trim();
    }

    // Lấy giá trị Date từ Cell (Xử lý cả trường hợp nhập text hoặc nhập date chuẩn Excel)
    public static LocalDate getDateCellValue(Row row, int index) {
        if (row == null) return null;
        Cell cell = row.getCell(index);
        if (cell == null || StringUtils.isBlank(cell.toString())) return null;

        try {
            // Trường hợp 1: Cell định dạng là Date/Numeric
            if (DateUtil.isCellDateFormatted(cell)) {
                Date date = cell.getDateCellValue();
                return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            }

            // Trường hợp 2: Cell nhập Text "01/01/2000"
            String dateStr = DATA_FORMATTER.formatCellValue(cell).trim();
            if (StringUtils.isNotBlank(dateStr)) {
                return LocalDate.parse(dateStr, DATE_FORMATTER);
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Sai định dạng ngày tháng (dd/MM/yyyy)");
        }
        return null;
    }

    // Kiểm tra dòng trống
    public static boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK && StringUtils.isNotBlank(cell.toString())) {
                return false;
            }
        }
        return true;
    }
}
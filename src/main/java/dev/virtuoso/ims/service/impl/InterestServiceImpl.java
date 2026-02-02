package dev.virtuoso.ims.service.impl;

import dev.virtuoso.ims.dto.request.TemplateRequest;
import dev.virtuoso.ims.entity.interest.LoanInterestParam;
import dev.virtuoso.ims.entity.interest.LoanInterestParamType;
import dev.virtuoso.ims.repository.interest.LoanInterestParamRepository;
import dev.virtuoso.ims.repository.interest.LoanInterestParamTypeRepository;
import dev.virtuoso.ims.service.InterestService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class InterestServiceImpl implements InterestService {

    @Autowired
    private LoanInterestParamTypeRepository typeRepo;

    @Autowired
    private LoanInterestParamRepository paramRepo;

    @Override
    public ByteArrayInputStream generateInterestTemplate(TemplateRequest request) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // 1. Tạo 2 Sheet: Một hiện (nhập liệu), Một ẩn (chứa data drop-down)
            Sheet mainSheet = workbook.createSheet("Import Template");
            String hiddenSheetName = "HiddenData";
            Sheet hiddenSheet = workbook.createSheet(hiddenSheetName);

            // Style cho Header (In đậm)
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            Row headerRow = mainSheet.createRow(0);

            int colIndex = 0;
            // Duyệt qua danh sách ID các cột người dùng chọn
            for (Integer typeId : request.getParamTypeIds()) {
                LoanInterestParamType paramType = typeRepo.findById(typeId).orElse(null);
                if (paramType == null) continue;

                // A. Tạo Header trên Main Sheet
                Cell cell = headerRow.createCell(colIndex);
                cell.setCellValue(paramType.getName());
                cell.setCellStyle(headerStyle);
                mainSheet.setColumnWidth(colIndex, 6000); // Độ rộng cột

                // B. Lấy dữ liệu từ DB
                List<LoanInterestParam> params = paramRepo.findByTypeIdAndStatus(typeId, "ACTIVE");

                if (!params.isEmpty()) {
                    // C. Đổ dữ liệu vào Hidden Sheet (Mỗi loại tham số 1 cột)
                    for (int i = 0; i < params.size(); i++) {
                        Row row = hiddenSheet.getRow(i);
                        if (row == null) row = hiddenSheet.createRow(i);
                        row.createCell(colIndex).setCellValue(params.get(i).getValue());
                    }

                    // D. Tạo công thức tham chiếu trực tiếp (CÁCH 1)
                    // Cú pháp: 'HiddenData'!$A$1:$A$5
                    String colLetter = getExcelColumnName(colIndex + 1);
                    int lastRow = params.size();

                    // Lưu ý: Tên sheet nên để trong dấu nháy đơn '' phòng trường hợp có khoảng trắng
                    String formula = "'" + hiddenSheetName + "'!$" + colLetter + "$1:$" + colLetter + "$" + lastRow;

                    // E. Tạo Data Validation
                    DataValidationHelper validationHelper = mainSheet.getDataValidationHelper();

                    // Áp dụng drop-down từ dòng 2 đến dòng 1000
                    CellRangeAddressList addressList = new CellRangeAddressList(1, 10000, colIndex, colIndex);

                    // Tạo ràng buộc dạng List từ công thức
                    DataValidationConstraint constraint = validationHelper.createFormulaListConstraint(formula);

                    DataValidation validation = validationHelper.createValidation(constraint, addressList);

                    // CẤU HÌNH HIỂN THỊ MŨI TÊN DROPDOWN
                    validation.setSuppressDropDownArrow(true); // false = HIỆN mũi tên (Không ẩn)
                    validation.setShowErrorBox(true);           // Hiển thị lỗi nếu nhập sai

                    mainSheet.addValidationData(validation);
                }

                colIndex++;
            }

            // Ẩn sheet dữ liệu đi để người dùng đỡ rối
            workbook.setSheetHidden(workbook.getSheetIndex(hiddenSheet), true);

            // Set sheet chính là sheet active khi mở file
            workbook.setActiveSheet(workbook.getSheetIndex(mainSheet));

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Lỗi export excel template: " + e.getMessage());
        }
    }

    // Hàm chuyển đổi số thành chữ cái cột Excel (0 -> A, 1 -> B, ...)
    private String getExcelColumnName(int n) {
        StringBuilder result = new StringBuilder();
        while (n > 0) {
            n--;
            result.insert(0, (char) ('A' + n % 26));
            n /= 26;
        }
        return result.toString();
    }
}
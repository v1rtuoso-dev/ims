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

            Sheet mainSheet = workbook.createSheet("Import Template");
            String hiddenSheetName = "HiddenData";
            Sheet hiddenSheet = workbook.createSheet(hiddenSheetName);

            // Style Header
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            Row headerRow = mainSheet.createRow(0);

            int colIndex = 0;

            // --- THAY ĐỔI Ở ĐÂY: Duyệt qua danh sách CODE ---
            for (String code : request.getParamTypeCodes()) {

                // 1. Tìm Type bằng CODE thay vì ID
                LoanInterestParamType paramType = typeRepo.findByCode(code).orElse(null);

                // Nếu code không tồn tại trong DB thì bỏ qua
                if (paramType == null) continue;

                // --- TỪ ĐÂY TRỞ XUỐNG LOGIC GIỮ NGUYÊN ---

                // Tạo Header (Dùng Name lấy được từ DB)
                Cell cell = headerRow.createCell(colIndex);
                cell.setCellValue(paramType.getName());
                cell.setCellStyle(headerStyle);
                mainSheet.setColumnWidth(colIndex, 6000);

                // Lấy values dựa trên ID của Type vừa tìm được
                List<LoanInterestParam> params = paramRepo.findByTypeIdAndStatus(paramType.getId(), "ACTIVE");

                if (!params.isEmpty()) {
                    // Ghi data vào sheet ẩn
                    for (int i = 0; i < params.size(); i++) {
                        Row row = hiddenSheet.getRow(i);
                        if (row == null) row = hiddenSheet.createRow(i);
                        row.createCell(colIndex).setCellValue(params.get(i).getValue());
                    }

                    // Tạo Validation (Cách 1 - Direct Reference)
                    String colLetter = getExcelColumnName(colIndex + 1);
                    String formula = "'" + hiddenSheetName + "'!$" + colLetter + "$1:$" + colLetter + "$" + params.size();

                    DataValidationHelper validationHelper = mainSheet.getDataValidationHelper();
                    CellRangeAddressList addressList = new CellRangeAddressList(1, 1000, colIndex, colIndex);
                    DataValidationConstraint constraint = validationHelper.createFormulaListConstraint(formula);
                    DataValidation validation = validationHelper.createValidation(constraint, addressList);

                    // Cấu hình hiện mũi tên dropdown
                    validation.setSuppressDropDownArrow(true);
                    validation.setShowErrorBox(true);

                    mainSheet.addValidationData(validation);
                }

                colIndex++;
            }

            workbook.setSheetHidden(workbook.getSheetIndex(hiddenSheet), true);
            workbook.setActiveSheet(workbook.getSheetIndex(mainSheet));
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Lỗi export excel: " + e.getMessage());
        }
    }

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
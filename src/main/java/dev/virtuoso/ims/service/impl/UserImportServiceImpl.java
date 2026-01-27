package dev.virtuoso.ims.service.impl;

import dev.virtuoso.ims.repository.UserRoleOfferRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import dev.virtuoso.ims.dto.response.ImportResult;
import dev.virtuoso.ims.entity.RoleOffer;
import dev.virtuoso.ims.entity.UserOffer;
import dev.virtuoso.ims.entity.UserRoleOffer;
import dev.virtuoso.ims.repository.RoleOfferRepository;
import dev.virtuoso.ims.repository.UserOfferRepository;
import dev.virtuoso.ims.util.ExcelUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserImportServiceImpl {

    private final UserOfferRepository userRepository;
    private final RoleOfferRepository roleRepository;

    private static final String EMAIL_REGEX = "^[A-Za-z0-9._]+@msb\\.com\\.vn$";

    public ImportResult uploadUserFile(MultipartFile file) {
        if (!Objects.requireNonNull(file.getOriginalFilename()).endsWith(".xlsx")) {
            throw new IllegalArgumentException("Định dạng file không hợp lệ (.xlsx)");
        }

        List<String> errorDetails = new ArrayList<>();
        List<String> warningDetails = new ArrayList<>(); // Thêm list warning
        List<UserOffer> newUsersToSave = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet userSheet = workbook.getSheet("User");
            Sheet permSheet = workbook.getSheet("Thong_tin_phan_quyen");

            if (userSheet == null || permSheet == null) {
                throw new IllegalArgumentException("File thiếu sheet 'User' hoặc 'Thong_tin_phan_quyen'");
            }

            // --- BƯỚC 1 & 2: CHUẨN BỊ & XỬ LÝ SHEET USER ---
            Map<String, RoleOffer> roleMap = roleRepository.findAll().stream()
                    .collect(Collectors.toMap(r -> r.getRoleName().toUpperCase(), r -> r));

            Set<String> allUsernamesInFile = new HashSet<>();
            for (int i = 3; i <= userSheet.getLastRowNum(); i++) {
                if (!ExcelUtils.isRowEmpty(userSheet.getRow(i))) {
                    allUsernamesInFile.add(ExcelUtils.getCellValue(userSheet.getRow(i), 0));
                }
            }

            Map<String, UserOffer> existingUsersMap = new HashMap<>();
            if (!allUsernamesInFile.isEmpty()) {
                List<UserOffer> existingUsers = userRepository.findByUserNameIn(allUsernamesInFile);
                existingUsersMap = existingUsers.stream()
                        .collect(Collectors.toMap(UserOffer::getUserName, u -> u));
            }

            Map<String, UserOffer> validUserMap = new HashMap<>();

            for (int i = 3; i <= userSheet.getLastRowNum(); i++) {
                Row row = userSheet.getRow(i);
                if (ExcelUtils.isRowEmpty(row)) continue;

                String username = ExcelUtils.getCellValue(row, 0);

                try {
                    if (existingUsersMap.containsKey(username)) {
                        // Thêm vào WARNING thay vì ERROR
                        warningDetails.add("Sheet User - Dòng " + (i + 1) + ": Username '" + username + "' đã tồn tại trên hệ thống (sẽ thêm phân quyền nếu có)");
                        validUserMap.put(username, existingUsersMap.get(username));
                    } else {
                        UserOffer user = parseAndValidateUser(row, existingUsersMap.keySet(), validUserMap);
                        validUserMap.put(user.getUserName(), user);
                        newUsersToSave.add(user);
                    }
                } catch (IllegalArgumentException e) {
                    errorDetails.add("Sheet User - Dòng " + (i + 1) + ": " + e.getMessage());
                } catch (Exception e) {
                    errorDetails.add("Sheet User - Dòng " + (i + 1) + ": Lỗi không xác định - " + e.getMessage());
                }
            }

            // --- BƯỚC 3: XỬ LÝ SHEET PHÂN QUYỀN ---
            for (int i = 3; i <= permSheet.getLastRowNum(); i++) {
                Row row = permSheet.getRow(i);
                if (ExcelUtils.isRowEmpty(row)) continue;

                try {
                    parseAndValidatePermission(row, validUserMap, roleMap);
                } catch (IllegalArgumentException e) {
                    errorDetails.add("Sheet Phân quyền - Dòng " + (i + 1) + ": " + e.getMessage());
                } catch (Exception e) {
                    errorDetails.add("Sheet Phân quyền - Dòng " + (i + 1) + ": Lỗi không xác định - " + e.getMessage());
                }
            }

            // --- BƯỚC 4: LƯU DB ---
            if (!validUserMap.isEmpty()) {
                userRepository.saveAll(validUserMap.values());
            }

            int totalProcessed = validUserMap.size();
            int newUsers = newUsersToSave.size();
            int updatedUsers = totalProcessed - newUsers;

            // Ghép warning và error lại (hoặc tách riêng)
            List<String> allMessages = new ArrayList<>();
            if (!warningDetails.isEmpty()) {
                allMessages.addAll(warningDetails);
            }
            if (!errorDetails.isEmpty()) {
                allMessages.addAll(errorDetails);
            }

            return ImportResult.builder()
                    .totalRows(allUsernamesInFile.size() + (permSheet.getLastRowNum() - 2))
                    .successCount(totalProcessed)
                    .errorCount(errorDetails.size()) // Chỉ tính error thật
                    .errorDetails(allMessages) // Hiển thị cả warning và error
                    .message(String.format("Tạo mới: %d user, Cập nhật phân quyền: %d user, Cảnh báo: %d",
                            newUsers, updatedUsers, warningDetails.size()))
                    .build();

        } catch (Exception e) {
            log.error("Error import file", e);
            throw new RuntimeException("Lỗi xử lý file: " + e.getMessage());
        }
    }


    //update: lưu thông báo lỗi vào list đưa ra 1 lần
    private UserOffer parseAndValidateUser(Row row, Set<String> existingUsernamesDb, Map<String, UserOffer> validUserMap) {
        List<String> rowErrors = new ArrayList<>();

        String username = ExcelUtils.getCellValue(row, 0);
        String email = ExcelUtils.getCellValue(row, 1);
        String fullName = ExcelUtils.getCellValue(row, 2);
        String rawGender = ExcelUtils.getCellValue(row, 4);
        String phone = ExcelUtils.getCellValue(row, 5);
        String department = ExcelUtils.getCellValue(row, 6);

        // 1. Validate Username
        if (StringUtils.isBlank(username)) {
            rowErrors.add("Username trống");
        } else {
            // CHỈ CHECK TRÙNG TRONG FILE
            if (validUserMap.containsKey(username)) {
                rowErrors.add("Username '" + username + "' bị trùng lặp trong file");
            }
            // KHÔNG CHECK existingUsernamesDb nữa (đã check ở uploadUserFile)
        }

        // 2. Validate Email & Match Username
        boolean isEmailValid = true;
        if (StringUtils.isBlank(email)) {
            rowErrors.add("Email trống");
            isEmailValid = false;
        } else if (!email.matches(EMAIL_REGEX)) {
            rowErrors.add("Email sai định dạng (@msb.com.vn)");
            isEmailValid = false;
        }

        if (isEmailValid && StringUtils.isNotBlank(username)) {
            String emailPrefix = email.substring(0, email.indexOf("@"));
            if (!username.equals(emailPrefix)) {
                rowErrors.add("Username (" + username + ") không khớp prefix email (" + emailPrefix + ")");
            }
        }

        // 3. Validate Fullname
        if (StringUtils.isBlank(fullName)) {
            rowErrors.add("Tên đầy đủ trống");
        }

        // 4. Validate Gender
        String gender = null;
        if (StringUtils.isNotBlank(rawGender)) {
            String upperGender = rawGender.trim().toUpperCase();
            if ("MALE".equals(upperGender) || "FEMALE".equals(upperGender)) {
                gender = upperGender;
            }
        }

        // 5. Validate Phone
        if (StringUtils.isNotBlank(phone)) {
            phone = phone.trim().replaceAll("\\s+", "");
            if (phone.matches("^\\d{9}$")) {
                phone = "0" + phone;
            }
            if (!phone.matches("^0\\d{9}$")) {
                rowErrors.add("Số điện thoại không hợp lệ");
            }
        }

        // 6. Validate Department
        if (StringUtils.isBlank(department)) {
            rowErrors.add("Phân hệ trống");
        }

        if (!rowErrors.isEmpty()) {
            throw new IllegalArgumentException(String.join("; ", rowErrors));
        }

        return UserOffer.builder()
                .userName(username)
                .email(email)
                .fullName(fullName)
                .birthDay(ExcelUtils.getDateCellValue(row, 3))
                .gender(gender)
                .phone(phone)
                .status("ACTIVE")
                .createdTime(LocalDateTime.now())
                .createdBy("SYSTEM_IMPORT")
                .userRoles(new ArrayList<>())
                .build();
    }

    @Autowired
    private UserRoleOfferRepository userRoleRepository;

    private void parseAndValidatePermission(Row row, Map<String, UserOffer> validUserMap, Map<String, RoleOffer> roleMap) {
        List<String> rowErrors = new ArrayList<>();

        String username = ExcelUtils.getCellValue(row, 0);
        String bank = ExcelUtils.getCellValue(row, 1);
        String branch = ExcelUtils.getCellValue(row, 2);
        String roleName = ExcelUtils.getCellValue(row, 3);
        String type = ExcelUtils.getCellValue(row, 4);
        LocalDate fromDate = ExcelUtils.getDateCellValue(row, 5);
        LocalDate toDate = ExcelUtils.getDateCellValue(row, 6);

        if (StringUtils.isBlank(username)) {
            rowErrors.add("Username trống");
        }

        UserOffer user = validUserMap.get(username);
        if (user == null) {
            rowErrors.add("Username '" + username + "' không có trong Sheet User hoặc bị lỗi");
        }

        if (StringUtils.isBlank(bank)) rowErrors.add("Khối trống");
        if (StringUtils.isBlank(branch)) rowErrors.add("Đơn vị trống");

        RoleOffer role;
        if (StringUtils.isBlank(roleName)) {
            role = null;
            rowErrors.add("Role trống");
        } else {
            role = roleMap.get(roleName.toUpperCase());
            if (role == null) {
                rowErrors.add("Role '" + roleName + "' không tồn tại trong hệ thống");
            }
        }

        if (!rowErrors.isEmpty()) {
            throw new IllegalArgumentException(String.join("; ", rowErrors));
        }

        // --- CHECK TRÙNG LẶP PHÂN QUYỀN ---
        if (user != null && role != null) {
            // 1. Check trùng với roles đang có trong DB (nếu user đã tồn tại)
            if (user.getId() != null) { // User đã tồn tại trong DB
                boolean isDuplicate = userRoleRepository.existsDuplicatePermission(
                        user, role, bank, branch, type,
                        fromDate != null ? fromDate : LocalDate.of(1900, 1, 1),
                        toDate != null ? toDate : LocalDate.of(9999, 12, 31)
                );

                if (isDuplicate) {
                    throw new IllegalArgumentException(
                            String.format("Phân quyền [%s - %s - %s - %s] đã tồn tại cho user '%s' trong hệ thống",
                                    role.getRoleName(), bank, branch, type, username)
                    );
                }
            }

            // 2. Check trùng với roles đang được thêm trong file hiện tại
            boolean isDuplicateInFile = user.getUserRoles().stream()
                    .anyMatch(existingRole ->
                            existingRole.getRole().equals(role) &&
                                    existingRole.getBank().equals(bank) &&
                                    existingRole.getBranch().equals(branch) &&
                                    existingRole.getType().equals(type)
                    );

            if (isDuplicateInFile) {
                throw new IllegalArgumentException(
                        String.format("Phân quyền [%s - %s - %s - %s] bị trùng lặp trong file cho user '%s'",
                                role.getRoleName(), bank, branch, type, username)
                );
            }

            // Thêm role mới nếu không trùng
            UserRoleOffer roleOffer = UserRoleOffer.builder()
                    .bank(bank)
                    .branch(branch)
                    .role(role)
                    .type(type)
                    .fromDate(fromDate)
                    .toDate(toDate)
                    .userOffer(user)
                    .build();
            user.getUserRoles().add(roleOffer);
        }
    }
}
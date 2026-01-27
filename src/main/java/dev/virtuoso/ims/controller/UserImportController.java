package dev.virtuoso.ims.controller;

import dev.virtuoso.ims.entity.UserOffer;
import dev.virtuoso.ims.entity.UserRoleOffer;
import dev.virtuoso.ims.repository.UserOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import dev.virtuoso.ims.dto.response.ImportResult;
import dev.virtuoso.ims.service.impl.UserImportServiceImpl;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserImportController {

    private final UserImportServiceImpl userImportService;
    private final UserOfferRepository userOfferRepository;

    @GetMapping
    public ResponseEntity<Page<UserOffer>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdTime"));
        Page<UserOffer> users;

        if (keyword != null && !keyword.isBlank()) {
            users = userOfferRepository.searchByKeyword(keyword.trim(), pageable);
        } else {
            users = userOfferRepository.findAll(pageable);
        }

        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userOfferRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserOffer user) {
        try {
            // Validate
            if (userOfferRepository.existsByUserName(user.getUserName())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username đã tồn tại"));
            }

            user.setStatus("ACTIVE");
            user.setCreatedTime(java.time.LocalDateTime.now());
            user.setCreatedBy("ADMIN");

            // Set up bidirectional relationship for roles
            if (user.getUserRoles() != null) {
                for (UserRoleOffer role : user.getUserRoles()) {
                    role.setUserOffer(user);
                }
            }

            UserOffer saved = userOfferRepository.save(user);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserOffer userData) {
        try {
            UserOffer existingUser = userOfferRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Update basic fields
            existingUser.setFullName(userData.getFullName());
            existingUser.setEmail(userData.getEmail());
            existingUser.setPhone(userData.getPhone());
            existingUser.setBirthDay(userData.getBirthDay());
            existingUser.setGender(userData.getGender());
            existingUser.setStatus(userData.getStatus());
            existingUser.setUpdatedTime(java.time.LocalDateTime.now());
            existingUser.setUpdatedBy("ADMIN");

            // Update roles if provided
            if (userData.getUserRoles() != null) {
                // Clear existing roles
                existingUser.getUserRoles().clear();

                // Add new roles
                for (UserRoleOffer newRole : userData.getUserRoles()) {
                    UserRoleOffer role = new UserRoleOffer();
                    role.setType(newRole.getType());
                    role.setBank(newRole.getBank());
                    role.setBranch(newRole.getBranch());
                    role.setFromDate(newRole.getFromDate());
                    role.setToDate(newRole.getToDate());
                    role.setRole(newRole.getRole());
                    existingUser.addUserRole(role);
                }
            }

            UserOffer updated = userOfferRepository.save(existingUser);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadUser(@RequestParam("file") MultipartFile file) {
        try {
            ImportResult result = userImportService.uploadUserFile(file);

            if (result.getErrorCount() == 0) {
                return ResponseEntity.ok(result);
            } else {
                // Trả về 200 OK nhưng kèm danh sách lỗi (Partial Success)
                // Hoặc 400 Bad Request tùy quy định của Frontend bạn
                return ResponseEntity.ok().body(result);
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userOfferRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không tìm thấy người dùng"));
        }
        userOfferRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Xóa thành công"));
    }
}
package dev.virtuoso.ims.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "USER_OFFER")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_offer_seq_gen")
    @SequenceGenerator(name = "user_offer_seq_gen", sequenceName = "user_offer_seq", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Column(name = "USER_NAME", nullable = false, length = 50)
    private String userName;

    @Column(name = "FULL_NAME", nullable = false, length = 200)
    private String fullName;

    @Column(name = "EMAIL", nullable = false, length = 200)
    private String email;

    @Column(name = "PHONE", length = 50)
    private String phone;

    @Column(name = "BIRTH_DAY")
    private LocalDate birthDay;

    @Column(name = "GENDER", length = 50)
    private String gender;

    @Column(name = "STATUS", nullable = false, length = 50)
    private String status;

    // Audit fields
    @Column(name = "CREATED_BY", length = 50)
    private String createdBy;

    @Column(name = "CREATED_TIME")
    private LocalDateTime createdTime;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "UPDATED_TIME")
    private LocalDateTime updatedTime;

    // --- BỔ SUNG QUAN TRỌNG: QUAN HỆ 1-N ---
    // mappedBy = "userOffer" phải trùng tên với field userOffer bên class UserRoleOffer
    @OneToMany(mappedBy = "userOffer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default // Để Lombok Builder không ghi đè list này bằng null
    private List<UserRoleOffer> userRoles = new ArrayList<>();

    // Helper method để thêm Role và giữ tính nhất quán 2 chiều
    public void addUserRole(UserRoleOffer role) {
        userRoles.add(role);
        role.setUserOffer(this);
    }
}
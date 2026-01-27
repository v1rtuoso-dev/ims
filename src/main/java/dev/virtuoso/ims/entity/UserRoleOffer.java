package dev.virtuoso.ims.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "USER_ROLE_OFFER")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRoleOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_role_offer_seq_gen")
    @SequenceGenerator(name = "user_role_offer_seq_gen", sequenceName = "user_role_offer_seq", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Column(name = "TYPE", nullable = true, length = 50)
    private String type;

    // Map quan hệ tới bảng RoleOffer
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROLE_ID", nullable = true)
    @JsonIgnore
    private RoleOffer role;

    @Column(name = "BANK", nullable = true, length = 200)
    private String bank;

    @Column(name = "BRANCH", nullable = true, length = 200)
    private String branch;

    @Column(name = "FROM_DATE")
    private LocalDate fromDate;

    @Column(name = "TO_DATE")
    private LocalDate toDate;

    // --- BỔ SUNG QUAN TRỌNG: LIÊN KẾT VỚI USER ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false) // Bắt buộc phải có cột USER_ID trong DB
    @JsonIgnore
    private UserOffer userOffer;
    // ---------------------------------------------
}
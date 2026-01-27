package dev.virtuoso.ims.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ROLE_OFFER")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "role_offer_seq_gen")
    @SequenceGenerator(name = "role_offer_seq_gen", sequenceName = "role_offer_seq", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Column(name = "ROLE_NAME", length = 255)
    private String roleName;

    @Column(name = "STATUS", length = 50)
    private String status;

    @Column(name = "DESCRIPTION", length = 200)
    private String description;

    // Audit fields
    @Column(name = "CREATED_BY", length = 50)
    private String createdBy;

    @Column(name = "CREATED_TIME")
    private LocalDateTime createdTime;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "UPDATED_TIME")
    private LocalDateTime updatedTime;
}
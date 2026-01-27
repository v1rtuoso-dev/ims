package dev.virtuoso.ims.entity.rbac;

import dev.virtuoso.ims.entity.RoleOffer;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ROLE_ACT_RES")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleActRes {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "role_act_res_seq_gen")
    @SequenceGenerator(name = "role_act_res_seq_gen", sequenceName = "ROLE_ACT_RES_SEQ", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROLE_ID")
    private RoleOffer role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ACT_ID")
    private ActionOffer action;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RES_ID")
    private ResourceOffer resource;
}
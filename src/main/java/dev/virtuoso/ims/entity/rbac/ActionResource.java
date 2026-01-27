package dev.virtuoso.ims.entity.rbac;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ACTION_RESOURCE")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActionResource {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "action_res_seq_gen")
    @SequenceGenerator(name = "action_res_seq_gen", sequenceName = "action_resource_seq", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    // Relationship: Action ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ACTION_ID", nullable = false)
    private ActionOffer action;

    // Relationship: Resource ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RESOURCE_ID", nullable = false)
    private ResourceOffer resource;

    @Column(name = "SLUG", length = 200)
    private String slug;

    @Column(name = "STATUS", length = 50)
    private String status;
}
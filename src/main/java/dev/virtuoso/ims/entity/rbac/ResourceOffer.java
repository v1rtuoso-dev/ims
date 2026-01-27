package dev.virtuoso.ims.entity.rbac;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "RESOURCE_OFFER")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceOffer {

    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "RESOURCE_NAME", length = 255)
    private String resourceName;
}

package dev.virtuoso.ims.entity.rbac;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ACTION_OFFER")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActionOffer {

    @Id
    // Vì bảng này insert thủ công ID (1, 2, 3) trong script,
    // ta không dùng @GeneratedValue hoặc dùng strategy phù hợp nếu muốn tự quản lý.
    @Column(name = "ID")
    private Long id;

    @Column(name = "ACTION_NAME", length = 255)
    private String actionName;
}
package dev.virtuoso.ims.repository;

import dev.virtuoso.ims.entity.RoleOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleOfferRepository extends JpaRepository<RoleOffer, Long> {

    // Tìm Role theo tên (để map từ Excel cột 'ROLE' -> RoleOffer Entity)
    // IgnoreCase để 'rm' hay 'RM' đều tìm được
    Optional<RoleOffer> findByRoleNameIgnoreCase(String roleName);
}
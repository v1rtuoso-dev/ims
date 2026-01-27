package dev.virtuoso.ims.repository;

import dev.virtuoso.ims.entity.RoleOffer;
import dev.virtuoso.ims.entity.UserOffer;
import dev.virtuoso.ims.entity.UserRoleOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface UserRoleOfferRepository extends JpaRepository<UserRoleOffer, Long> {

    // Check trùng lặp phân quyền
    boolean existsByUserOfferAndRoleAndBankAndBranchAndType(
            UserOffer userOffer,
            RoleOffer role,
            String bank,
            String branch,
            String type
    );

    // Hoặc dùng query phức tạp hơn nếu cần check cả date
    @Query("SELECT CASE WHEN COUNT(ur) > 0 THEN true ELSE false END " +
            "FROM UserRoleOffer ur " +
            "WHERE ur.userOffer = :user " +
            "AND ur.role = :role " +
            "AND ur.bank = :bank " +
            "AND ur.branch = :branch " +
            "AND ur.type = :type " +
            "AND (ur.toDate IS NULL OR ur.toDate >= :fromDate) " +
            "AND (ur.fromDate IS NULL OR ur.fromDate <= :toDate)")
    boolean existsDuplicatePermission(
            @Param("user") UserOffer user,
            @Param("role") RoleOffer role,
            @Param("bank") String bank,
            @Param("branch") String branch,
            @Param("type") String type,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );
}

package dev.virtuoso.ims.repository;

import dev.virtuoso.ims.entity.UserOffer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserOfferRepository extends JpaRepository<UserOffer, Long> {

    // Check trùng user đơn lẻ (dùng cho validate nhanh hoặc insert lẻ)
    boolean existsByUserName(String userName);

    // Batch Check: Lấy danh sách User từ 1 list username (để validate excel 1000 dòng trong 1 query)
    // Select * from user_offer where user_name in ('u1', 'u2', ...)
    List<UserOffer> findByUserNameIn(Collection<String> userNames);

    // Find by ID with userRoles eagerly loaded
    @EntityGraph(attributePaths = {"userRoles"})
    Optional<UserOffer> findById(Long id);

    // Find all with userRoles eagerly loaded
    @EntityGraph(attributePaths = {"userRoles"})
    Page<UserOffer> findAll(Pageable pageable);

    // Search by keyword across userName, fullName, and email
    @EntityGraph(attributePaths = {"userRoles"})
    @Query("SELECT u FROM UserOffer u WHERE " +
           "LOWER(u.userName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<UserOffer> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}

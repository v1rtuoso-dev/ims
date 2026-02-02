package dev.virtuoso.ims.repository.interest;

import dev.virtuoso.ims.entity.interest.LoanInterestParamType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LoanInterestParamTypeRepository extends JpaRepository<LoanInterestParamType, Long> {
    // Thêm hàm tìm theo Code
    Optional<LoanInterestParamType> findByCode(String code);
}
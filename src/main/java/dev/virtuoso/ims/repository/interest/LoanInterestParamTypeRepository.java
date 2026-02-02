package dev.virtuoso.ims.repository.interest;

import dev.virtuoso.ims.entity.interest.LoanInterestParamType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoanInterestParamTypeRepository extends JpaRepository<LoanInterestParamType, Long> {
}
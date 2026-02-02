package dev.virtuoso.ims.repository.interest;

import dev.virtuoso.ims.entity.interest.LoanInterestParam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LoanInterestParamRepository extends JpaRepository<LoanInterestParam, Integer> {
    // Lấy các param đang ACTIVE theo Type ID
    List<LoanInterestParam> findByTypeIdAndStatus(Integer typeId, String status);
}
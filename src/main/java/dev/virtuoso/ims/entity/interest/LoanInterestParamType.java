package dev.virtuoso.ims.entity.interest;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "LOAN_INTEREST_PARAM_TYPE")
@Data
public class LoanInterestParamType {
    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "NAME")
    private String name;

    @Column(name = "CODE")
    private String code;
}
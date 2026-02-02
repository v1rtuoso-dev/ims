package dev.virtuoso.ims.entity.interest;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "LOAN_INTEREST_PARAM")
@Data
public class LoanInterestParam {
    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "TYPE_ID")
    private Long typeId;

    @Column(name = "VALUE")
    private String value;

    @Column(name = "STATUS")
    private String status;
}
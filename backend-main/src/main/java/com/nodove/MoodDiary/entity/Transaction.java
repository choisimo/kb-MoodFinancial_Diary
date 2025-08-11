package com.nodove.MoodDiary.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private FinancialAccount account;
    
    @Column(nullable = false, length = 20)
    private String type; // INCOME, EXPENSE, TRANSFER
    
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;
    
    @Column(nullable = false, length = 255)
    private String description;
    
    @Column(length = 100)
    private String category;
    
    @Column(length = 100)
    private String subcategory;
    
    @Column
    private LocalDateTime transactionDate;
    
    @Column(length = 255)
    private String location;
    
    @Column(length = 500)
    private String memo;
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean isManual = true;
    
    @Column(length = 255)
    private String externalTransactionId; // 외부 API에서 가져온 거래 ID
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Helper methods
    public boolean isExpense() {
        return "EXPENSE".equals(type);
    }
    
    public boolean isIncome() {
        return "INCOME".equals(type);
    }
    
    public BigDecimal getSignedAmount() {
        return isExpense() ? amount.negate() : amount;
    }
}
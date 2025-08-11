package com.nodove.MoodDiary.repository;

import com.nodove.MoodDiary.entity.FinancialAccount;
import com.nodove.MoodDiary.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialAccountRepository extends JpaRepository<FinancialAccount, Long> {
    
    List<FinancialAccount> findByUserAndIsActiveTrue(User user);
    
    Optional<FinancialAccount> findByIdAndUser(Long id, User user);
    
    @Query("SELECT SUM(fa.balance) FROM FinancialAccount fa WHERE fa.user = :user AND fa.isActive = true")
    Optional<BigDecimal> getTotalBalanceByUser(@Param("user") User user);
    
    long countByUserAndIsActiveTrue(User user);
}
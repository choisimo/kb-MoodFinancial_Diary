package com.nodove.MoodDiary.repository;

import com.nodove.MoodDiary.entity.Transaction;
import com.nodove.MoodDiary.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    Page<Transaction> findByUserOrderByTransactionDateDesc(User user, Pageable pageable);
    
    List<Transaction> findByUserAndTransactionDateBetweenOrderByTransactionDateDesc(
        User user, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.type = :type ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserAndType(@Param("user") User user, @Param("type") String type);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = 'EXPENSE' AND t.transactionDate >= :startDate")
    Optional<BigDecimal> getTotalExpensesSince(@Param("user") User user, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = 'INCOME' AND t.transactionDate >= :startDate")
    Optional<BigDecimal> getTotalIncomeSince(@Param("user") User user, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = 'EXPENSE' AND t.transactionDate >= :startDate GROUP BY t.category")
    List<Object[]> getExpensesByCategory(@Param("user") User user, @Param("startDate") LocalDateTime startDate);
}
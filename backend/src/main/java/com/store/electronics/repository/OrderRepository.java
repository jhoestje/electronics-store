package com.store.electronics.repository;

import com.store.electronics.model.Order;
import com.store.electronics.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
    List<Order> findByStatus(Order.OrderStatus status);
}

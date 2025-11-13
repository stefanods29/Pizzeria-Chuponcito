package main.proyecto.repository;

import main.proyecto.model.Pizza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PizzaRepository extends JpaRepository<Pizza, Long> {
    List<Pizza> findByStockQuantityGreaterThanEqual(int stock);  
    List<Pizza> findByIdIn(List<Long> ids);
}
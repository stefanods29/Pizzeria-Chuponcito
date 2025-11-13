package main.proyecto.repository;

import main.proyecto.model.Extra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExtraRepository extends JpaRepository<Extra, Long> {
    List<Extra> findByStockQuantityGreaterThanEqual(int stock);  
    List<Extra> findByIdIn(List<Long> ids);
}
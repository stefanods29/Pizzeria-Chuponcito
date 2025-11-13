package main.proyecto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import main.proyecto.model.Bebida;
@Repository
public interface BebidaRepository extends JpaRepository<Bebida, Long>{
    List<Bebida> findByStockQuantityGreaterThanEqual(int stock); 
    List<Bebida> findByIdIn(List<Long> ids);
}

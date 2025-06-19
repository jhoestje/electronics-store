package com.store.electronics.service;

import com.store.electronics.model.Product;
import com.store.electronics.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    public List<Product> getAllActiveProducts() {
        return productRepository.findByActiveTrue();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    @Transactional
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, Product productDetails) {
        return productRepository.findById(id)
            .map(product -> {
                product.setName(productDetails.getName());
                product.setDescription(productDetails.getDescription());
                product.setPrice(productDetails.getPrice());
                product.setStockQuantity(productDetails.getStockQuantity());
                product.setCategory(productDetails.getCategory());
                product.setBrand(productDetails.getBrand());
                product.setActive(productDetails.getActive());
                return productRepository.save(product);
            })
            .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(false);
        productRepository.save(product);
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndActiveTrue(category);
    }

    public List<Product> getProductsByBrand(String brand) {
        return productRepository.findByBrandAndActiveTrue(brand);
    }
}

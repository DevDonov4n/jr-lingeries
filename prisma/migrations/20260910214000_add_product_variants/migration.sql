CREATE TABLE `product_variants` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `color` VARCHAR(50) NOT NULL,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_product_variant_color` (`product_id`, `color`),
  KEY `idx_variant_product` (`product_id`),
  KEY `idx_variant_stock` (`stock_quantity`),
  CONSTRAINT `fk_variant_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `product_variants` (`product_id`, `color`, `stock_quantity`, `active`)
SELECT `id`, `color`, `stock_quantity`, `active`
FROM `products`
WHERE `color` IS NOT NULL AND TRIM(`color`) <> '';

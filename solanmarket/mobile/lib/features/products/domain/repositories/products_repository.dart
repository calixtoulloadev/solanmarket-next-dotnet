import 'package:dartz/dartz.dart';
import '../models/product.dart';

abstract class ProductsRepository {
  Future<Either<String, PagedResult<Product>>> getProducts({
    int page = 1,
    int pageSize = 20,
    String? search,
    String? categorySlug,
    String? sortBy,
  });

  Future<Either<String, Product>> getProductBySlug(String slug);

  Future<Either<String, List<Product>>> getRelatedProducts(String productId);
}

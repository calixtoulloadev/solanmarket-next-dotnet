import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import '../../domain/models/product.dart';
import '../../domain/repositories/products_repository.dart';
import '../datasources/products_remote_datasource.dart';

class ProductsRepositoryImpl implements ProductsRepository {
  final ProductsRemoteDataSource _ds;
  ProductsRepositoryImpl(this._ds);

  @override
  Future<Either<String, PagedResult<Product>>> getProducts({
    int page = 1,
    int pageSize = 20,
    String? search,
    String? categorySlug,
    String? sortBy,
  }) async {
    try {
      final result = await _ds.getProducts(
        page: page,
        pageSize: pageSize,
        search: search,
        categorySlug: categorySlug,
        sortBy: sortBy,
      );
      return Right(result);
    } on DioException catch (e) {
      return Left(_mapError(e));
    }
  }

  @override
  Future<Either<String, Product>> getProductBySlug(String slug) async {
    try {
      final product = await _ds.getProductBySlug(slug);
      return Right(product);
    } on DioException catch (e) {
      return Left(_mapError(e));
    }
  }

  @override
  Future<Either<String, List<Product>>> getRelatedProducts(
    String productId,
  ) async {
    try {
      final products = await _ds.getRelatedProducts(productId);
      return Right(products);
    } on DioException catch (e) {
      return Left(_mapError(e));
    }
  }

  String _mapError(DioException e) {
    if (e.response != null) {
      final data = e.response!.data;
      if (data is Map && data.containsKey('error'))
        return data['error'] as String;
      return 'Error ${e.response!.statusCode}';
    }
    return 'Network error. Please check your connection.';
  }
}

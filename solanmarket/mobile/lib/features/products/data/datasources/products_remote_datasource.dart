import 'package:dio/dio.dart';
import '../../domain/models/product.dart';

abstract class ProductsRemoteDataSource {
  Future<PagedResult<Product>> getProducts({
    int page = 1,
    int pageSize = 20,
    String? search,
    String? categorySlug,
    String? sortBy,
  });
  Future<Product> getProductBySlug(String slug);
  Future<List<Product>> getRelatedProducts(String productId);
}

class ProductsRemoteDataSourceImpl implements ProductsRemoteDataSource {
  final Dio _dio;
  ProductsRemoteDataSourceImpl(this._dio);

  @override
  Future<PagedResult<Product>> getProducts({
    int page = 1,
    int pageSize = 20,
    String? search,
    String? categorySlug,
    String? sortBy,
  }) async {
    final resp = await _dio.get(
      '/products',
      queryParameters: {
        'page': page,
        'pageSize': pageSize,
        if (search != null) 'search': search,
        if (categorySlug != null) 'categorySlug': categorySlug,
        if (sortBy != null) 'sortBy': sortBy,
      },
    );
    final data = resp.data as Map<String, dynamic>;
    final items = (data['items'] as List<dynamic>)
        .map((e) => Product.fromJson(e as Map<String, dynamic>))
        .toList();
    return PagedResult<Product>(
      items: items,
      totalCount: data['totalCount'] as int,
      page: data['page'] as int,
      pageSize: data['pageSize'] as int,
      totalPages: data['totalPages'] as int,
    );
  }

  @override
  Future<Product> getProductBySlug(String slug) async {
    final resp = await _dio.get('/products/$slug');
    return Product.fromJson(resp.data as Map<String, dynamic>);
  }

  @override
  Future<List<Product>> getRelatedProducts(String productId) async {
    final resp = await _dio.get('/products/$productId/related');
    return (resp.data as List<dynamic>)
        .map((e) => Product.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}

import 'package:equatable/equatable.dart';

class Product extends Equatable {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final double price;
  final double? compareAtPrice;
  final String? thumbnailUrl;
  final List<String> imageUrls;
  final String categoryName;
  final double averageRating;
  final int reviewCount;
  final bool inStock;

  const Product({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    required this.price,
    this.compareAtPrice,
    this.thumbnailUrl,
    required this.imageUrls,
    required this.categoryName,
    required this.averageRating,
    required this.reviewCount,
    required this.inStock,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
    id: json['id'] as String,
    name: json['name'] as String,
    slug: json['slug'] as String,
    description: json['description'] as String?,
    price: (json['price'] as num).toDouble(),
    compareAtPrice: (json['compareAtPrice'] as num?)?.toDouble(),
    thumbnailUrl: json['thumbnailUrl'] as String?,
    imageUrls: (json['imageUrls'] as List<dynamic>? ?? []).cast<String>(),
    categoryName: json['categoryName'] as String,
    averageRating: (json['averageRating'] as num? ?? 0).toDouble(),
    reviewCount: json['reviewCount'] as int? ?? 0,
    inStock: json['inStock'] as bool? ?? false,
  );

  bool get hasDiscount => compareAtPrice != null && compareAtPrice! > price;

  double get discountPercent =>
      hasDiscount ? ((compareAtPrice! - price) / compareAtPrice! * 100) : 0;

  @override
  List<Object?> get props => [id, slug];
}

class PagedResult<T> {
  final List<T> items;
  final int totalCount;
  final int page;
  final int pageSize;
  final int totalPages;

  const PagedResult({
    required this.items,
    required this.totalCount,
    required this.page,
    required this.pageSize,
    required this.totalPages,
  });
}

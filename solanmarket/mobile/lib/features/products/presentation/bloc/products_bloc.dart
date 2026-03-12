import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/models/product.dart';
import '../../domain/repositories/products_repository.dart';

// ── Events ────────────────────────────────────────────────────────────────────
abstract class ProductsEvent extends Equatable {
  const ProductsEvent();
  @override
  List<Object?> get props => [];
}

class ProductsFetched extends ProductsEvent {
  final String? search;
  final String? categorySlug;
  final String? sortBy;
  const ProductsFetched({this.search, this.categorySlug, this.sortBy});
  @override
  List<Object?> get props => [search, categorySlug, sortBy];
}

class ProductsNextPage extends ProductsEvent {}

class ProductDetailFetched extends ProductsEvent {
  final String slug;
  const ProductDetailFetched(this.slug);
  @override
  List<Object?> get props => [slug];
}

// ── States ────────────────────────────────────────────────────────────────────
abstract class ProductsState extends Equatable {
  const ProductsState();
  @override
  List<Object?> get props => [];
}

class ProductsInitial extends ProductsState {}

class ProductsLoading extends ProductsState {}

class ProductsLoaded extends ProductsState {
  final List<Product> products;
  final int currentPage;
  final int totalPages;
  final bool isLoadingMore;

  const ProductsLoaded({
    required this.products,
    required this.currentPage,
    required this.totalPages,
    this.isLoadingMore = false,
  });

  bool get hasMore => currentPage < totalPages;

  ProductsLoaded copyWith({
    List<Product>? products,
    int? currentPage,
    int? totalPages,
    bool? isLoadingMore,
  }) => ProductsLoaded(
    products: products ?? this.products,
    currentPage: currentPage ?? this.currentPage,
    totalPages: totalPages ?? this.totalPages,
    isLoadingMore: isLoadingMore ?? this.isLoadingMore,
  );

  @override
  List<Object?> get props => [products, currentPage, totalPages, isLoadingMore];
}

class ProductDetailLoaded extends ProductsState {
  final Product product;
  const ProductDetailLoaded(this.product);
  @override
  List<Object?> get props => [product];
}

class ProductsError extends ProductsState {
  final String message;
  const ProductsError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── BLoC ──────────────────────────────────────────────────────────────────────
class ProductsBloc extends Bloc<ProductsEvent, ProductsState> {
  final ProductsRepository _repository;
  String? _lastSearch;
  String? _lastCategory;
  String? _lastSort;

  ProductsBloc(this._repository) : super(ProductsInitial()) {
    on<ProductsFetched>(_onFetched);
    on<ProductsNextPage>(_onNextPage);
    on<ProductDetailFetched>(_onDetailFetched);
  }

  Future<void> _onFetched(
    ProductsFetched event,
    Emitter<ProductsState> emit,
  ) async {
    emit(ProductsLoading());
    _lastSearch = event.search;
    _lastCategory = event.categorySlug;
    _lastSort = event.sortBy;

    final result = await _repository.getProducts(
      search: event.search,
      categorySlug: event.categorySlug,
      sortBy: event.sortBy,
    );
    result.fold(
      (err) => emit(ProductsError(err)),
      (paged) => emit(
        ProductsLoaded(
          products: paged.items,
          currentPage: paged.page,
          totalPages: paged.totalPages,
        ),
      ),
    );
  }

  Future<void> _onNextPage(
    ProductsNextPage event,
    Emitter<ProductsState> emit,
  ) async {
    final current = state;
    if (current is! ProductsLoaded || !current.hasMore || current.isLoadingMore)
      return;

    emit(current.copyWith(isLoadingMore: true));
    final result = await _repository.getProducts(
      page: current.currentPage + 1,
      search: _lastSearch,
      categorySlug: _lastCategory,
      sortBy: _lastSort,
    );
    result.fold(
      (err) => emit(ProductsError(err)),
      (paged) => emit(
        current.copyWith(
          products: [...current.products, ...paged.items],
          currentPage: paged.page,
          totalPages: paged.totalPages,
          isLoadingMore: false,
        ),
      ),
    );
  }

  Future<void> _onDetailFetched(
    ProductDetailFetched event,
    Emitter<ProductsState> emit,
  ) async {
    emit(ProductsLoading());
    final result = await _repository.getProductBySlug(event.slug);
    result.fold(
      (err) => emit(ProductsError(err)),
      (product) => emit(ProductDetailLoaded(product)),
    );
  }
}

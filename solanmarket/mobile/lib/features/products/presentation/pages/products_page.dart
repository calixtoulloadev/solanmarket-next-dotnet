import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/di/injection.dart';
import '../../domain/models/product.dart';
import '../bloc/products_bloc.dart';
import '../widgets/product_card.dart';

class ProductsPage extends StatefulWidget {
  const ProductsPage({super.key});

  @override
  State<ProductsPage> createState() => _ProductsPageState();
}

class _ProductsPageState extends State<ProductsPage> {
  final _scrollCtrl = ScrollController();
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    sl<ProductsBloc>().add(const ProductsFetched());
    _scrollCtrl.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollCtrl.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollCtrl.position.pixels >=
        _scrollCtrl.position.maxScrollExtent - 200) {
      sl<ProductsBloc>().add(ProductsNextPage());
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: sl<ProductsBloc>(),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Solanmarket'),
          actions: [
            IconButton(
              icon: const Icon(Icons.shopping_cart_outlined),
              onPressed: () => context.push('/cart'),
            ),
          ],
        ),
        body: Column(
          children: [
            // Search bar
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: TextField(
                controller: _searchCtrl,
                decoration: InputDecoration(
                  hintText: 'Search products…',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: _searchCtrl.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            _searchCtrl.clear();
                            sl<ProductsBloc>().add(const ProductsFetched());
                          },
                        )
                      : null,
                ),
                onSubmitted: (v) =>
                    sl<ProductsBloc>().add(ProductsFetched(search: v.trim())),
                onChanged: (_) => setState(() {}),
              ),
            ),
            const SizedBox(height: 8),
            // Grid
            Expanded(
              child: BlocBuilder<ProductsBloc, ProductsState>(
                builder: (ctx, state) {
                  if (state is ProductsLoading) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  if (state is ProductsError) {
                    return Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(state.message),
                          const SizedBox(height: 12),
                          ElevatedButton(
                            onPressed: () =>
                                sl<ProductsBloc>().add(const ProductsFetched()),
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    );
                  }
                  if (state is ProductsLoaded) {
                    return _ProductGrid(
                      products: state.products,
                      isLoadingMore: state.isLoadingMore,
                      scrollCtrl: _scrollCtrl,
                    );
                  }
                  return const SizedBox();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProductGrid extends StatelessWidget {
  final List<Product> products;
  final bool isLoadingMore;
  final ScrollController scrollCtrl;

  const _ProductGrid({
    required this.products,
    required this.isLoadingMore,
    required this.scrollCtrl,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      controller: scrollCtrl,
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.7,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: products.length + (isLoadingMore ? 2 : 0),
      itemBuilder: (_, i) {
        if (i >= products.length) {
          return const Card(child: Center(child: CircularProgressIndicator()));
        }
        return ProductCard(product: products[i]);
      },
    );
  }
}

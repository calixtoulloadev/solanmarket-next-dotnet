import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../cart/presentation/cubit/cart_cubit.dart';
import '../../domain/models/product.dart';
import '../bloc/products_bloc.dart';

class ProductDetailPage extends StatelessWidget {
  final String slug;
  const ProductDetailPage({super.key, required this.slug});

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: sl<ProductsBloc>()..add(ProductDetailFetched(slug)),
      child: BlocBuilder<ProductsBloc, ProductsState>(
        builder: (ctx, state) {
          if (state is ProductsLoading) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
          if (state is ProductDetailLoaded) {
            return _DetailView(product: state.product);
          }
          if (state is ProductsError) {
            return Scaffold(
              appBar: AppBar(),
              body: Center(child: Text(state.message)),
            );
          }
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        },
      ),
    );
  }
}

class _DetailView extends StatefulWidget {
  final Product product;
  const _DetailView({required this.product});

  @override
  State<_DetailView> createState() => _DetailViewState();
}

class _DetailViewState extends State<_DetailView> {
  int _qty = 1;
  int _imageIndex = 0;

  @override
  Widget build(BuildContext context) {
    final p = widget.product;
    final images = p.imageUrls.isNotEmpty
        ? p.imageUrls
        : (p.thumbnailUrl != null ? [p.thumbnailUrl!] : <String>[]);

    return Scaffold(
      appBar: AppBar(
        title: Text(p.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_cart_outlined),
            onPressed: () => context.push('/cart'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image carousel
            SizedBox(
              height: 320,
              child: Stack(
                children: [
                  PageView.builder(
                    itemCount: images.isEmpty ? 1 : images.length,
                    onPageChanged: (i) => setState(() => _imageIndex = i),
                    itemBuilder: (_, i) {
                      if (images.isEmpty) {
                        return const ColoredBox(color: SolanmarketColors.blush);
                      }
                      return CachedNetworkImage(
                        imageUrl: images[i],
                        fit: BoxFit.cover,
                        placeholder: (_, __) =>
                            const ColoredBox(color: SolanmarketColors.blush),
                        errorWidget: (_, __, ___) =>
                            const ColoredBox(color: SolanmarketColors.blush),
                      );
                    },
                  ),
                  if (images.length > 1)
                    Positioned(
                      bottom: 12,
                      left: 0,
                      right: 0,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(images.length, (i) {
                          return AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            margin: const EdgeInsets.symmetric(horizontal: 3),
                            width: i == _imageIndex ? 16 : 6,
                            height: 6,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(3),
                              color: i == _imageIndex
                                  ? SolanmarketColors.accent
                                  : Colors.white70,
                            ),
                          );
                        }),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    p.categoryName,
                    style: const TextStyle(
                      fontSize: 12,
                      color: SolanmarketColors.muted,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(p.name, style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Text(
                        '\$${p.price.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          color: SolanmarketColors.accent,
                        ),
                      ),
                      if (p.hasDiscount) ...[
                        const SizedBox(width: 10),
                        Text(
                          '\$${p.compareAtPrice!.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 16,
                            color: SolanmarketColors.muted,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Rating
                  Row(
                    children: [
                      const Icon(
                        Icons.star_rounded,
                        color: Colors.amber,
                        size: 18,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${p.averageRating.toStringAsFixed(1)} (${p.reviewCount})',
                        style: const TextStyle(color: SolanmarketColors.muted),
                      ),
                    ],
                  ),
                  if (p.description != null) ...[
                    const SizedBox(height: 20),
                    Text(
                      p.description!,
                      style: const TextStyle(
                        fontSize: 14,
                        height: 1.6,
                        color: SolanmarketColors.dark,
                      ),
                    ),
                  ],
                  const SizedBox(height: 28),
                  // Quantity picker
                  Row(
                    children: [
                      const Text(
                        'Quantity',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(width: 20),
                      _QtyButton(
                        icon: Icons.remove,
                        onTap: () {
                          if (_qty > 1) setState(() => _qty--);
                        },
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          '$_qty',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      _QtyButton(
                        icon: Icons.add,
                        onTap: () => setState(() => _qty++),
                      ),
                    ],
                  ),
                  const SizedBox(height: 28),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: p.inStock
                          ? () {
                              sl<CartCubit>().addItem(p, _qty);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('${p.name} added to cart'),
                                  behavior: SnackBarBehavior.floating,
                                ),
                              );
                            }
                          : null,
                      icon: const Icon(Icons.shopping_bag_outlined),
                      label: Text(p.inStock ? 'Add to Bag' : 'Out of Stock'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QtyButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _QtyButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFE0D9D0)),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, size: 18, color: SolanmarketColors.dark),
      ),
    );
  }
}

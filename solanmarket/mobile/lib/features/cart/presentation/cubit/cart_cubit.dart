import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../products/domain/models/product.dart';

class CartItem extends Equatable {
  final Product product;
  final int quantity;

  const CartItem({required this.product, required this.quantity});

  double get subtotal => product.price * quantity;

  CartItem copyWith({Product? product, int? quantity}) => CartItem(
    product: product ?? this.product,
    quantity: quantity ?? this.quantity,
  );

  @override
  List<Object?> get props => [product.id, quantity];
}

class CartState extends Equatable {
  final List<CartItem> items;

  const CartState({required this.items});

  factory CartState.empty() => const CartState(items: []);

  double get totalPrice => items.fold(0, (sum, item) => sum + item.subtotal);
  int get totalItems => items.fold(0, (sum, item) => sum + item.quantity);

  @override
  List<Object?> get props => [items];
}

class CartCubit extends Cubit<CartState> {
  CartCubit() : super(CartState.empty());

  void addItem(Product product, [int qty = 1]) {
    final items = List<CartItem>.from(state.items);
    final idx = items.indexWhere((i) => i.product.id == product.id);
    if (idx >= 0) {
      items[idx] = items[idx].copyWith(quantity: items[idx].quantity + qty);
    } else {
      items.add(CartItem(product: product, quantity: qty));
    }
    emit(CartState(items: items));
  }

  void removeItem(String productId) {
    emit(
      CartState(
        items: state.items.where((i) => i.product.id != productId).toList(),
      ),
    );
  }

  void updateQuantity(String productId, int quantity) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    emit(
      CartState(
        items: state.items
            .map(
              (i) => i.product.id == productId
                  ? i.copyWith(quantity: quantity)
                  : i,
            )
            .toList(),
      ),
    );
  }

  void clear() => emit(CartState.empty());
}

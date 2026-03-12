// ── Product types ─────────────────────────────────────────────────────────────

export interface ProductListItem {
    id: string;
    name: string;
    slug: string;
    brand?: string;
    categoryName: string;
    price: number;
    originalPrice?: number;
    discountPercent?: number;
    rating: number;
    reviewCount: number;
    mainImageUrl?: string;
    status: string;
    isPublished: boolean;
    isFeatured: boolean;
    totalStock: number;
}

export interface ProductDetail {
    id: string;
    name: string;
    slug: string;
    description?: string;
    brand?: string;
    price: number;
    cost?: number;
    originalPrice?: number;
    discountPercent?: number;
    rating: number;
    reviewCount: number;
    status: string;
    isPublished: boolean;
    isFeatured: boolean;
    categoryId: string;
    categoryName: string;
    supplierId?: string;
    supplierName?: string;
    images: ProductImageDto[];
    variants: ProductVariantDto[];
    tags: string[];
}

export interface ProductImageDto {
    id: string;
    url: string;
    isMain: boolean;
    sortOrder: number;
    colorHex?: string;
}

export interface ProductVariantDto {
    id: string;
    sku: string;
    size?: string;
    colorHex?: string;
    colorName?: string;
    additionalPrice: number;
    stock: number;
    isActive: boolean;
}

export interface CategoryDto {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    children?: CategoryDto[];
}

export interface ProductQueryParams {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    isPublished?: boolean;
    isFeatured?: boolean;
    sortBy?: "price" | "rating" | "createdAt";
    sortDir?: "asc" | "desc";
    page?: number;
    pageSize?: number;
}

// ── Order types ───────────────────────────────────────────────────────────────

export interface OrderSummary {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    itemCount: number;
    firstItemImage?: string;
    userEmail?: string;
    createdAt: string;
}

export interface OrderDetail {
    id: string;
    orderNumber: string;
    status: string;
    subTotal: number;
    shippingCost: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
    shippingMethod: string;
    paymentMethodType: string;
    couponCode?: string;
    shippingAddress?: AddressSnapshot;
    items: OrderItemDto[];
    tracking: OrderTrackingDto[];
    createdAt: string;
    shippedAt?: string;
    deliveredAt?: string;
}

export interface OrderItemDto {
    id: string;
    productId: string;
    productName: string;
    productImage?: string;
    variantDetails?: string;
    unitPrice: number;
    quantity: number;
    total: number;
}

export interface OrderTrackingDto {
    status: string;
    description?: string;
    location?: string;
    timestamp: string;
}

export interface AddressSnapshot {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
}

export interface CreateOrderRequest {
    shippingAddressId: string;
    shippingMethod: "Standard" | "Express" | "NextDay" | "Pickup";
    paymentMethodType: "Card" | "PayPal" | "ApplePay" | "GooglePay";
    paymentIntentId?: string;
    couponCode?: string;
    notes?: string;
    items: CartItemRequest[];
}

export interface CartItemRequest {
    productId: string;
    variantId?: string;
    quantity: number;
}

export interface CheckoutTotals {
    lines: CartLineDto[];
    subTotal: number;
    shippingCost: number;
    discountAmount: number;
    discountDescription?: string;
    taxAmount: number;
    total: number;
}

export interface CartLineDto {
    productId: string;
    variantId?: string;
    productName: string;
    variantDetails?: string;
    imageUrl?: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
}

// ── Cart store type ───────────────────────────────────────────────────────────

export interface CartItem {
    productId: string;
    variantId?: string;
    name: string;
    variantDetails?: string;
    imageUrl?: string;
    price: number;
    quantity: number;
}

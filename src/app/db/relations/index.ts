import { defineRelations } from "drizzle-orm";
import { addresses } from "../schemas/addresses";
import { attribute_values } from "../schemas/attribute_values";
import { attributes } from "../schemas/attributes";
import { banners } from "../schemas/banner";
import { brands } from "../schemas/brand";
import { cart_items } from "../schemas/cart_items";
import { carts } from "../schemas/carts";
import { categories } from "../schemas/categories";
import { categoryAttributes } from "../schemas/category-attributes";
import { couponUsages } from "../schemas/coupon-usages";
import { coupons } from "../schemas/coupons";
import { mediaUploads } from "../schemas/media-uploads";
import { orderItems } from "../schemas/order-items";
import { orders } from "../schemas/orders";
import { otps } from "../schemas/otp";
import { productImages } from "../schemas/product-images";
import { products } from "../schemas/products";
import { siteSettings } from "../schemas/site-settings";
import { users } from "../schemas/users";
import { variantAttributeValues } from "../schemas/variant-attribute-values";
import { variants } from "../schemas/variants";

export const relations = defineRelations(
  {
    addresses,
    attribute_values,
    attributes,
    banners,
    brands,
    cart_items,
    carts,
    categories,
    categoryAttributes,
    couponUsages,
    coupons,
    mediaUploads,
    orderItems,
    orders,
    otps,
    productImages,
    products,
    siteSettings,
    users,
    variantAttributeValues,
    variants,
  },
  (r) => ({
    addresses: {
      user: r.one.users({
        from: r.addresses.user_id,
        to: r.users.id,
      }),
      orders: r.many.orders(),
    },

    attribute_values: {
      attribute: r.one.attributes({
        from: r.attribute_values.attribute_id,
        to: r.attributes.id,
      }),
      productVariants: r.many.variantAttributeValues(),
    },

    attributes: {
      attribute_values: r.many.attribute_values(),
      categories: r.many.categoryAttributes(),
    },

    brands: {
      products: r.many.products(),
    },

    categories: {
      parent: r.one.categories({
        from: r.categories.parent_id,
        to: r.categories.id,
      }),
      children: r.many.categories({
        from: r.categories.id,
        to: r.categories.parent_id,
      }),
      products: r.many.products(),
      category_attributes: r.many.categoryAttributes(),
    },

    cart_items: {
      cart: r.one.carts({
        from: r.cart_items.cart_id,
        to: r.carts.id,
        optional: false,
      }),
      variant: r.one.variants({
        from: r.cart_items.variant_id,
        to: r.variants.id,
        optional: false,
      }),
    },

    carts: {
      user: r.one.users({
        from: r.carts.user_id,
        to: r.users.id,
        optional: true,
      }),
      coupon: r.one.coupons({
        from: r.carts.coupon_id,
        to: r.coupons.id,
        optional: true,
      }),
      cart_items: r.many.cart_items(),
    },

    categoryAttributes: {
      category: r.one.categories({
        from: r.categoryAttributes.category_id,
        to: r.categories.id,
        optional: false,
      }),
      attribute: r.one.attributes({
        from: r.categoryAttributes.attribute_id,
        to: r.attributes.id,
        optional: false,
      }),
    },

    coupons: {
      carts: r.many.carts(),
      orders: r.many.orders(),
      couponUsages: r.many.couponUsages(),
    },

    couponUsages: {
      coupon: r.one.coupons({
        from: r.couponUsages.coupon_id,
        to: r.coupons.id,
        optional: false,
      }),
      user: r.one.users({
        from: r.couponUsages.user_id,
        to: r.users.id,
      }),
      order: r.one.orders({
        from: r.couponUsages.order_id,
        to: r.orders.id,
        optional: false,
      }),
    },

    mediaUploads: {
      uploader: r.one.users({
        from: r.mediaUploads.uploaded_by,
        to: r.users.id,
      }),
      product: r.one.products({
        from: r.mediaUploads.product_id,
        to: r.products.id,
      }),
    },

    orders: {
      user: r.one.users({
        from: r.orders.user_id,
        to: r.users.id,
      }),
      address: r.one.addresses({
        from: r.orders.address_id,
        to: r.addresses.id,
      }),
      coupon: r.one.coupons({
        from: r.orders.coupon_id,
        to: r.coupons.id,
      }),
      order_items: r.many.orderItems(),
      couponUsages: r.many.couponUsages(),
    },

    orderItems: {
      order: r.one.orders({
        from: r.orderItems.order_id,
        to: r.orders.id,
        optional: false,
      }),
      variant: r.one.variants({
        from: r.orderItems.variant_id,
        to: r.variants.id,
      }),
    },

    otps: {
      user: r.one.users({
        from: r.otps.user_id,
        to: r.users.id,
        optional: false,
      }),
    },

    productImages: {
      product: r.one.products({
        from: r.productImages.product_id,
        to: r.products.id,
        optional: false,
      }),
      variant: r.one.variants({
        from: r.productImages.variant_id,
        to: r.variants.id,
      }),
    },

    products: {
      user: r.one.users({
        from: r.products.created_by,
        to: r.users.id,
      }),
      brand: r.one.brands({
        from: r.products.brand_id,
        to: r.brands.id,
      }),
      category: r.one.categories({
        from: r.products.category_id,
        to: r.categories.id,
        optional: false,
      }),
      variants: r.many.variants(),
      images: r.many.productImages(),
      media_uploads: r.many.mediaUploads(),
    },

    variants: {
      product: r.one.products({
        from: r.variants.product_id,
        to: r.products.id,
        optional: false,
      }),
      orders: r.many.orderItems(),
      images: r.many.productImages(),
      cart_items: r.many.cart_items(),
      attribute_values: r.many.variantAttributeValues(),
    },

    users: {
      otp: r.one.otps({
        from: r.users.id,
        to: r.otps.user_id,
      }),
      addresses: r.many.addresses(),
      cart: r.one.carts({
        from: r.users.id,
        to: r.carts.user_id,
      }),
      couponUsages: r.many.couponUsages(),
      orders: r.many.orders(),
      products: r.many.products(),
      media_uploads: r.many.mediaUploads(),
    },

    variantAttributeValues: {
      product_variant: r.one.variants({
        from: r.variantAttributeValues.variant_id,
        to: r.variants.id,
        optional: false,
      }),
      product_attribute_value: r.one.attribute_values({
        from: r.variantAttributeValues.attribute_value_id,
        to: r.attribute_values.id,
        optional: false,
      }),
    },
  }),
);

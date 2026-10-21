/**
 * Zod validation schemas for all server-side mutations.
 */

import { z } from 'zod'

export const emailSchema = z.string().email().max(254).toLowerCase()
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
})

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: emailSchema,
  password: passwordSchema,
})

export const productVariantSchema = z.object({
  size: z.string().min(1).max(20),
  color: z.string().min(1).max(40),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().or(z.literal('')),
  stock: z.number().int().min(0).max(100000),
  priceDeltaPaise: z.number().int().min(-1000000).max(1000000).default(0),
})

export const productCreateSchema = z.object({
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase, hyphen-separated'),
  name: z.string().min(2).max(200),
  sku: z.string().min(2).max(40),
  shortDescription: z.string().max(300).optional(),
  description: z.string().min(10).max(5000),
  categoryId: z.string().min(1),
  pricePaise: z.number().int().min(0),
  salePricePaise: z.number().int().min(0).optional(),
  featured: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  fit: z.string().max(200).optional(),
  fabric: z.string().max(200).optional(),
  careInstructions: z.string().max(1000).optional(),
  specifications: z.record(z.string()).optional(),
  searchMetadata: z.array(z.string()).optional(),
  variants: z.array(productVariantSchema).min(1),
  images: z
    .array(
      z.object({
        url: z.string().url().or(z.string().regex(/^\//)),
        altText: z.string().max(200).optional(),
        position: z.number().int().default(0),
        isPrimary: z.boolean().default(false),
      })
    )
    .min(1),
  asset3dUrl: z.string().optional(),
})

export const cartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
})

export const addressSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(10).max(20).regex(/^[+0-9 -]+$/, 'Phone contains invalid characters'),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  pincode: z.string().min(6).max(10).regex(/^[0-9]+$/, 'PIN code must be numeric'),
  country: z.string().min(2).max(80).default('India'),
  isDefault: z.boolean().default(false),
})

export const checkoutSchema = z.object({
  cartId: z.string().min(1),
  email: z.string().email().optional(), // required for guests; ignored for logged-in users
  shippingAddress: addressSchema,
  billingAddressSame: z.boolean().default(true),
  billingAddress: addressSchema.optional(),
  couponCode: z.string().max(40).optional(),
  notes: z.string().max(500).optional(),
  idempotencyKey: z.string().min(8).max(120),
})

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: emailSchema,
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(5000),
})

export const newsletterSchema = z.object({
  email: emailSchema,
  name: z.string().max(120).optional(),
})

export const couponCreateSchema = z.object({
  code: z.string().min(2).max(40).uppercase(),
  description: z.string().max(300).optional(),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  discountValue: z.number().int().min(1),
  minOrderPaise: z.number().int().min(0).default(0),
  maxDiscountPaise: z.number().int().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
})

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
})

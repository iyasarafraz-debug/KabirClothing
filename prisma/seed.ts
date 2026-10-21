/**
 * KABIR CLOTHING — Seed script
 *
 * Seeds:
 *   - 1 admin user (using ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD from env)
 *   - Categories (with hierarchy)
 *   - 10 demo products with variants, images, and (where applicable) 3D assets
 *
 * Idempotent: safe to run repeatedly. Updates existing records in place.
 *
 * Run: `bun run db:seed`
 */

import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const INR = (rupees: number) => Math.round(rupees * 100) // rupees → paise

async function upsertCategory(slug: string, name: string, description: string, parentId?: string) {
  return db.category.upsert({
    where: { slug },
    update: { name, description, parentId: parentId ?? null },
    create: { slug, name, description, parentId: parentId ?? null },
  })
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

async function seedCategories() {
  const root = await upsertCategory('all', 'All', 'All Kabir Clothing products')

  const men = await upsertCategory('men', "Men's Collection", 'Contemporary menswear essentials')
  const women = await upsertCategory('women', "Women's Collection", 'Elevated everyday womenswear')

  await upsertCategory('t-shirts', 'T-Shirts', 'Premium cotton t-shirts', men.id)
  await upsertCategory('shirts', 'Shirts', 'Oxford, linen and overshirts', men.id)
  await upsertCategory('hoodies', 'Hoodies & Sweatshirts', 'Heavyweight hoodies and crewnecks', men.id)
  await upsertCategory('trousers', 'Trousers & Bottoms', 'Straight-fit trousers, cargos and denim', men.id)
  await upsertCategory('overshirts', 'Overshirts', 'Layering overshirts', men.id)

  await upsertCategory('women-tops', 'Tops', "Women's tops and tees", women.id)
  await upsertCategory('women-bottoms', 'Bottoms', "Women's trousers and skirts", women.id)

  return { root, men, women }
}

// ---------------------------------------------------------------------------
// 10 demo products
// ---------------------------------------------------------------------------

type VariantSpec = { size: string; color: string; colorHex: string; stock: number; priceDelta?: number }
type ImageSpec = { url: string; alt: string; position: number; isPrimary?: boolean }
type ProductSpec = {
  slug: string
  name: string
  sku: string
  shortDescription: string
  description: string
  categorySlug: string
  priceRupees: number
  salePriceRupees?: number
  featured?: boolean
  bestseller?: boolean
  newArrival?: boolean
  fit: string
  fabric: string
  care: string
  specifications: Record<string, string>
  searchMetadata: string[]
  variants: VariantSpec[]
  images: ImageSpec[]
  asset3dUrl?: string
}

const PRODUCTS: ProductSpec[] = [
  {
    slug: 'essential-oversized-t-shirt',
    name: 'Essential Oversized T-Shirt',
    sku: 'KC-TS-001',
    shortDescription: 'Boxy oversized organic cotton tee with a structured drop-shoulder fit.',
    description:
      'The Essential Oversized T-Shirt is the foundation of the Kabir wardrobe. Cut from 240 GSM organic combed cotton, it has a deliberately boxy silhouette, dropped shoulders, and a clean ribbed crew neck. Designed to layer effortlessly under overshirts or stand alone with tailored trousers, this is the kind of tee you reach for every morning. Pre-shrunk and garment-dyed for a soft, lived-in handfeel from the first wear.',
    categorySlug: 't-shirts',
    priceRupees: 1490,
    salePriceRupees: 1190,
    featured: true,
    bestseller: true,
    newArrival: true,
    fit: 'Oversized — boxy fit, true to size for a relaxed look. Size down for a closer fit.',
    fabric: '100% organic combed cotton, 240 GSM, pre-shrunk.',
    care: 'Machine wash cold inside-out with similar colours. Do not bleach. Tumble dry low. Cool iron if needed.',
    specifications: {
      GSM: '240',
      Fit: 'Oversized / Boxy',
      Neck: 'Ribbed crew',
      Sleeve: 'Drop-shoulder short sleeve',
      Origin: 'Made in India',
    },
    searchMetadata: ['oversized tee', 'boxy t-shirt', 'organic cotton', 'streetwear', 'essential tee', 'drop shoulder'],
    variants: [
      { size: 'S', color: 'Ivory', colorHex: '#F5F0E8', stock: 24 },
      { size: 'M', color: 'Ivory', colorHex: '#F5F0E8', stock: 32 },
      { size: 'L', color: 'Ivory', colorHex: '#F5F0E8', stock: 28 },
      { size: 'XL', color: 'Ivory', colorHex: '#F5F0E8', stock: 16 },
      { size: 'S', color: 'Charcoal', colorHex: '#282828', stock: 18 },
      { size: 'M', color: 'Charcoal', colorHex: '#282828', stock: 22 },
      { size: 'L', color: 'Charcoal', colorHex: '#282828', stock: 20 },
      { size: 'XL', color: 'Charcoal', colorHex: '#282828', stock: 12 },
      { size: 'M', color: 'Stone', colorHex: '#D8D0C4', stock: 14 },
      { size: 'L', color: 'Stone', colorHex: '#D8D0C4', stock: 10 },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80', alt: 'Essential Oversized T-Shirt — front view', position: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=80', alt: 'Essential Oversized T-Shirt — detail', position: 1 },
      { url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=80', alt: 'Essential Oversized T-Shirt — back', position: 2 },
    ],
    asset3dUrl: '/models/t-shirt.glb',
  },
  {
    slug: 'premium-heavyweight-t-shirt',
    name: 'Premium Heavyweight T-Shirt',
    sku: 'KC-TS-002',
    shortDescription: 'Dense 280 GSM cotton with a clean, regular fit and reinforced collar.',
    description:
      'The Premium Heavyweight T-Shirt is built to last. Made from a dense 280 GSM long-staple cotton jersey, it has a clean regular fit, a reinforced ribbed collar, and double-needle stitching throughout. The heavier fabric drapes cleanly and resists stretching out, making it ideal on its own or as a layering base. A premium essential for those who want substance, not just style.',
    categorySlug: 't-shirts',
    priceRupees: 1790,
    bestseller: true,
    fit: 'Regular — true to size.',
    fabric: '100% long-staple cotton, 280 GSM, pre-shrunk.',
    care: 'Machine wash cold. Do not bleach. Tumble dry low. Cool iron. Do not dry clean.',
    specifications: {
      GSM: '280',
      Fit: 'Regular',
      Neck: 'Reinforced ribbed crew',
      Sleeve: 'Short sleeve',
      Origin: 'Made in India',
    },
    searchMetadata: ['heavyweight tee', 'premium t-shirt', 'dense cotton', 'structured tee'],
    variants: [
      { size: 'S', color: 'Black', colorHex: '#111111', stock: 20 },
      { size: 'M', color: 'Black', colorHex: '#111111', stock: 26 },
      { size: 'L', color: 'Black', colorHex: '#111111', stock: 24 },
      { size: 'XL', color: 'Black', colorHex: '#111111', stock: 14 },
      { size: 'S', color: 'Ivory', colorHex: '#F5F0E8', stock: 16 },
      { size: 'M', color: 'Ivory', colorHex: '#F5F0E8', stock: 22 },
      { size: 'L', color: 'Ivory', colorHex: '#F5F0E8', stock: 18 },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=80', alt: 'Premium Heavyweight T-Shirt — front', position: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200&q=80', alt: 'Premium Heavyweight T-Shirt — detail', position: 1 },
    ],
  },
  {
    slug: 'classic-oxford-shirt',
    name: 'Classic Oxford Shirt',
    sku: 'KC-SH-001',
    shortDescription: 'Timeless oxford-cloth button-down with a button-down collar.',
    description:
      'A wardrobe cornerstone. The Classic Oxford Shirt is woven from a substantial cotton oxford cloth with a soft, brushed handfeel and a subtle texture that catches the light. Features a traditional button-down collar, mother-of-pearl-style buttons, a back yoke with a box pleat, and a clean, slightly tailored silhouette. Equally at home under a blazer or worn open over a tee.',
    categorySlug: 'shirts',
    priceRupees: 2990,
    featured: true,
    bestseller: true,
    fit: 'Tailored regular — true to size.',
    fabric: '100% cotton oxford, 180 GSM.',
    care: 'Machine wash cold. Hang to dry. Warm iron. Dry clean optional.',
    specifications: {
      Fabric: 'Cotton oxford',
      GSM: '180',
      Collar: 'Button-down',
      Buttons: 'Mother-of-pearl style',
      Origin: 'Made in India',
    },
    searchMetadata: ['oxford shirt', 'button down', 'formal shirt', 'mens shirt', 'classic shirt'],
    variants: [
      { size: 'S', color: 'White', colorHex: '#FFFFFF', stock: 18 },
      { size: 'M', color: 'White', colorHex: '#FFFFFF', stock: 24 },
      { size: 'L', color: 'White', colorHex: '#FFFFFF', stock: 20 },
      { size: 'XL', color: 'White', colorHex: '#FFFFFF', stock: 12 },
      { size: 'M', color: 'Sky Blue', colorHex: '#AEC6E0', stock: 16 },
      { size: 'L', color: 'Sky Blue', colorHex: '#AEC6E0', stock: 14 },
      { size: 'M', color: 'Pink', colorHex: '#E8C5C5', stock: 8 },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3cc6?w=1200&q=80', alt: 'Classic Oxford Shirt — front', position: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=1200&q=80', alt: 'Classic Oxford Shirt — detail', position: 1 },
    ],
  },
  {
    slug: 'relaxed-linen-shirt',
    name: 'Relaxed Linen Shirt',
    sku: 'KC-SH-002',
    shortDescription: 'Breathable European linen with a relaxed, holiday-ready silhouette.',
    description:
      'The Relaxed Linen Shirt is cut from 100% European flax linen, prized for its breathability and natural lustre. It has a relaxed body, a soft camp collar, and a clean back yoke. The fabric softens with every wash and develops a relaxed character that only linen can. A warm-weather essential for both city and travel wardrobes.',
    categorySlug: 'shirts',
    priceRupees: 3490,
    newArrival: true,
    fit: 'Relaxed — true to size. Size down for a closer fit.',
    fabric: '100% European linen, 160 GSM.',
    care: 'Machine wash cold. Hang to dry. Warm iron while damp for a crisp finish.',
    specifications: {
      Fabric: 'European linen',
      GSM: '160',
      Collar: 'Camp collar',
      Origin: 'Made in India',
    },
    searchMetadata: ['linen shirt', 'camp collar', 'summer shirt', 'relaxed shirt', 'holiday shirt'],
    variants: [
      { size: 'S', color: 'Sand', colorHex: '#D8D0C4', stock: 14 },
      { size: 'M', color: 'Sand', colorHex: '#D8D0C4', stock: 20 },
      { size: 'L', color: 'Sand', colorHex: '#D8D0C4', stock: 16 },
      { size: 'M', color: 'Olive', colorHex: '#6B7252', stock: 12 },
      { size: 'L', color: 'Olive', colorHex: '#6B7252', stock: 10 },
      { size: 'M', color: 'Ivory', colorHex: '#F5F0E8', stock: 14 },
      { size: 'L', color: 'Ivory', colorHex: '#F5F0E8', stock: 12 },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=1200&q=80', alt: 'Relaxed Linen Shirt — front', position: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1620012253295-c15cc533359d?w=1200&q=80', alt: 'Relaxed Linen Shirt — detail', position: 1 },
    ],
  },
  {
    slug: 'signature-hoodie',
    name: 'Signature Hoodie',
    sku: 'KC-HD-001',
    shortDescription: 'Heavyweight 480 GSM fleece hoodie with double-lined hood and metal tipped drawcords.',
    description:
      'The Signature Hoodie is the centerpiece of the Kabir streetwear line. Built from a substantial 480 GSM brushed-back fleece, it has a structured double-lined hood, metal-tipped flat drawcords, a kangaroo pocket with hidden seams, and ribbed cuffs and hem that hold their shape. Boxy, premium, and built to be lived in.',
    categorySlug: 'hoodies',
    priceRupees: 4990,
    salePriceRupees: 4490,
    featured: true,
    bestseller: true,
    fit: 'Boxy regular — true to size.',
    fabric: '80% cotton / 20% polyester brushed-back fleece, 480 GSM.',
    care: 'Machine wash cold inside-out. Do not bleach. Tumble dry low. Do not iron print.',
    specifications: {
      GSM: '480',
      Fit: 'Boxy regular',
      Hood: 'Double-lined',
      Drawcords: 'Metal-tipped flat',
      Origin: 'Made in India',
    },
    searchMetadata: ['hoodie', 'heavyweight hoodie', 'fleece', 'streetwear hoodie', 'boxy hoodie'],
    variants: [
      { size: 'S', color: 'Black', colorHex: '#111111', stock: 16 },
      { size: 'M', color: 'Black', colorHex: '#111111', stock: 22 },
      { size: 'L', color: 'Black', colorHex: '#111111', stock: 20 },
      { size: 'XL', color: 'Black', colorHex: '#111111', stock: 12 },
      { size: 'M', color: 'Stone', colorHex: '#D8D0C4', stock: 14 },
      { size: 'L', color: 'Stone', colorHex: '#D8D0C4', stock: 12 },
      { size: 'M', color: 'Olive', colorHex: '#6B7252', stock: 10 },
      { size: 'L', color: 'Olive', colorHex: '#6B7252', stock: 8 },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80', alt: 'Signature Hoodie — front', position: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=80', alt: 'Signature Hoodie — detail', position: 1 },
      { url: 'https://images.unsplash.com/photo-1556821833-cb4bea2d2d6f?w=1200&q=80', alt: 'Signature Hoodie — back', position: 2 },
    ],
    asset3dUrl: '/models/hoodie.glb',
  },
  {
    slug: 'minimal-crewneck-sweatshirt',
    name: 'Minimal Crewneck Sweatshirt',
    sku: 'KC-HD-002',
    shortDescription: 'Clean 380 GSM crewneck with set-in sleeves and a soft brushed interior.',
    description:
      'The Minimal Crewneck Sweatshirt is a study in restraint. No logos, no extraneous detailing — just a clean set-in sleeve silhouette, a ribbed crew neck, and a soft 380 GSM brushed-back fleece. The clean finish makes it equally wearable under tailoring or with denim. A versatile mid-weight layer.',
    categorySlug: 'hoodies',
    priceRupees: 3990,
    newArrival: true,
    fit: 'Regular — true to size.',
    fabric: '80% cotton / 20% polyester brushed-back fleece, 380 GSM.',
    care: 'Machine wash cold inside-out. Tumble dry low. Cool iron if needed.',
    specifications: {
      GSM: '380',
      Fit: 'Regular',
      Neck: 'Ribbed crew',
      Origin: 'Made in India',
    },
    searchMetadata: ['crewneck', 'sweatshirt', 'minimal', 'fleece crewneck'],
    variants: [
      { size: 'S', color: 'Ivory', colorHex: '#F5F0E8', stock: 14 },
      { size: 'M', color: 'Ivory', colorHex: '#F5F0E8', stock: 18 },
      { size: 'L', color: 'Ivory', colorHex: '#F5F0E8', stock: 16 },
      { size: 'M', color: 'Black', colorHex: '#111111', stock: 14 },
      { size: 'L', color: 'Black', colorHex: '#111111', stock: 12 },
      { size: 'M', color: 'Stone', colorHex: '#D8D0C4', stock: 10 },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80', alt: 'Minimal Crewneck Sweatshirt — front', position: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1572495532884-2add8e4fdccc?w=1200&q=80', alt: 'Minimal Crewneck Sweatshirt — detail', position: 1 },
    ],
  },
  {
    slug: 'everyday-straight-fit-trousers',
    name: 'Everyday Straight-Fit Trousers',
    sku: 'KC-TR-001',
    shortDescription: 'Clean straight-leg trousers in a structured cotton-twill with a clean drape.',
    description:
      'The Everyday Straight-Fit Trousers are designed to be the most versatile pair in your rotation. Cut from a structured 320 GSM cotton twill with a touch of stretch, they sit cleanly at the natural waist and fall in a straight line from hip to hem. Features a clean flat front, slanted side pockets, and welted back pockets. Smart enough for the office, relaxed enough for the weekend.',
    categorySlug: 'trousers',
    priceRupees: 3290,
    featured: true,
    fit: 'Straight — true to size. Sits at natural waist.',
    fabric: '98% cotton / 2% elastane twill, 320 GSM.',
    care: 'Machine wash cold. Hang to dry. Warm iron.',
    specifications: {
      Fabric: 'Cotton twill with stretch',
      GSM: '320',
      Fit: 'Straight',
      Rise: 'Mid',
      Origin: 'Made in India',
    },
    searchMetadata: ['trousers', 'straight fit', 'chinos', 'cotton trousers', 'mens pants'],
    variants: [
      { size: '30', color: 'Charcoal', colorHex: '#282828', stock: 12 },
      { size: '32', color: 'Charcoal', colorHex: '#282828', stock: 18 },
      { size: '34', color: 'Charcoal', colorHex: '#282828', stock: 14 },
      { size: '32', color: 'Stone', colorHex: '#D8D0C4', stock: 12 },
      { size: '34', color: 'Stone', colorHex: '#D8D0C4', stock: 10 },
      { size: '32', color: 'Black', colorHex: '#111111', stock: 14 },
      { size: '34', color: 'Black', colorHex: '#111111', stock: 12 },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=1200&q=80', alt: 'Everyday Straight-Fit Trousers — front', position: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1200&q=80', alt: 'Everyday Straight-Fit Trousers — detail', position: 1 },
    ],
  },
  {
    slug: 'relaxed-cargo-pants',
    name: 'Relaxed Cargo Pants',
    sku: 'KC-TR-002',
    shortDescription: 'Relaxed cargos with bellowed pockets and a tapered ankle.',
    description:
      'The Relaxed Cargo Pants balance utility and contemporary silhouette. Cut from a midweight cotton twill, they sit relaxed through the thigh and taper cleanly to the ankle. Bellowed cargo pockets sit flat against the leg, and a clean back yoke keeps the silhouette sharp. A versatile alternative to jeans or chinos.',
    categorySlug: 'trousers',
    priceRupees: 3790,
    newArrival: true,
    bestseller: true,
    fit: 'Relaxed tapered — true to size.',
    fabric: '100% cotton twill, 280 GSM.',
    care: 'Machine wash cold. Tumble dry low. Warm iron.',
    specifications: {
      Fabric: 'Cotton twill',
      GSM: '280',
      Fit: 'Relaxed tapered',
      Pockets: '6 (including bellowed cargo)',
      Origin: 'Made in India',
    },
    searchMetadata: ['cargo pants', 'relaxed fit', 'utility pants', 'mens cargo', 'tapered cargo'],
    variants: [
      { size: '30', color: 'Olive', colorHex: '#6B7252', stock: 14 },
      { size: '32', color: 'Olive', colorHex: '#6B7252', stock: 18 },
      { size: '34', color: 'Olive', colorHex: '#6B7252', stock: 14 },
      { size: '32', color: 'Black', colorHex: '#111111', stock: 12 },
      { size: '34', color: 'Black', colorHex: '#111111', stock: 10 },
      { size: '32', color: 'Sand', colorHex: '#D8D0C4', stock: 10 },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=1200&q=80', alt: 'Relaxed Cargo Pants — front', position: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1200&q=80', alt: 'Relaxed Cargo Pants — detail', position: 1 },
    ],
  },
  {
    slug: 'premium-denim-jeans',
    name: 'Premium Denim Jeans',
    sku: 'KC-TR-003',
    shortDescription: 'Japanese-style 13.5 oz selvedge denim with a clean straight fit.',
    description:
      'The Premium Denim Jeans are cut from a substantial 13.5 oz selvedge denim woven with a clean, deep indigo warp and a soft grey weft. They have a clean straight fit, a mid rise, and contrast stitching. Designed to break in and age beautifully with wear — these are jeans that become uniquely yours.',
    categorySlug: 'trousers',
    priceRupees: 5490,
    bestseller: true,
    fit: 'Straight — true to size. Mid rise.',
    fabric: '100% cotton selvedge denim, 13.5 oz.',
    care: 'Wash sparingly, inside-out, in cold water. Hang to dry. Do not bleach.',
    specifications: {
      Fabric: 'Selvedge denim',
      Weight: '13.5 oz',
      Fit: 'Straight',
      Rise: 'Mid',
      Origin: 'Made in India',
    },
    searchMetadata: ['jeans', 'denim', 'selvedge', 'straight jeans', 'premium denim'],
    variants: [
      { size: '30', color: 'Indigo', colorHex: '#2B3A55', stock: 12 },
      { size: '32', color: 'Indigo', colorHex: '#2B3A55', stock: 16 },
      { size: '34', color: 'Indigo', colorHex: '#2B3A55', stock: 14 },
      { size: '36', color: 'Indigo', colorHex: '#2B3A55', stock: 8 },
      { size: '32', color: 'Washed Black', colorHex: '#1F1F1F', stock: 10 },
      { size: '34', color: 'Washed Black', colorHex: '#1F1F1F', stock: 8 },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200&q=80', alt: 'Premium Denim Jeans — front', position: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1604176354204-9268737826e4?w=1200&q=80', alt: 'Premium Denim Jeans — detail', position: 1 },
    ],
  },
  {
    slug: 'signature-overshirt',
    name: 'Signature Overshirt',
    sku: 'KC-OS-001',
    shortDescription: 'Heavyweight twill overshirt with twin chest pockets and horn-style buttons.',
    description:
      'The Signature Overshirt is the layering piece your wardrobe needs. Cut from a heavyweight 360 GSM cotton twill, it has the structure of a light jacket and the softness of a shirt. Features twin buttoned chest pockets, horn-style buttons, a clean back yoke, and a slightly relaxed fit that layers cleanly over tees and lightweight knitwear.',
    categorySlug: 'overshirts',
    priceRupees: 4990,
    salePriceRupees: 4490,
    featured: true,
    newArrival: true,
    fit: 'Relaxed — true to size.',
    fabric: '100% cotton twill, 360 GSM.',
    care: 'Machine wash cold inside-out. Hang to dry. Warm iron.',
    specifications: {
      Fabric: 'Cotton twill',
      GSM: '360',
      Fit: 'Relaxed',
      Buttons: 'Horn-style',
      Origin: 'Made in India',
    },
    searchMetadata: ['overshirt', 'shacket', 'heavyweight shirt', 'layering shirt'],
    variants: [
      { size: 'S', color: 'Olive', colorHex: '#6B7252', stock: 12 },
      { size: 'M', color: 'Olive', colorHex: '#6B7252', stock: 16 },
      { size: 'L', color: 'Olive', colorHex: '#6B7252', stock: 14 },
      { size: 'M', color: 'Black', colorHex: '#111111', stock: 10 },
      { size: 'L', color: 'Black', colorHex: '#111111', stock: 10 },
      { size: 'M', color: 'Stone', colorHex: '#D8D0C4', stock: 8 },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80', alt: 'Signature Overshirt — front', position: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=1200&q=80', alt: 'Signature Overshirt — detail', position: 1 },
    ],
    asset3dUrl: '/models/overshirt.glb',
  },
]

// ---------------------------------------------------------------------------
// Admin user
// ---------------------------------------------------------------------------

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@kabirclothing.example'
  const password = process.env.ADMIN_INITIAL_PASSWORD ?? 'ChangeMeOnFirstLogin!2025'
  const passwordHash = await bcrypt.hash(password, 12)

  const user = await db.user.upsert({
    where: { email },
    update: { role: UserRole.ADMIN, passwordHash, name: 'Kabir Admin' },
    create: {
      email,
      name: 'Kabir Admin',
      role: UserRole.ADMIN,
      passwordHash,
      emailVerified: new Date(),
    },
  })

  console.log(`  ✓ Admin user ready — email: ${email} (role: ADMIN)`)
  return user
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

async function seedCoupons() {
  await db.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: '10% off your first order',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderPaise: INR(1500),
      maxDiscountPaise: INR(500),
      isActive: true,
    },
  })

  await db.coupon.upsert({
    where: { code: 'FLAT200' },
    update: {
      discountValue: INR(200),
      minOrderPaise: INR(2500),
    },
    create: {
      code: 'FLAT200',
      description: 'Flat ₹200 off on orders above ₹2500',
      discountType: 'FLAT',
      discountValue: INR(200), // 20000 paise = ₹200
      minOrderPaise: INR(2500),
      isActive: true,
    },
  })

  console.log('  ✓ Coupons seeded: WELCOME10, FLAT200')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('→ Seeding categories…')
  await seedCategories()

  console.log('→ Seeding admin user…')
  await seedAdmin()

  console.log('→ Seeding coupons…')
  await seedCoupons()

  console.log('→ Seeding products…')
  for (const spec of PRODUCTS) {
    const category = await db.category.findUnique({ where: { slug: spec.categorySlug } })
    if (!category) throw new Error(`Category not found: ${spec.categorySlug}`)

    const product = await db.product.upsert({
      where: { slug: spec.slug },
      update: {
        name: spec.name,
        sku: spec.sku,
        shortDescription: spec.shortDescription,
        description: spec.description,
        categoryId: category.id,
        pricePaise: INR(spec.priceRupees),
        salePricePaise: spec.salePriceRupees ? INR(spec.salePriceRupees) : null,
        featured: spec.featured ?? false,
        bestseller: spec.bestseller ?? false,
        newArrival: spec.newArrival ?? false,
        fit: spec.fit,
        fabric: spec.fabric,
        careInstructions: spec.care,
        specifications: JSON.stringify(spec.specifications),
        searchMetadata: JSON.stringify(spec.searchMetadata),
        isActive: true,
      },
      create: {
        slug: spec.slug,
        name: spec.name,
        sku: spec.sku,
        shortDescription: spec.shortDescription,
        description: spec.description,
        categoryId: category.id,
        pricePaise: INR(spec.priceRupees),
        salePricePaise: spec.salePriceRupees ? INR(spec.salePriceRupees) : null,
        featured: spec.featured ?? false,
        bestseller: spec.bestseller ?? false,
        newArrival: spec.newArrival ?? false,
        fit: spec.fit,
        fabric: spec.fabric,
        careInstructions: spec.care,
        specifications: JSON.stringify(spec.specifications),
        searchMetadata: JSON.stringify(spec.searchMetadata),
        isActive: true,
      },
    })

    // Variants: replace all on each seed for idempotency
    await db.productVariant.deleteMany({ where: { productId: product.id } })
    for (const v of spec.variants) {
      await db.productVariant.create({
        data: {
          productId: product.id,
          sku: `${spec.sku}-${v.size}-${v.color.toUpperCase().replace(/\s+/g, '')}`,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          stock: v.stock,
          priceDeltaPaise: v.priceDelta ?? 0,
          isActive: true,
        },
      })
    }

    // Images: replace all on each seed
    await db.productImage.deleteMany({ where: { productId: product.id } })
    for (const img of spec.images) {
      await db.productImage.create({
        data: {
          productId: product.id,
          url: img.url,
          altText: img.alt,
          position: img.position,
          isPrimary: img.isPrimary ?? false,
        },
      })
    }

    // 3D asset: replace if present
    if (spec.asset3dUrl) {
      await db.product3DAsset.deleteMany({ where: { productId: product.id } })
      await db.product3DAsset.create({
        data: {
          productId: product.id,
          modelUrl: spec.asset3dUrl,
          format: 'glb',
          scale: 1.0,
        },
      })
    }

    console.log(`  ✓ ${product.name} (${spec.variants.length} variants)`)
  }

  console.log('→ Seed complete.')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })

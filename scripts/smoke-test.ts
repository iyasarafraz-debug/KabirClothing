/**
 * Kabir Clothing — Smoke test
 *
 * Verifies the critical pieces of the application without requiring the
 * dev server to be running. Tests:
 *   1. Database connectivity and schema integrity
 *   2. All 10 demo products exist with variants
 *   3. Admin user is provisioned
 *   4. Coupons are seeded
 *   5. Product query helpers work
 *   6. Cart totals calculation is correct
 *   7. Password hashing round-trips
 *   8. Razorpay signature verification rejects bad signatures
 *   9. Coupon validation logic
 *
 * Run: `bun run scripts/smoke-test.ts`
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { verifyPaymentSignature, verifyWebhookSignature, isRazorpayConfigured } from '../src/lib/payment'
import { applyCoupon } from '../src/lib/coupon'
import { cartTotals } from '../src/lib/cart-server'
import { formatINR, rupeesToPaise, paiseToRupees, generateOrderNumber, slugify, parseAddress } from '../src/lib/format'

const db = new PrismaClient()

let passed = 0
let failed = 0

function ok(name: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`  ✓ ${name}${details ? ` — ${details}` : ''}`)
    passed++
  } else {
    console.log(`  ✗ ${name}${details ? ` — ${details}` : ''}`)
    failed++
  }
}

async function testDatabase() {
  console.log('\n→ Database & seed verification')
  const productCount = await db.product.count()
  ok('10 demo products seeded', productCount === 10, `count: ${productCount}`)

  const variantCount = await db.productVariant.count()
  ok('Product variants exist', variantCount > 60, `count: ${variantCount}`)

  const categoryCount = await db.category.count()
  ok('Categories seeded', categoryCount >= 7, `count: ${categoryCount}`)

  const adminUser = await db.user.findUnique({ where: { email: 'admin@kabirclothing.example' } })
  ok('Admin user exists', !!adminUser, adminUser?.role)
  ok('Admin user has ADMIN role', adminUser?.role === 'ADMIN')
  ok('Admin password is hashed', !!adminUser?.passwordHash && !adminUser.passwordHash.includes('ChangeMe'))

  const coupons = await db.coupon.count()
  ok('Coupons seeded', coupons >= 2, `count: ${coupons}`)

  const welcomeCoupon = await db.coupon.findUnique({ where: { code: 'WELCOME10' } })
  ok('WELCOME10 coupon exists', !!welcomeCoupon)
  ok('WELCOME10 is 10% off', welcomeCoupon?.discountType === 'PERCENTAGE' && welcomeCoupon?.discountValue === 10)
}

async function testProductData() {
  console.log('\n→ Product data integrity')
  const products = await db.product.findMany({ include: { variants: true, images: true, category: true } })

  for (const p of products) {
    ok(`${p.name} has variants`, p.variants.length > 0, `${p.variants.length} variants`)
    ok(`${p.name} has images`, p.images.length > 0, `${p.images.length} images`)
    ok(`${p.name} has category`, !!p.category, p.category.name)
    ok(`${p.name} has description`, p.description.length > 50, `${p.description.length} chars`)
    ok(`${p.name} price in paise`, p.pricePaise > 100, `₹${p.pricePaise / 100}`)
  }

  // Featured, bestseller, newArrival flags
  const featured = products.filter((p) => p.featured).length
  const bestsellers = products.filter((p) => p.bestseller).length
  const newArrivals = products.filter((p) => p.newArrival).length
  ok('Has featured products', featured >= 3, `${featured} featured`)
  ok('Has bestsellers', bestsellers >= 3, `${bestsellers} bestsellers`)
  ok('Has new arrivals', newArrivals >= 3, `${newArrivals} new arrivals`)

  // 3D assets
  const with3d = await db.product3DAsset.count()
  ok('Has 3D asset references', with3d >= 3, `${with3d} products with 3D`)
}

async function testPasswordHashing() {
  console.log('\n→ Password hashing (bcrypt)')
  const password = 'TestPassword123!'
  const hash = await bcrypt.hash(password, 12)
  ok('Hash is not plain text', hash !== password)
  ok('Hash starts with $2', hash.startsWith('$2'))
  ok('Verify accepts correct password', await bcrypt.compare(password, hash))
  ok('Verify rejects wrong password', !(await bcrypt.compare('wrong', hash)))
}

function testRazorpaySignatureVerification() {
  console.log('\n→ Razorpay signature verification (without keys configured)')
  // Without keys, verification should always return false
  ok('Gateway not configured in test env', !isRazorpayConfigured())
  ok('Payment signature rejected without keys', !verifyPaymentSignature({
    orderId: 'test',
    paymentId: 'test',
    signature: 'fake',
  }))
  ok('Webhook signature rejected without keys', !verifyWebhookSignature({
    body: 'test',
    signature: 'fake',
  }))
}

function testHmacSafeComparison() {
  console.log('\n→ HMAC timing-safe comparison')
  // Test the underlying logic by computing an HMAC and comparing
  const secret = 'test-secret'
  const message = 'order_abc|pay_xyz'
  const expected = crypto.createHmac('sha256', secret).update(message).digest('hex')
  const equalSig = crypto.createHmac('sha256', secret).update(message).digest('hex')
  ok('Equal HMACs match', crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(equalSig, 'hex')))

  // Different-content HMAC (same length) — should return false, not throw
  const tamperedSig = crypto.createHmac('sha256', 'wrong-secret').update(message).digest('hex')
  ok('Different HMACs reject cleanly', !crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(tamperedSig, 'hex')))

  // Different-length buffers — should throw (must be caught in real code)
  try {
    crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from('abc', 'utf8'))
    ok('Different-length HMACs throw', false)
  } catch {
    ok('Different-length HMACs throw', true)
  }
}

async function testCouponValidation() {
  console.log('\n→ Coupon validation logic')
  // WELCOME10: 10% off, min ₹1500, max ₹500
  const result1 = await applyCoupon('WELCOME10', 200000) // ₹2000
  ok('WELCOME10 applies on ₹2000 order', result1.ok, `discount: ${result1.discountPaise / 100}`)
  ok('WELCOME10 discount is 10% (₹200)', result1.discountPaise === 20000)

  const result2 = await applyCoupon('WELCOME10', 100000) // ₹1000 — below minimum
  ok('WELCOME10 rejected below min ₹1500', !result2.ok)

  const result3 = await applyCoupon('FAKE', 500000)
  ok('Unknown coupon rejected', !result3.ok)

  // FLAT200: ₹200 off, min ₹2500
  const result4 = await applyCoupon('FLAT200', 300000) // ₹3000
  ok('FLAT200 applies on ₹3000 order', result4.ok, `discount: ${result4.discountPaise / 100}`)
  ok('FLAT200 discount is ₹200', result4.discountPaise === 20000)
}

function testCartTotals() {
  console.log('\n→ Cart totals calculation')
  // Empty cart
  const t1 = cartTotals([])
  ok('Empty cart has 0 total', t1.totalPaise === 0)
  ok('Empty cart has 0 shipping', t1.shippingPaise === 0)

  // Cart below free-shipping threshold
  const t2 = cartTotals([{ unitPricePaise: 50000, quantity: 1 }]) // ₹500
  ok('Cart below ₹1500 has ₹99 shipping', t2.shippingPaise === 9900)
  ok('Cart ₹500 + ₹99 = ₹599', t2.totalPaise === 59900)

  // Cart at free-shipping threshold
  const t3 = cartTotals([{ unitPricePaise: 150000, quantity: 1 }]) // ₹1500
  ok('Cart at ₹1500 has free shipping', t3.shippingPaise === 0)

  // Cart above threshold
  const t4 = cartTotals([{ unitPricePaise: 100000, quantity: 2 }]) // ₹2000
  ok('Cart above ₹1500 has free shipping', t4.shippingPaise === 0)
  ok('Cart total is subtotal when shipping free', t4.totalPaise === 200000)
}

function testFormatting() {
  console.log('\n→ Formatting helpers')
  ok('formatINR formats paise to ₹', formatINR(149000) === '₹1,490')
  ok('rupeesToPaise converts', rupeesToPaise(1490) === 149000)
  ok('paiseToRupees converts', paiseToRupees(149000) === 1490)
  const orderNumber = generateOrderNumber()
  ok('Order number starts with KC-', orderNumber.startsWith('KC-'))
  ok('Order number has date', /^KC-\d{8}-/.test(orderNumber))
  ok('slugify works', slugify('Hello World!') === 'hello-world')
  ok('parseAddress returns null for invalid JSON', parseAddress('invalid') === null)
  ok('parseAddress returns object for valid JSON', parseAddress('{"city":"Mumbai"}')?.city === 'Mumbai')
  ok('parseAddress returns null for null input', parseAddress(null) === null)
}

async function testStockValidation() {
  console.log('\n→ Stock validation (database-level)')
  // Find a variant with low stock (< 10 — our admin threshold for low-stock alerts)
  const lowStockVariant = await db.productVariant.findFirst({
    where: { stock: { gt: 0, lt: 10 } },
  })
  if (lowStockVariant) {
    ok('Found a low-stock variant for testing', true, `${lowStockVariant.size}/${lowStockVariant.color}: ${lowStockVariant.stock} in stock`)
  } else {
    // Forcibly create one for the test
    const v = await db.productVariant.findFirst()
    if (v) {
      const original = v.stock
      await db.productVariant.update({ where: { id: v.id }, data: { stock: 5 } })
      const refreshed = await db.productVariant.findUnique({ where: { id: v.id } })
      ok('Forced low-stock variant for testing', refreshed?.stock === 5, `${refreshed?.size}/${refreshed?.color}`)
      await db.productVariant.update({ where: { id: v.id }, data: { stock: original } })
    }
  }

  // Out-of-stock test
  const v = await db.productVariant.findFirst()
  if (v) {
    const original = v.stock
    await db.productVariant.update({ where: { id: v.id }, data: { stock: 0 } })
    const refreshed = await db.productVariant.findUnique({ where: { id: v.id } })
    ok('Can set stock to 0 (out of stock)', refreshed?.stock === 0)
    await db.productVariant.update({ where: { id: v.id }, data: { stock: original } })
  }
}

async function main() {
  console.log('═══════════════════════════════════════════')
  console.log(' KABIR CLOTHING — SMOKE TEST')
  console.log('═══════════════════════════════════════════')

  await testDatabase()
  await testProductData()
  await testPasswordHashing()
  testRazorpaySignatureVerification()
  testHmacSafeComparison()
  await testCouponValidation()
  testCartTotals()
  testFormatting()
  await testStockValidation()

  console.log('\n═══════════════════════════════════════════')
  console.log(` Result: ${passed} passed, ${failed} failed`)
  console.log('═══════════════════════════════════════════')

  if (failed > 0) {
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('Smoke test crashed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })

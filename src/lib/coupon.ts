/**
 * Coupon validation logic.
 */

import { db } from '@/lib/db'

export async function applyCoupon(
  code: string,
  subtotalPaise: number
): Promise<{ ok: boolean; discountPaise: number; couponId?: string; message?: string }> {
  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase().trim() } })
  if (!coupon || !coupon.isActive) {
    return { ok: false, discountPaise: 0, message: 'Invalid coupon code' }
  }
  const now = new Date()
  if (coupon.startsAt && coupon.startsAt > now) {
    return { ok: false, discountPaise: 0, message: 'Coupon not yet active' }
  }
  if (coupon.endsAt && coupon.endsAt < now) {
    return { ok: false, discountPaise: 0, message: 'Coupon has expired' }
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, discountPaise: 0, message: 'Coupon usage limit reached' }
  }
  if (subtotalPaise < coupon.minOrderPaise) {
    return {
      ok: false,
      discountPaise: 0,
      message: `Minimum order ₹${(coupon.minOrderPaise / 100).toFixed(0)} required`,
    }
  }
  let discountPaise = 0
  if (coupon.discountType === 'PERCENTAGE') {
    discountPaise = Math.round((subtotalPaise * coupon.discountValue) / 100)
    if (coupon.maxDiscountPaise) {
      discountPaise = Math.min(discountPaise, coupon.maxDiscountPaise)
    }
  } else {
    discountPaise = Math.min(coupon.discountValue, subtotalPaise)
  }
  return { ok: true, discountPaise, couponId: coupon.id }
}

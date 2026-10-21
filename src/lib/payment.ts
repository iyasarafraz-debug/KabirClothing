/**
 * Razorpay integration — TEST MODE by default.
 *
 * Live mode requires the owner to set RAZORPAY_LIVE_MODE=true and
 * provide production keys. The server NEVER trusts a client-side success
 * message — payments are verified via signature check.
 *
 * This file is server-only.
 */

import crypto from 'crypto'

const KEY_ID = process.env.RAZORPAY_KEY_ID ?? ''
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? ''
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? ''
export const IS_LIVE = process.env.RAZORPAY_LIVE_MODE === 'true'
export const IS_CONFIGURED = Boolean(KEY_ID && KEY_SECRET)

export function isRazorpayConfigured() {
  return IS_CONFIGURED
}

/**
 * Creates a Razorpay order. Returns the provider order id.
 * If keys are not configured, returns null (caller should fall back to test mode).
 */
export async function createRazorpayOrder(
  amountPaise: number,
  receipt: string
): Promise<{ providerOrderId: string } | null> {
  if (!IS_CONFIGURED) return null
  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64')
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      payment_capture: 1,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Razorpay order creation failed: ${res.status} ${text}`)
  }
  const data = await res.json()
  return { providerOrderId: data.id as string }
}

/**
 * Verifies the client-side payment signature returned by Razorpay checkout.
 * NEVER trust a client success message alone — always verify the signature.
 */
export function verifyPaymentSignature(params: {
  orderId: string
  paymentId: string
  signature: string
}): boolean {
  if (!IS_CONFIGURED) return false
  const expected = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex')
  // Use timing-safe comparison
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(params.signature, 'hex'))
}

/**
 * Verifies the webhook signature sent by Razorpay to /api/payment/webhook.
 */
export function verifyWebhookSignature(params: { body: string; signature: string }): boolean {
  if (!WEBHOOK_SECRET) return false
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(params.body)
    .digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(params.signature, 'hex'))
  } catch {
    return false
  }
}

'use client'

// Re-export for compatibility. Originally this was a lazy-load boundary
// for three.js; with the lightweight image-based viewer there's no heavy
// dependency to isolate, so we just re-export the component directly.
export { ProductViewer3D as ProductViewer3DClient } from '@/components/shop/product-viewer-3d'
export type { default as _Unused } from 'react'

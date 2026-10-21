'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { RotateCcw, Maximize2, Loader2, Box, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  modelUrl: string           // Ignored in this lightweight viewer — kept for API compatibility
  fallbackImage?: { url: string; alt: string }
  images?: { url: string; altText?: string | null }[]  // Used for the 360° rotation
  scale?: number
  className?: string
}

/**
 * Lightweight 360° product viewer.
 *
 * Why this exists:
 * The original React Three Fiber viewer pulled in three.js (~5 MB), which
 * caused the Turbopack dev server to OOM-kill on a 4 GB sandbox. To keep the
 * site deployable in constrained environments, this component renders an
 * interactive 360° image rotation using plain DOM + CSS — no three.js, no
 * WebGL, no heavy bundle. The owner can swap this back to a real R3F viewer
 * once they're on hosting with adequate memory (see public/models/README.md).
 *
 * Features:
 *   - Drag to rotate through product images
 *   - Auto-rotate on load (respects prefers-reduced-motion)
 *   - Reset view button
 *   - Fullscreen toggle
 *   - Graceful fallback to a single image when only one image is available
 */
export function ProductViewer3D({ modelUrl, fallbackImage, images, className = '' }: Props) {
  const allImages = images && images.length > 0
    ? images
    : fallbackImage
      ? [{ url: fallbackImage.url, altText: fallbackImage.alt }]
      : []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loaded, setLoaded] = useState<Set<number>>(new Set())
  const [reduced, setReduced] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ x: number; index: number } | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Auto-rotate (skipped if reduced motion)
  useEffect(() => {
    if (!autoRotate || reduced || allImages.length < 2) return
    const id = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % allImages.length)
    }, 1500)
    return () => clearInterval(id)
  }, [autoRotate, reduced, allImages.length])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (allImages.length < 2) return
    dragStart.current = { x: e.clientX, index: currentIndex }
    setAutoRotate(false)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [currentIndex, allImages.length])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current || allImages.length < 2) return
    const dx = e.clientX - dragStart.current.x
    const stepWidth = 40 // px per frame
    const steps = Math.round(dx / stepWidth)
    const newIndex = (dragStart.current.index + steps + allImages.length * 100) % allImages.length
    setCurrentIndex(newIndex)
  }, [allImages.length])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragStart.current = null
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId) } catch {}
  }, [])

  function resetView() {
    setCurrentIndex(0)
    setAutoRotate(true)
  }

  function toggleFullscreen() {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
      setFullscreen(false)
    } else {
      containerRef.current.requestFullscreen?.()
      setFullscreen(true)
    }
  }

  if (allImages.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center bg-muted ${className}`}>
        <Box className="h-10 w-10 text-foreground/30 mb-3" />
        <p className="text-sm text-foreground/60">No images available</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden ${className}`}
    >
      {/* Image stack — only show current */}
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {allImages.map((img, i) => (
           
          <img
            key={i}
            src={img.url}
            alt={img.altText ?? `View ${i + 1}`}
            className={`absolute inset-0 h-full w-full object-contain p-6 transition-opacity duration-150 ${
              i === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setLoaded((s) => new Set(s).add(i))}
            draggable={false}
          />
        ))}
      </div>

      {/* Loading indicator for the current frame */}
      {!loaded.has(currentIndex) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="h-8 w-8 animate-spin text-foreground/40" />
        </div>
      )}

      {/* Single-image notice */}
      {allImages.length === 1 && (
        <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur p-3 border border-border text-xs text-foreground/70">
          <p className="font-medium text-foreground mb-1">Single view available</p>
          <p>Multiple product images are needed for full 360° rotation. Add more images via the admin panel.</p>
        </div>
      )}

      {/* 360° hint badge */}
      {allImages.length >= 2 && (
        <div className="absolute top-4 left-4">
          <span className="bg-accent text-accent-foreground text-[10px] tracking-eyebrow uppercase px-2 py-1 flex items-center gap-1.5">
            <Box className="h-3 w-3" /> 360° View
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9 bg-background/90 backdrop-blur shadow-sm"
          onClick={resetView}
          aria-label="Reset view"
          title="Reset view"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9 bg-background/90 backdrop-blur shadow-sm"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Hint */}
      {allImages.length >= 2 && (
        <div className="absolute bottom-4 left-4 text-xs text-foreground/60 bg-background/80 backdrop-blur px-3 py-1.5 rounded-sm">
          Drag to rotate {autoRotate && !reduced ? '· auto-rotating' : ''}
        </div>
      )}

      {/* Frame indicator */}
      {allImages.length >= 2 && (
        <div className="absolute bottom-4 right-4 text-xs text-foreground/60 bg-background/80 backdrop-blur px-3 py-1.5 rounded-sm tabular-nums">
          {currentIndex + 1} / {allImages.length}
        </div>
      )}
    </div>
  )
}

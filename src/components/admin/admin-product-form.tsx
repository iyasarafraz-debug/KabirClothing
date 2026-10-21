'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { slugify, rupeesToPaise } from '@/lib/format'

type Category = { id: string; name: string; slug: string }

type Variant = {
  id?: string
  size: string
  color: string
  colorHex: string
  stock: number
  priceDeltaPaise: number
  isActive: boolean
}

type Product = {
  id: string
  slug: string
  name: string
  sku: string
  shortDescription?: string | null
  description: string
  categoryId: string
  pricePaise: number
  salePricePaise: number | null
  featured: boolean
  bestseller: boolean
  newArrival: boolean
  isActive: boolean
  fit?: string | null
  fabric?: string | null
  careInstructions?: string | null
  specifications: string | null
  searchMetadata: string | null
  variants: Variant[]
  images: { id?: string; url: string; altText?: string | null; position: number; isPrimary: boolean }[]
  assets3d: { id: string; modelUrl: string }[]
}

export function AdminProductForm({
  product,
  categories,
}: {
  product?: Product
  categories: Category[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    sku: product?.sku ?? '',
    shortDescription: product?.shortDescription ?? '',
    description: product?.description ?? '',
    categoryId: product?.categoryId ?? categories[0]?.id ?? '',
    priceRupees: product ? (product.pricePaise / 100).toFixed(2) : '',
    salePriceRupees: product?.salePricePaise ? (product.salePricePaise / 100).toFixed(2) : '',
    featured: product?.featured ?? false,
    bestseller: product?.bestseller ?? false,
    newArrival: product?.newArrival ?? false,
    isActive: product?.isActive ?? true,
    fit: product?.fit ?? '',
    fabric: product?.fabric ?? '',
    careInstructions: product?.careInstructions ?? '',
    specificationsText: product?.specifications ? JSON.stringify(JSON.parse(product.specifications), null, 2) : '{\n  \n}',
    searchMetadataText: product?.searchMetadata ? JSON.stringify(JSON.parse(product.searchMetadata)).slice(1, -1) : '',
    asset3dUrl: product?.assets3d?.[0]?.modelUrl ?? '',
  })

  const [variants, setVariants] = useState<Variant[]>(
    product?.variants?.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex ?? '',
      stock: v.stock,
      priceDeltaPaise: v.priceDeltaPaise,
      isActive: v.isActive,
    })) ?? [{ size: 'M', color: 'Black', colorHex: '#111111', stock: 10, priceDeltaPaise: 0, isActive: true }]
  )

  const [images, setImages] = useState(
    product?.images?.map((i) => ({ id: i.id, url: i.url, altText: i.altText ?? '', position: i.position, isPrimary: i.isPrimary })) ?? [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80', altText: '', position: 0, isPrimary: true },
    ]
  )

  function update(field: keyof typeof form, value: any) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function addVariant() {
    setVariants((v) => [...v, { size: 'M', color: 'Black', colorHex: '#111111', stock: 10, priceDeltaPaise: 0, isActive: true }])
  }

  function updateVariant(index: number, field: keyof Variant, value: any) {
    setVariants((vs) => vs.map((v, i) => (i === index ? { ...v, [field]: value } : v)))
  }

  function removeVariant(index: number) {
    setVariants((vs) => vs.filter((_, i) => i !== index))
  }

  function addImage() {
    setImages((imgs) => [...imgs, { url: '', altText: '', position: imgs.length, isPrimary: false }])
  }

  function updateImage(index: number, field: string, value: any) {
    setImages((imgs) => imgs.map((img, i) => (i === index ? { ...img, [field]: value } : img)))
  }

  function removeImage(index: number) {
    setImages((imgs) => imgs.filter((_, i) => i !== index))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      // Parse specifications JSON
      let specs: Record<string, string> = {}
      try {
        specs = JSON.parse(form.specificationsText || '{}')
      } catch {
        throw new Error('Specifications must be valid JSON')
      }
      const searchMetadata = form.searchMetadataText
        .split(',')
        .map((s) => s.trim().replace(/^"|"$/g, ''))
        .filter(Boolean)

      const payload = {
        slug: form.slug || slugify(form.name),
        name: form.name,
        sku: form.sku,
        shortDescription: form.shortDescription || undefined,
        description: form.description,
        categoryId: form.categoryId,
        pricePaise: rupeesToPaise(parseFloat(form.priceRupees) || 0),
        salePricePaise: form.salePriceRupees ? rupeesToPaise(parseFloat(form.salePriceRupees)) : null,
        featured: form.featured,
        bestseller: form.bestseller,
        newArrival: form.newArrival,
        isActive: form.isActive,
        fit: form.fit || undefined,
        fabric: form.fabric || undefined,
        careInstructions: form.careInstructions || undefined,
        specifications: specs,
        searchMetadata,
        variants: variants.map((v) => ({
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          stock: Number(v.stock),
          priceDeltaPaise: Number(v.priceDeltaPaise),
          isActive: v.isActive,
        })),
        images: images.filter((i) => i.url).map((img, idx) => ({
          url: img.url,
          altText: img.altText || undefined,
          position: idx,
          isPrimary: idx === 0,
        })),
        asset3dUrl: form.asset3dUrl || undefined,
      }

      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = product ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({ error: 'Could not save' }))
        throw new Error(typeof d.error === 'string' ? d.error : 'Validation failed')
      }
      toast.success(product ? 'Product updated' : 'Product created')
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-8 max-w-4xl">
      {/* Basic */}
      <fieldset className="space-y-4 border border-border bg-card p-5">
        <legend className="font-serif text-lg px-2">Basic information</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" required value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="auto-generated from name" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="sku">SKU *</Label>
            <Input id="sku" required value={form.sku} onChange={(e) => update('sku', e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="categoryId">Category *</Label>
            <select
              id="categoryId"
              required
              value={form.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="shortDescription">Short description</Label>
          <Input id="shortDescription" value={form.shortDescription} onChange={(e) => update('shortDescription', e.target.value)} className="mt-1.5" maxLength={300} />
        </div>
        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea id="description" required rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} className="mt-1.5" />
        </div>
      </fieldset>

      {/* Pricing */}
      <fieldset className="space-y-4 border border-border bg-card p-5">
        <legend className="font-serif text-lg px-2">Pricing & flags</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priceRupees">Price (₹) *</Label>
            <Input id="priceRupees" required type="number" step="0.01" value={form.priceRupees} onChange={(e) => update('priceRupees', e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="salePriceRupees">Sale price (₹)</Label>
            <Input id="salePriceRupees" type="number" step="0.01" value={form.salePriceRupees} onChange={(e) => update('salePriceRupees', e.target.value)} className="mt-1.5" />
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} /> Featured</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.bestseller} onChange={(e) => update('bestseller', e.target.checked)} /> Bestseller</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.newArrival} onChange={(e) => update('newArrival', e.target.checked)} /> New arrival</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)} /> Active</label>
        </div>
      </fieldset>

      {/* Product details */}
      <fieldset className="space-y-4 border border-border bg-card p-5">
        <legend className="font-serif text-lg px-2">Product details</legend>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="fit">Fit</Label>
            <Input id="fit" value={form.fit} onChange={(e) => update('fit', e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="fabric">Fabric</Label>
            <Input id="fabric" value={form.fabric} onChange={(e) => update('fabric', e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="careInstructions">Care</Label>
            <Input id="careInstructions" value={form.careInstructions} onChange={(e) => update('careInstructions', e.target.value)} className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label htmlFor="specificationsText">Specifications (JSON)</Label>
          <Textarea id="specificationsText" rows={5} value={form.specificationsText} onChange={(e) => update('specificationsText', e.target.value)} className="mt-1.5 font-mono text-xs" />
          <p className="text-xs text-foreground/50 mt-1">e.g. <code>{'{"GSM":"240","Fit":"Oversized"}'}</code></p>
        </div>
        <div>
          <Label htmlFor="searchMetadataText">Search keywords (comma-separated)</Label>
          <Input id="searchMetadataText" value={form.searchMetadataText} onChange={(e) => update('searchMetadataText', e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="asset3dUrl">3D model URL (GLB/glTF)</Label>
          <Input id="asset3dUrl" value={form.asset3dUrl} onChange={(e) => update('asset3dUrl', e.target.value)} placeholder="/models/my-model.glb or https://cdn.example.com/model.glb" className="mt-1.5" />
          <p className="text-xs text-foreground/50 mt-1">Leave empty to disable 3D for this product.</p>
        </div>
      </fieldset>

      {/* Variants */}
      <fieldset className="space-y-4 border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <legend className="font-serif text-lg px-2">Variants</legend>
          <Button type="button" size="sm" variant="outline" onClick={addVariant}><Plus className="h-3.5 w-3.5 mr-1" /> Add variant</Button>
        </div>
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end border border-border p-3">
              <div>
                <Label className="text-xs">Size</Label>
                <Input value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} className="mt-1 h-9" />
              </div>
              <div>
                <Label className="text-xs">Colour</Label>
                <Input value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} className="mt-1 h-9" />
              </div>
              <div>
                <Label className="text-xs">Hex</Label>
                <Input value={v.colorHex} onChange={(e) => updateVariant(i, 'colorHex', e.target.value)} className="mt-1 h-9" placeholder="#000000" />
              </div>
              <div>
                <Label className="text-xs">Stock</Label>
                <Input type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} className="mt-1 h-9" />
              </div>
              <div>
                <Label className="text-xs">Δ ₹</Label>
                <Input type="number" value={v.priceDeltaPaise / 100} onChange={(e) => updateVariant(i, 'priceDeltaPaise', rupeesToPaise(parseFloat(e.target.value) || 0))} className="mt-1 h-9" />
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={() => removeVariant(i)} className="h-9 w-9"><X className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      </fieldset>

      {/* Images */}
      <fieldset className="space-y-4 border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <legend className="font-serif text-lg px-2">Images</legend>
          <Button type="button" size="sm" variant="outline" onClick={addImage}><Plus className="h-3.5 w-3.5 mr-1" /> Add image</Button>
        </div>
        <div className="space-y-2">
          {images.map((img, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end border border-border p-3">
              <div>
                <Label className="text-xs">URL</Label>
                <Input value={img.url} onChange={(e) => updateImage(i, 'url', e.target.value)} className="mt-1 h-9" placeholder="https://… or /images/…" />
              </div>
              <div>
                <Label className="text-xs">Alt text</Label>
                <Input value={img.altText} onChange={(e) => updateImage(i, 'altText', e.target.value)} className="mt-1 h-9" />
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={() => removeImage(i)} className="h-9 w-9"><X className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-foreground/50">
          First image is used as the primary image. Use full URLs (https://) for remote images,
          or paths starting with / for files in /public.
        </p>
      </fieldset>

      <div className="flex gap-3 sticky bottom-4">
        <Button type="submit" disabled={saving} className="bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {product ? 'Save changes' : 'Create product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>Cancel</Button>
      </div>
    </form>
  )
}

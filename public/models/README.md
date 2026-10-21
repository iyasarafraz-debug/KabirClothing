# 3D Models

This directory holds local GLB/glTF assets for the Kabir Clothing 3D viewer.

## Current state

The seed script associates the following product slugs with model paths under
`/public/models/`:

| Product                  | Model path              | Status                       |
|--------------------------|-------------------------|------------------------------|
| Essential Oversized T-Shirt | `/models/t-shirt.glb`   | ⚠️ Not yet installed        |
| Signature Hoodie         | `/models/hoodie.glb`    | ⚠️ Not yet installed        |
| Signature Overshirt      | `/models/overshirt.glb` | ⚠️ Not yet installed        |

If a model file is not present at the referenced path, the 3D viewer renders a
graceful fallback image with a notice explaining the situation. **No fake
models are bundled or simulated.**

## How to add a real 3D model

1. Source a properly licensed GLB/glTF asset for the product. Good options:
   - Commission a 3D artist (most realistic for apparel)
   - Use licensed assets from Sketchfab, CGTrader, or similar (verify licence)
   - Generate from product photography using photogrammetry tools
2. Place the `.glb` file at the matching path in this directory, e.g.
   `/public/models/t-shirt.glb`
3. Alternatively, host the model on a CDN and update the model URL via the
   Admin Dashboard → Edit Product → "3D model URL" field.
4. Visit `/3d-viewer/<product-slug>` to verify the model loads correctly.

## Performance guidance

- Keep GLB files under 2 MB when possible. Use Draco or meshopt compression.
- Embed textures inside the GLB (not external `.bin`/`.png` references) to
  avoid CORS issues and reduce request count.
- Use a single material per mesh where possible.
- The viewer uses React Three Fiber with `OrbitControls`, lazy loading, and
  properly disposes of GPU resources on unmount.

## Licensing reminder

Never bundle 3D models without verifying the licence permits use in a
commercial e-commerce context. Keep a copy of the licence file alongside each
model and credit the creator where required.

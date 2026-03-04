# Frontend - Patisserie Next.js

Next.js 14 React frontend with TypeScript, Tailwind CSS, and Zustand state management.

## Features

✅ Product catalog with SSR/ISR
✅ Shopping cart (Zustand store)
✅ User authentication (JWT)
✅ Order checkout flow
✅ Admin dashboard
✅ Responsive design (mobile-first)
✅ Optimized images (Next.js Image)
✅ Network retry logic for unstable connections

## Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Server runs on `http://localhost:3000`

## Project Structure

```
src/
├── pages/
│   ├── index.tsx              # Homepage
│   ├── products.tsx           # Product catalog
│   ├── cart.tsx               # Shopping cart
│   ├── checkout.tsx           # Checkout & order creation
│   ├── auth/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── admin/
│   │   └── dashboard.tsx      # Admin orders & stats
│   ├── _app.tsx               # App wrapper
│   └── _document.tsx          # HTML document
├── components/
│   ├── Header.tsx             # Navigation & auth UI
│   ├── Footer.tsx             # Footer
│   ├── MainLayout.tsx         # Layout wrapper
│   └── ProductCard.tsx        # Product display
├── hooks/
│   ├── useAuth.ts             # Auth logic
│   └── useNetworkRetry.ts    # Network resilience
├── services/
│   └── api.ts                 # API client + endpoints
├── lib/
│   ├── authStore.ts           # Auth state (Zustand)
│   ├── cartStore.ts           # Cart state (Zustand)
│   └── utils.ts               # Helpers (formatPrice, etc)
├── types/
│   └── index.ts               # TypeScript interfaces
└── styles/
    └── globals.css            # Tailwind + global styles
```

## Key Technologies

| Package | Purpose |
|---------|---------|
| **Next.js** | React framework |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Zustand** | State management |
| **Axios** | HTTP client |
| **React Icons** | Icon library |

## API Integration

The `src/services/api.ts` exports client methods for the backend API:

```typescript
// Authentication
authService.login(email, password)
authService.register(email, password, fullName, phone)
authService.logout()
authService.getMe()

// Products
productService.getAll(skip, take)
productService.getBySlug(slug)
productService.create(product)  // admin
productService.update(id, data) // admin
productService.delete(id)       // admin

// Orders
orderService.create(items, fulfillment, addressId)
orderService.getAll(skip, take)
orderService.getById(id)

// Admin
adminService.getAllOrders(skip, take)      // admin
adminService.updateOrderStatus(id, status) // admin
adminService.getStats()                    // admin
```

## State Management (Zustand)

### Auth Store
```typescript
import { useAuthStore } from '@lib/authStore';

const { user, setAuth, clearAuth, isAdmin } = useAuthStore();
```

### Cart Store
```typescript
import { useCartStore } from '@lib/cartStore';

const { items, addItem, removeItem, updateQuantity } = useCartStore();
```

## Styling

- **Tailwind CSS** for utilities
- **Custom components** in `src/styles/globals.css`
- **Color scheme**: Gold (#D4AF37), Brown (#8B6F47), Cream (#FFF8F0)

### Available CSS classes:
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.btn-danger` - Danger button
- `.container-custom` - Content wrapper
- `.card` - Card component
- `.input-field` - Form input

## Mobile Optimization

✅ Responsive grid layouts
✅ Touch-friendly buttons
✅ Optimized images (WebP, lazy loading)
✅ Minimal JavaScript bundles
✅ Network retry logic for unstable connections

## Authentication Flow

1. User registers/logs in
2. Backend returns `accessToken` + user data
3. Token stored in `localStorage`
4. Interceptor adds token to all API requests
5. On 401 error, redirect to login
6. Refresh token in HttpOnly cookie (backend handles)

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Building for Production

```bash
# Build
npm run build

# Start production server
npm start
```

## Type Checking

```bash
npm run type-check
```

## Linting

```bash
npm run lint
```

## Testing

Create `__tests__` folder in `src/` for Jest tests (optional):

```bash
npm test
```

## Performance Tips

1. **Image Optimization**: Use Next.js `Image` component
2. **Code Splitting**: Dynamic imports for large components
3. **ISR**: Set `revalidate` in `getStaticProps` for product pages
4. **Bundle Analysis**: Use `@next/bundle-analyzer` to check bundle size

Example ISR:
```typescript
export async function getStaticProps() {
  return {
    props: { /* ... */ },
    revalidate: 3600, // Revalidate every hour
  }
}
```

## Troubleshooting

### "localStorage is not defined" error
→ Only access localStorage in `useEffect` (client-side only)

### Build fails with type errors
```bash
npm run type-check
# Fix errors, then:
npm run build
```

### API calls failing
→ Check `NEXT_PUBLIC_API_URL` in `.env.local`
→ Ensure backend is running on correct port

### Cart state lost on refresh
→ Use `localStorage` to persist cart (optional enhancement)

## Future Enhancements

- [ ] Payment integration (Flutterwave/CinetPay)
- [ ] Order tracking page
- [ ] Product search & filters
- [ ] Wishlist feature
- [ ] Customer reviews
- [ ] Email notifications
- [ ] i18n (French/English)
- [ ] PWA support

---

**Ready to go live?** Check deployment guides for Vercel, Netlify, or VPS.

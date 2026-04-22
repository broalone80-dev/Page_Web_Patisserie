# Guide d'intégration des paiements

Intégration Flutterwave + CinetPay pour les paiements au Cameroun.

## Structure

- **Backend** : Services API pour créer transactions et gérer webhooks
- **Frontend** : Pages de paiement avec redirection vers providers
- **Databases** : Table `payments` pour tracker transactions

## Flutterwave

### 1️⃣ Configuration

[Créer un compte Flutterwave](https://dashboard.flutterwave.com/signup)

```bash
# Dans .env backend
FLUTTERWAVE_API_KEY=your_flutterwave_api_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
```

### 2️⃣ Flow de paiement

```
1. Frontend: POST /api/payments/initiate
   { orderId, provider: "flutterwave" }
   
2. Backend crée transaction via API Flutterwave
   → Retourne payment link
   
3. Frontend redirige client vers Flutterwave
   
4. Client paie sur Flutterwave
   
5. Flutterwave redirige vers:
   GET /api/payments/callback/flutterwave?status=successful&tx_ref=...
   
6. Backend vérifie paiement
   → Met à jour order.status = "paid"
   
7. Frontend affiche confirmation
```

### 3️⃣ Test en local

Credentials de test (Flutterwave sandbox):
- Card: 5531 8866 5725 4957
- CVV: 564
- Expiry: 09/32

## CinetPay

### 1️⃣ Configuration

[Créer un compte CinetPay](https://business.cinetpay.com/?lang=fr)

```bash
# Dans .env backend
CINETPAY_API_KEY=your_cinetpay_api_key
CINETPAY_SITE_ID=your_cinetpay_site_id
```

### 2️⃣ Flow de paiement (similaire à Flutterwave)

```
1. Frontend: POST /api/payments/initiate
   { orderId, provider: "cinetpay" }
   
2. Backend crée transaction via API CinetPay
   → Retourne payment link + token
   
3. Frontend redirige client vers CinetPay
   
4. Client paie sur CinetPay
   
5. CinetPay redirige vers:
   GET /api/payments/callback/cinetpay?payment_token=...
   
6. Backend vérifie paiement
   → Met à jour order.status = "paid"
```

### 3️⃣ Test en local

CinetPay sandbox testable directement.

## Backend - Routes de paiement

### POST /api/payments/initiate
Créer une transaction de paiement

```bash
curl -X POST http://localhost:4000/api/payments/initiate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "user-order-id",
    "provider": "flutterwave"
  }'

# Response:
{
  "success": true,
  "data": {
    "paymentLink": "https://checkout.flutterwave.com/...",
    "provider": "flutterwave"
  }
}
```

### GET /api/payments/:orderId
Récupérer statut de paiement

```bash
curl http://localhost:4000/api/payments/order-123 \
  -H "Authorization: Bearer <token>"

# Response:
{
  "id": "payment-uuid",
  "orderId": "order-123",
  "provider": "flutterwave",
  "status": "successful",
  "amountCents": 500000,
  "createdAt": "2024-02-20T..."
}
```

## Frontend - Page de paiement

Créer la page `src/pages/payment.tsx` :

```typescript
import { useState } from 'react';
import { useRouter } from 'next/router';
import { orderService } from '@services/api';

export default function Payment() {
  const router = useRouter();
  const { orderId } = router.query;
  const [provider, setProvider] = useState<'flutterwave' | 'cinetpay'>('flutterwave');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ orderId, provider }),
      });

      const data = await response.json();
      if (data.success) {
        // Redirect to payment provider
        window.location.href = data.data.paymentLink;
      }
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom">
      <h1>Paiement de la commande</h1>
      
      <select value={provider} onChange={(e) => setProvider(e.target.value as any)}>
        <option value="flutterwave">Flutterwave</option>
        <option value="cinetpay">CinetPay</option>
      </select>

      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Redirection...' : 'Payer maintenant'}
      </button>
    </div>
  );
}
```

## Callbacks & Webhooks

### Flow de callback

1. **Après paiement**, provider redirige vers:
   ```
   GET http://api.patisserie.cm/api/payments/callback/{provider}?...params...
   ```

2. **Backend valide** le paiement via verification API

3. **Si réussi** :
   - Mise à jour `payments.status = "successful"`
   - Mise à jour `orders.status = "paid"`
   - Redirection frontend vers page confirmation

### Flow de webhook

Parallèlement au callback, le provider envoie un webhook au backend:

```
POST http://api.patisserie.cm/api/payments/webhook/{provider}
```

Cela assure que même si le client ferme le navigateur, le paiement est enregistré.

## Sécurité

### ✅ Validations en place

1. **Signature Flutterwave**
   - Vérifier `verif-hash` header
   - Recalculer hash du body

2. **Authentification CinetPay**
   - API key dans headers
   - Site ID dans payload

3. **Vérification duplex**
   - Callback + Webhook = double confirmation
   - Si un seul reçu, on revalide auprès du provider

### ⚠️ À faire avant production

1. Activer **HTTPS obligatoire**
2. Whitelist les IPs des providers:
   - Flutterwave: [Voir docs](https://developer.flutterwave.com)
   - CinetPay: [Voir docs](https://docs.cinetpay.com)
3. Ajouter **rate limiting** sur webhooks
4. Logger tous les paiements pour audit

## Variables d'environnement

```bash
# .env.backend

# Flutterwave
FLUTTERWAVE_API_KEY=sk_test_xxxxx
FLUTTERWAVE_SECRET_KEY=sk_xxxxx

# CinetPay
CINETPAY_API_KEY=xxxxx
CINETPAY_SITE_ID=xxxxx

# Frontend callbacks
FRONTEND_URL=https://patisserie.cm (production)
FRONTEND_URL=http://localhost:3000 (local)
```

## Montants

**Important** : Tous les montants sont en **cents (XAF)**.

- 2500 XAF = 2500 cents
- 100 000 XAF = 10 000 000 cents

Les APIs acceptent montants décimaux, le service les divise par 100.

## Statuts de paiement

| Status | Meaning | Action |
|--------|---------|--------|
| `initiated` | Transaction créée | En attente client |
| `pending` | Paiement en cours | Attendre callback |
| `successful` | Paiement confirmé | Livrer commande |
| `failed` | Paiement échoué | Demander retry |

## Troubleshooting

### "Payment link not generated"
→ Vérifier clés API Flutterwave/CinetPay
→ Tester API directement avec Postman

### "Callback received but order not updated"
→ Vérifier format `tx_ref` ou `payment_token`
→ Activer logs détaillés

### "Webhook signature failed"
→ Flutterwave: recalculer hash correctement
→ CinetPay: vérifier API key

## Monitoring

### Logs à tracker

```
[PAYMENT] Initiated: orderId=123, provider=flutterwave
[PAYMENT] Link: https://checkout.flutterwave.com/...
[PAYMENT] Callback: status=successful, amount=500000
[PAYMENT] Verified: orderId=123
[PAYMENT] Updated: order.status=paid
```

### Alertes recommandées

- Payment initiation fails
- Webhook signature invalid
- Order status divergence (payment marked successful but order still pending)

## Prochaines étapes

- [ ] Tester flux complet en local
- [ ] Activer webhooks Flutterwave dans dashboard
- [ ] Activer webhooks CinetPay dans dashboard
- [ ] Tester avec vrais montants en sandbox
- [ ] Migrer en production
- [ ] Monitorer transactions 24/7

---

**Questions?** Consultez :
- [Flutterwave docs](https://developer.flutterwave.com)
- [CinetPay docs](https://docs.cinetpay.com)

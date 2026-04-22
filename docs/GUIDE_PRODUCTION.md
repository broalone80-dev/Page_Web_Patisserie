# Guide de Mise en Production — Chez GuiGui

## Architecture du Projet

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Navigateur │──────▶│   Next.js    │──────▶│  Express.js  │
│   (Client)   │◀──────│  Frontend    │◀──────│   Backend    │
│              │       │  port 3000   │       │  port 4000   │
└──────────────┘       └──────────────┘       └──────┬───────┘
                                                     │
                                              ┌──────▼───────┐
                                              │    MySQL      │
                                              │  port 3306    │
                                              └──────────────┘
```

| Composant | Technologie | Rôle |
|-----------|------------|------|
| Frontend | Next.js 14 + React 18 + Tailwind CSS | Pages web, panier, checkout |
| Backend | Express.js + TypeScript + Prisma ORM | API REST, auth, paiements, chat |
| Base de données | MySQL 8.0 (XAMPP en local / Docker en prod) | Données utilisateurs, commandes, produits |
| WebSocket | Socket.IO | Chat temps réel, notifications |
| Images | Cloudinary (optionnel) ou stockage local | Photos des produits |

---

## Prérequis

- **Node.js** 20+ installé
- **MySQL** 8.0 (via XAMPP ou Docker)
- **Git** pour le versioning
- **npm** pour les dépendances

---

## Installation Locale (Développement)

### 1. Cloner le projet
```bash
git clone https://github.com/broalone80-dev/Page_Web_Patisserie.git
cd Page_Web_Patisserie
```

### 2. Backend
```bash
cd backend
npm install
```

Créer le fichier `backend/.env` :
```env
DATABASE_URL=mysql://root:@localhost:3306/patisserie_db
JWT_SECRET=dev-secret-change-in-prod
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-prod
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

Initialiser la base de données :
```bash
npx prisma generate --schema=src/prisma/schema.prisma
npx prisma db push --schema=src/prisma/schema.prisma
npx ts-node src/prisma/seed.ts
```

Démarrer :
```bash
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
```

Créer le fichier `frontend/.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Démarrer :
```bash
npm run dev
```

Le site sera accessible sur **http://localhost:3000**.

---

## Comptes par Défaut

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@chezguigui.cm | *(défini lors du seed)* |
| Manager | guillaine@chezguigui.cm | *(défini lors du seed)* |

---

## Mise en Production (Docker)

### 1. Préparer l'environnement

Le fichier `.env.production` est déjà généré à la racine du projet avec tous les secrets cryptographiques. **Vérifiez-le et complétez les champs vides.**

Champs à compléter :
- `API_BASE_URL` / `FRONTEND_URL` / `CORS_ORIGIN` → vos vrais noms de domaine
- `SMTP_USER` / `SMTP_PASS` → identifiants Gmail (mot de passe d'application)
- `CLOUDINARY_*` → optionnel, pour héberger les images sur le cloud
- `ORANGE_MONEY_*` / `MTN_MOMO_*` → optionnel, pour le paiement automatique

### 2. Construire et lancer

```bash
# Copier le .env de production
cp .env.production .env

# Construire l'image Docker du backend
cd backend
docker build -t broalone80/patisserie-backend:latest .

# Lancer tous les services
cd ..
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Initialiser la base de données en production

```bash
# Entrer dans le conteneur backend
docker exec -it patisserie-api sh

# Appliquer le schéma
npx prisma db push --schema=src/prisma/schema.prisma

# Créer les données initiales (catégories, produits, admin)
npx ts-node src/prisma/seed.ts

exit
```

### 4. Configurer le frontend en production

```bash
cd frontend
npm run build
npm run start
```

Ou déployez sur **Vercel** (recommandé pour Next.js) :
1. Connectez votre repo GitHub à Vercel
2. Ajoutez la variable d'environnement : `NEXT_PUBLIC_API_URL=https://api.chezguigui.cm`
3. Déployez

---

## Système de Paiement

### Fonctionnement

```
Client choisit Orange Money/MTN MoMo
        │
        ▼
Backend envoie la demande à l'opérateur
        │
        ├── API configurée → Push USSD sur le téléphone du client
        │                     Le client tape son PIN pour valider
        │                     L'opérateur envoie un webhook de confirmation
        │
        └── API non configurée → MODE MANUEL
                                  Le manager reçoit une notification
                                  Le manager vérifie le paiement
                                  Le manager confirme dans le tableau de bord
```

### Mode Manuel (par défaut)

Sans clés API Orange/MTN, le paiement fonctionne en mode manuel :
1. Le client passe commande et choisit Orange Money ou MTN MoMo
2. Le système affiche les instructions (ex: "Composez #150*1*1#...")
3. Le manager reçoit une notification "Paiement à confirmer"
4. Le manager vérifie sur son téléphone que le transfert est arrivé
5. Le manager confirme dans le tableau de bord → la commande est validée

### Mode Automatique

Avec les clés API configurées :
- **Orange Money** : Portail développeur → [developer.orange.com](https://developer.orange.com)
- **MTN MoMo** : Portail développeur → [momodeveloper.mtn.com](https://momodeveloper.mtn.com)

---

## Structure de la Base de Données

| Table | Contenu |
|-------|---------|
| `users` | Comptes clients, admins, managers |
| `products` | 54 produits (gâteaux, pastels, crêpes...) |
| `categories` | 14 catégories (Cakes, Pastels, Crêpes...) |
| `orders` | Commandes avec statut et paiement |
| `order_items` | Détail des produits par commande |
| `payments` | Historique des tentatives de paiement |
| `messages` | Chat entre client et manager |
| `notifications` | Notifications en temps réel |
| `delivery_codes` | Codes OTP de validation de livraison |
| `fraud_logs` | Détection de fraude sur les paiements |
| `audit_logs` | Traçabilité des actions admin |

---

## URLs et Routes Principales

### Frontend
| URL | Page |
|-----|------|
| `/` | Accueil |
| `/menu` | Menu avec photos (Pastels, Salé, Sucré) |
| `/products` | Boutique en ligne |
| `/products?search=cake` | Recherche de produits |
| `/cart` | Panier |
| `/checkout` | Commande et paiement |
| `/orders` | Mes commandes |
| `/orders/[id]` | Détail d'une commande + chat |
| `/about` | À propos |
| `/contact` | Contact |
| `/admin/dashboard` | Tableau de bord admin |
| `/admin/products` | Gestion des produits |

### API Backend
| Méthode | URL | Rôle |
|---------|-----|------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/products` | Liste des produits |
| POST | `/api/orders` | Créer une commande |
| GET | `/api/orders/delivery-fee?quarter=bastos` | Calculer frais de livraison |
| POST | `/api/payments/mobile/initiate` | Lancer un paiement mobile |
| GET | `/api/orders/manager/dashboard` | Dashboard manager |

---

## Sécurité en Place

| Protection | Détail |
|-----------|--------|
| Helmet | Headers HTTP sécurisés |
| CORS | Limite les appels API au domaine autorisé |
| Rate Limiting | 300 req/15min par IP, 10 tentatives login |
| JWT + Refresh Tokens | Sessions sécurisées avec rotation |
| Bcrypt | Mots de passe hachés (salted) |
| Zod Validation | Validation stricte de toutes les entrées |
| Transaction Sérialisable | Pas de survente de stock |
| HMAC-SHA256 Webhook | Vérification des confirmations de paiement |
| Fraud Logs | Détection et journalisation des tentatives frauduleuses |
| Non-root Docker | Le conteneur ne tourne pas en root |

---

## Commandes Utiles

```bash
# ─── Développement ───
cd backend && npm run dev          # Démarrer le backend
cd frontend && npm run dev         # Démarrer le frontend

# ─── Base de données ───
cd backend
npx prisma studio                  # Interface visuelle de la DB
npx prisma db push --schema=src/prisma/schema.prisma   # Appliquer les changements
npx prisma generate --schema=src/prisma/schema.prisma  # Régénérer le client

# ─── Production ───
docker-compose -f docker-compose.prod.yml up -d     # Lancer
docker-compose -f docker-compose.prod.yml down       # Arrêter
docker-compose -f docker-compose.prod.yml logs -f    # Voir les logs
```

---

## Contact & Support

- **WhatsApp** : +237 693 26 49 91
- **Adresse** : Yaoundé, Cameroun
- **Repo** : github.com/broalone80-dev/Page_Web_Patisserie

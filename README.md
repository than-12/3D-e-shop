# 3D Print Shop

Εφαρμογή διαχείρισης καταστημάτων 3D εκτύπωσης.

## Χαρακτηριστικά

- Διαχείριση χρηστών και ρόλων
- Κατάλογος προϊόντων και κατηγοριών
- Καλάθι αγορών
- Διαχείριση παραγγελιών
- Εκτύπωση προσαρμοσμένων μοντέλων (STL)
- Δημιουργία λιθοφανειών
- Φόρμα επικοινωνίας

## Τεχνολογίες

- Node.js
- Express.js
- TypeScript
- Drizzle ORM
- PostgreSQL
- Zod

## Εγκατάσταση

1. Κλωνοποιήστε το repository:
```bash
git clone https://github.com/yourusername/3d-print-shop.git
cd 3d-print-shop
```

2. Εγκαταστήστε τις εξαρτήσεις:
```bash
npm install
```

3. Δημιουργήστε το αρχείο `.env`:
```bash
cp .env.example .env
```

4. Ενημερώστε τις μεταβλητές περιβάλλοντος στο `.env`:
```
DATABASE_URL=postgresql://user:password@32/shop3dprint
```

5. Δημιουργήστε τη βάση δεδομένων:
```bash
npm run db:generate
npm run db:migrate
```

## Ανάπτυξη

Εκκινήστε τον server σε λειτουργία ανάπτυξης:
```bash
npm run dev
```

## Παραγωγή

Κατασκευάστε την εφαρμογή:
```bash
npm run build
```

Εκκινήστε τον server σε λειτουργία παραγωγής:
```bash
npm start
```

## Δομή Project

```
3d-print-shop/
├── shared/           # Κοινά σχήματα και τύποι
├── server/           # Server-side κώδικας
│   ├── db/          # Database configuration
│   ├── controllers/ # Controllers
│   └── routes/      # Routes
├── migrations/       # Database migrations
├── .env             # Environment variables
├── .env.example     # Example environment variables
├── drizzle.config.ts # Drizzle configuration
├── package.json     # Project dependencies
├── tsconfig.json    # TypeScript configuration
└── README.md        # Project documentation
```

## Άδεια

MIT 
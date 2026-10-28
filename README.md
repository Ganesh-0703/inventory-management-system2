# ⚡ FlashStore MFC OS — Quick-Commerce Store Inventory Management System

> A production-grade **Dark Store & Micro-Fulfillment Center (MFC) Inventory Management System** inspired by **Zepto** and **Blinkit**, built for sub-10-minute grocery delivery operations, rapid SLA picking, and cold-chain compliance.

---

## 🚀 Key Features

### 1. ⚡ 120-Second Pick & Pack Terminal (The Heart of Quick-Commerce)
- **Real-Time SLA Countdown Timer**: Visual 120s–150s countdown timer with color transitions (Green → Yellow → Pulsing Red) matching Zepto/Blinkit picker PDAs.
- **Shortest Walk-Path Optimization**: Auto-sequences picked items to minimize walking distance in the dark store (Walk-in Chiller → Aisle A → Aisle B → Packing Bay).
- **Barcode & SKU Verification**: Instant barcode scan verification with audio feedback (Zebra PDA scan beep / error buzzer on pick mismatch).
- **Tamper-Evident Bagging Station**: Bag barcode generator (`BAG-BLR04-XXXX`), seal confirmation, and celebratory completion fanfare.

### 2. 📦 Real-Time SKU Catalog & Inventory Management
- **Bin Coordinates**: Rack and bin tracking (e.g. `COLD-01-A`, `A-02-B1`, `FREEZE-01-A`).
- **Temperature Zone Classification**: Ambient, Chilled (4°C Walk-in Chiller), and Frozen (-18°C Deep Freeze).
- **Safety Stock & Auto-Status**: Dynamic status flags (`ACTIVE`, `LOW_STOCK`, `OUT_OF_STOCK`, `EXPIRED`) based on minimum reorder points.
- **Instant Stock Adjustment**: Reconcile counts, record damages, and write off waste with manager audit notes.

### 3. 📥 Inbound Inwarding & Goods Receipt Notes (GRN)
- **Supplier PO Receipt**: Inward supplier shipments against Purchase Orders (e.g. Amul, Nestle, FarmFresh).
- **Cold-Chain Dock Compliance**: Verify arrival temperatures before unloading chilled/frozen dairy and produce.
- **Batch & FEFO Expiry Tracking**: Record manufacturing and expiry dates upon dock arrival with auto-replenishment.

### 4. 🗺️ Interactive Dark Store 2D Floorplan & Heatmap
- **Visual MFC Grid**: Walk-in Chiller (4°C), Deep Freeze (-18°C), Aisles A–D, Packing Bays, and Dispatch Docks.
- **Interactive Bin Inspector**: Click any bin to see real-time stored SKUs, stock counts, and fill percentage.
- **Color-Coded Density**: Highlights low-stock, out-of-stock, and vacant racks.

### 5. ⏳ FEFO Expiry Tracker & Waste Prevention
- **First-Expired-First-Out**: Automatically flags perishables expiring in < 3 days, 7 days, or 15 days.
- **Clearance Markdown Planner**: 1-click -25% or -50% promotional markdown to clear near-expiry stock and reduce shrinkage.
- **Spoilage Write-Off**: Log spoiled inventory with reasons directly into the store audit ledger.

### 6. 🛵 Orders & Dispatch Bay
- **Order Life Cycle**: `RECEIVED` → `PICKING` → `PACKED` → `DISPATCHED` → `DELIVERED`.
- **Rider Handover**: Assign Zepto / Blinkit delivery partners with rider name and phone logging.

### 7. 📋 Cycle Count & Audit Trail
- Shift-wise physical inventory auditing against system counts.
- Discrepancy & variance detection with audit trail.

### 8. 🔐 Full Authentication & Role-Based Access Control (RBAC)
- Secure JWT authentication with bcrypt password hashing.
- **Instant 1-Click Demo Login** for evaluation across 4 roles:
  - 👑 **Store Manager**: Full MFC control, analytics, approvals.
  - ⚡ **Picker & Packer**: 120s rapid picking terminal & scanner.
  - 📦 **Inventory Supervisor**: Inwarding, GRN, and cycle audits.
  - 📊 **Operations Lead**: City-level store oversight.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti, Web Audio API Sound Synthesizer.
- **Backend**: Node.js, Express, TypeScript, JWT (`jsonwebtoken`), `bcryptjs`, CORS.
- **Database**: Embedded transactional persistent JSON/SQLite engine with atomic file writes (zero external DB setup needed!).
- **Deployment**: Render Web Service ready (single-port unified full-stack architecture).

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Clone & Install
```bash
# Clone the repository
git clone <your-repo-url>
cd "inventory management system2"

# Install all dependencies (root, server, and client)
npm run install:all
```

### 2. Run in Development Mode
```bash
npm run dev
```
- Client runs on: `http://localhost:5173`
- Server API runs on: `http://localhost:5001`
- Requests to `/api/*` are automatically proxied to the backend.

### 3. Build & Test Production Mode
```bash
# Build client and server
npm run build

# Start production server
npm start
```
- Open `http://localhost:5001` in your browser. Both frontend and backend run seamlessly together!

---

## 🌐 Deploy to Render (Step-by-Step)

The project is pre-configured with `render.yaml` for 1-click deployment on Render's Free or Starter tier.

### Option A: 1-Click Render Blueprint Deployment (Recommended)
1. Push your repository to **GitHub** (see instructions below).
2. Go to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** → **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` and configure:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
6. Click **Apply**. Render will install, build both client & server, and deploy your live URL!

### Option B: Manual Render Web Service Setup
1. On [Render Dashboard](https://dashboard.render.com/), click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the following fields:
   - **Name**: `flashstore-inventory-system`
   - **Environment**: `Node`
   - **Region**: Closest to you (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `JWT_SECRET`: (Any random 32-character string)
5. Under **Health Check Path**, enter: `/api/health`
6. Click **Create Web Service**. Your app will be live within ~2 minutes!

---

## 🐙 Push to GitHub (Step-by-Step)

To upload this project to your GitHub account:

### Step 1: Create a New GitHub Repository
1. Go to [GitHub.com/new](https://github.com/new).
2. Repository name: e.g. `zepto-blinkit-inventory-management` (or any name you prefer).
3. Choose **Public** or **Private**.
4. Leave **"Initialize this repository with a README"** **UNCHECKED** (we already have a complete one).
5. Click **Create repository**.

### Step 2: Push Your Local Code
In your terminal inside this project folder, run:

```bash
# 1. Add all files to git
git add .

# 2. Create the initial commit
git commit -m "feat: complete Zepto & Blinkit dark store inventory management system"

# 3. Rename branch to main (if not already main)
git branch -M main

# 4. Link your GitHub repository (replace with your GitHub URL)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# 5. Push to GitHub
git push -u origin main
```

---

## 👥 Demo Credentials

| Role | Email | Password | Terminal Purpose |
|---|---|---|---|
| 👑 **Store Manager** | `manager@flashstore.com` | `password123` | Full Dark Store Operations, SLAs, SKU Management |
| ⚡ **Picker & Packer** | `picker@flashstore.com` | `password123` | 120s Rapid Order Picking & Bag Sealing |
| 📦 **Inventory Supervisor** | `supervisor@flashstore.com` | `password123` | Inbound GRN, Supplier POs & Cycle Count Audits |
| 📊 **Operations Lead** | `admin@flashstore.com` | `password123` | Store Analytics, Staff Shift Directory |

*(Or simply tap any of the 1-Click Demo Login cards on the login screen to jump straight into any role!)*

---

## 📄 License
MIT © 2026 FlashStore Team

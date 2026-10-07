# Website Mua Bán Tài Khoản Game (GameAcc)

Đồ án website thương mại điện tử mua bán tài khoản game, thẻ cào và giftcode.

## 🛠 Công nghệ sử dụng
- **Backend:** Laravel 11, PHP 8.2+, MySQL
- **Frontend:** Next.js 15, React, TypeScript, TailwindCSS

---

## 🚀 Hướng dẫn chạy dự án

### 1. Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
> Backend chạy tại: `http://127.0.0.1:8000`

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
> Frontend chạy tại: `http://localhost:3000`

---

## 🔑 Tài khoản mẫu (Demo)
- **Admin:** `admin@gameacc.vn` / `admin123`
- **Khách hàng:** `buyer@gameacc.vn` / `buyer123`

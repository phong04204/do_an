# 🎮 GameAcc – Nền Tảng Thương Mại Điện Tử Mua Bán Tài Khoản Game & Thẻ Cào

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 11" />
  <img src="https://img.shields.io/badge/Next.js-15.x-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
</p>

---

## 📖 Giới Thiệu Dự Án

**GameAcc** là nền tảng website thương mại điện tử chuyên cung cấp dịch vụ giao dịch tài khoản game trực tuyến uy tín, thẻ game nạp tự động và giftcode quà tặng. Dự án được thiết kế theo kiến trúc tách biệt **Frontend (Next.js)** và **Backend (Laravel RESTful API)**, tối ưu trải nghiệm người dùng, tốc độ tải trang và bảo mật giao dịch.

Hỗ trợ các tựa game phổ biến: *Liên Quân Mobile, Liên Minh Huyền Thoại, Free Fire, PUBG Mobile, Valorant, Genshin Impact, Roblox,...*

---

## ✨ Tính Năng Nổi Bật

### 👤 Dành Cho Người Dùng (Khách Hàng)
* **Xác thực & Bảo mật:**
  * Đăng ký, đăng nhập tài khoản an toàn với mã hóa mật khẩu.
  * Hỗ trợ đăng nhập nhanh bằng tài khoản **Google (OAuth 2.0)**.
  * Quản lý thông tin cá nhân: Cập nhật họ tên, số điện thoại, đổi mật khẩu.
* **Tìm kiếm & Bộ lọc Sản phẩm:**
  * Lọc thông minh theo game, mức giá, danh mục (Tài khoản game, Thẻ cào nạp thẻ, Giftcode).
  * Xem thông tin chi tiết từng sản phẩm kèm hình ảnh minh họa chân thực.
* **Giỏ Hàng & Mua Sắm:**
  * Thêm/bớt/xóa sản phẩm trong giỏ hàng tức thì (quản lý state bởi Zustand).
  * Quy trình đặt hàng (Checkout) trực quan, hỗ trợ phương thức thanh toán chuyển khoản/VNPay.
* **Lịch Sử & Nhận Thông Tin Tự Động:**
  * Tra cứu toàn bộ lịch sử đơn hàng đã đặt.
  * Tự động hiển thị tài khoản/mật khẩu game hoặc mã thẻ cào/giftcode ngay sau khi hoàn tất thanh toán.

### 🛡️ Dành Cho Quản Trị Viên (Admin)
* **Thống Kê Tổng Quan:** Doanh thu, số lượng đơn hàng, số lượng tài khoản đã bán và người dùng mới.
* **Quản Lý Sản Phẩm:** Thêm mới, chỉnh sửa, tải ảnh, xóa tài khoản game, thẻ cào và giftcode.
* **Quản Lý Đơn Hàng:** Theo dõi trạng thái đơn hàng (chờ thanh toán, hoàn thành, hủy).
* **Quản Lý Người Dùng:** Phân quyền, kiểm tra và quản lý trạng thái tài khoản.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### 🖥️ Frontend
* **Framework:** [Next.js](https://nextjs.org/) (App Router) + React
* **Ngôn ngữ:** TypeScript
* **Styling:** Tailwind CSS + Lucide Icons
* **Quản lý trạng thái (State):** Zustand
* **Truy vấn & API Client:** Axios / TanStack React Query

### ⚙️ Backend
* **Framework:** [Laravel](https://laravel.com/) (RESTful API)
* **Ngôn ngữ:** PHP 8.2+
* **Cơ sở dữ liệu:** MySQL 8.0+
* **Xác thực:** Laravel Sanctum + Laravel Socialite (Google OAuth)
* **Công cụ hỗ trợ:** Composer

---

## 📁 Cấu Trúc Thư Mục

```
do_an/
├── backend/                  # Mã nguồn Backend (Laravel API)
│   ├── app/
│   │   ├── Http/Controllers/ # Các bộ điều khiển API (Auth, Order, Account, Admin...)
│   │   └── Models/          # Eloquent Models (User, Order, GameAccount...)
│   ├── database/
│   │   ├── migrations/      # Các file khởi tạo bảng cơ sở dữ liệu
│   │   └── seeders/         # Dữ liệu mẫu (DatabaseSeeder)
│   └── routes/api.php       # Định tuyến các API endpoints
├── frontend/                 # Mã nguồn Frontend (Next.js)
│   ├── public/images/       # Hình ảnh tài nguyên tĩnh (acc, thẻ, giftcode)
│   └── src/
│       ├── app/             # App Router (Trang chủ, sản phẩm, giỏ hàng, profile...)
│       ├── components/      # UI Components tái sử dụng
│       └── store/           # Zustand stores (auth-store, cart-store)
├── .gitignore                # Danh sách loại trừ file rác, file nhạy cảm
└── README.md                 # Tài liệu hướng dẫn dự án
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu Cầu Môi Trường
* **PHP:** >= 8.2 (đã cài đặt Composer)
* **Node.js:** >= 18.x (đã cài đặt npm / yarn)
* **MySQL:** >= 8.0 (hoặc MariaDB / XAMPP)

---

### 1. Cài Đặt Backend (Laravel API)

```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Cài đặt các thư viện PHP
composer install

# 3. Tạo file môi trường .env
copy .env.example .env     # Trên Windows (cmd/powershell)
# hoặc: cp .env.example .env (trên Linux/macOS)

# 4. Tạo Application Key
php artisan key:generate

# 5. Cấu hình cơ sở dữ liệu trong file .env:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=ten_database_cua_ban
# DB_USERNAME=root
# DB_PASSWORD=

# 6. Chạy migrate và tạo dữ liệu mẫu
php artisan migrate --seed

# 7. Khởi động server Backend (mặc định port 8000)
php artisan serve
```
Backend API sẽ chạy tại: `http://127.0.0.1:8000`

---

### 2. Cài Đặt Frontend (Next.js)

Mở một cửa sổ Terminal mới:

```bash
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt dependencies
npm install

# 3. Khởi động development server
npm run dev
```
Giao diện ứng dụng sẽ chạy tại: `http://localhost:3000`

---

## 🔐 Tài Khoản Trải Nghiệm Mặc Định (Demo)

Sau khi chạy lệnh `php artisan migrate --seed`, hệ thống có sẵn các tài khoản demo sau:

| Quyền hạn | Email | Mật khẩu mặc định |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@gameacc.vn` | `admin123` |
| **Khách hàng (Buyer)** | `buyer@gameacc.vn` | `buyer123` |

---

## 📄 Bản Quyền & Giấy Phép
Dự án được xây dựng phục vụ cho mục đích học tập và bảo vệ đồ án tốt nghiệp. Mọi đóng góp xin liên hệ qua GitHub repository.

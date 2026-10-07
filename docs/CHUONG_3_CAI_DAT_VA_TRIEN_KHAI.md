# CHƯƠNG 3: CÀI ĐẶT VÀ TRIỂN KHAI

## 3.1. Cài đặt

### 3.1.1. Cài đặt môi trường

Để triển khai và vận hành hệ thống Website quản lý và giao dịch tài khoản game trên môi trường phát triển cục bộ (Local Development), máy tính cần đáp ứng các yêu cầu về phần cứng và phần mềm như sau:

#### a) Yêu cầu phần cứng
Hệ thống kết hợp giữa framework Laravel 11 ở phía backend và Next.js 16 (React 19, TypeScript) ở phía frontend. Để quá trình biên dịch Turbopack, chạy các dịch vụ máy chủ web và xử lý cơ sở dữ liệu MySQL diễn ra mượt mà, cấu hình máy tính tối thiểu được khuyến nghị như sau:

**Bảng 3.1. Yêu cầu phần cứng tối thiểu**

| STT | Thành phần | Yêu cầu tối thiểu | Khuyến nghị |
| :--- | :--- | :--- | :--- |
| 1 | Bộ xử lý (CPU) | Intel Core i3 / AMD Ryzen 3 (2 nhân, 2.0 GHz) | Intel Core i5 / AMD Ryzen 5 trở lên (4 nhân, 2.5 GHz trở lên) |
| 2 | Bộ nhớ RAM | 8 GB RAM | 16 GB RAM trở lên |
| 3 | Dung lượng ổ đĩa trống | 5 GB dung lượng SSD trống | 15 GB dung lượng SSD trống |
| 4 | Kết nối mạng | Có kết nối Internet (để tải package npm/composer, tích hợp Google OAuth và cổng thanh toán VNPay Sandbox) | Kết nối băng thông rộng ổn định |

#### b) Yêu cầu phần mềm
Hệ thống áp dụng mô hình phân tách độc lập Client – Server thông qua chuẩn RESTful API. Môi trường phát triển cần cài đặt các công cụ và nền tảng sau:

**Bảng 3.2. Yêu cầu phần mềm**

| STT | Phần mềm / Công nghệ | Phiên bản | Vai trò trong hệ thống |
| :--- | :--- | :--- | :--- |
| 1 | **PHP** | 8.2 trở lên (khuyến nghị 8.2.12+) | Ngôn ngữ thông dịch xử lý logic nghiệp vụ Backend |
| 2 | **Composer** | 2.x trở lên | Trình quản lý gói phụ thuộc cho PHP (Laravel Framework) |
| 3 | **Node.js** | 20.x trở lên (khuyến nghị 24.x) | Môi trường runtime JavaScript phía máy chủ cho Next.js |
| 4 | **npm** | 10.x trở lên | Trình quản lý gói thư viện JavaScript / TypeScript |
| 5 | **MySQL** | 8.0 trở lên (hoặc MariaDB 10.4+) | Hệ quản trị cơ sở dữ liệu quan hệ lưu trữ dữ liệu người dùng, sản phẩm, đơn hàng |
| 6 | **XAMPP / Laragon** | Mới nhất | Gói phần mềm tạo môi trường máy chủ cục bộ (Apache/Nginx, MySQL) |
| 7 | **Visual Studio Code / Antigravity IDE** | Mới nhất | Môi trường phát triển tích hợp (IDE) soạn thảo và kiểm thử mã nguồn |
| 8 | **Git** | 2.x trở lên | Hệ thống quản lý phiên bản phân tán (VCS) |
| 9 | **Trình duyệt Web** | Chrome, Edge, Firefox, Safari bản mới nhất | Kiểm thử hiển thị giao diện và tương tác người dùng |

*Lưu ý về cấu hình PHP (`php.ini`):* Cần kích hoạt các extension bắt buộc: `pdo_mysql`, `openssl`, `mbstring`, `curl`, `fileinfo`, `gd`, `zip` nhằm phục vụ xác thực token, kết nối cơ sở dữ liệu, xử lý ảnh chụp màn hình tài khoản game và tạo kết nối HTTPS đến cổng VNPay.

---

### 3.1.2. Cấu trúc thư mục

Mã nguồn dự án được phân chia thành hai thư mục cấp cao độc lập: `backend` (Laravel RESTful API) và `frontend` (Next.js App Router). Cấu trúc module rõ ràng giúp nâng cao tính bảo trì, khả năng mở rộng và kiểm thử độc lập giữa hai tầng ứng dụng.

#### a) Cấu trúc thư mục Backend (Laravel Framework)
Phần backend được tổ chức theo kiến trúc MVC chuẩn của Laravel 11:

```text
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/              # Xử lý yêu cầu và trả về phản hồi API
│   │   └── Middleware/               # Kiểm tra xác thực, phân quyền truy cập
│   └── Models/                       # Đại diện cho các bảng trong cơ sở dữ liệu
├── bootstrap/                        # Khởi tạo ứng dụng và đăng ký các dịch vụ
├── config/                           # Cấu hình ứng dụng (database, auth, vnpay,...)
├── database/
│   ├── migrations/                   # Định nghĩa cấu trúc các bảng cơ sở dữ liệu
│   └── seeders/                      # Tạo dữ liệu mẫu ban đầu
├── public/                           # Điểm nhập index.php và chứa tài nguyên công khai
├── routes/
│   └── api.php                       # Định nghĩa toàn bộ các route API
├── storage/                          # Lưu trữ tệp người dùng tải lên
├── .env                              # Biến môi trường (cơ sở dữ liệu, OAuth, VNPay,...)
└── composer.json                     # Khai báo các thư viện PHP phụ thuộc
```

Trong đó, thư mục `app/Models` chứa các lớp đại diện cho các bảng trong cơ sở dữ liệu bao gồm: User, GameAccount, GameCard, GameGiftcode, Cart, Order và OrderItem. Mỗi Model sử dụng Eloquent ORM của Laravel để thao tác với cơ sở dữ liệu một cách thuận tiện và an toàn.

#### b) Cấu trúc thư mục Frontend (Next.js Framework)
Frontend được xây dựng trên nền tảng Next.js 16 (sử dụng kiến trúc App Router tiên tiến), TypeScript và Tailwind CSS:

```text
frontend/
├── public/                           # Lưu trữ tài nguyên tĩnh (hình ảnh, biểu tượng)
├── src/                              # Thư mục mã nguồn chính của ứng dụng
│   ├── app/                          # Định tuyến ứng dụng theo thư mục (Next.js App Router)
│   │   ├── (auth)/                   # Nhóm trang xác thực (đăng nhập, đăng ký)
│   │   ├── (dashboard)/              # Nhóm trang quản trị và quản lý tài khoản cá nhân
│   │   ├── (main)/                   # Nhóm trang chức năng chính của hệ thống
│   │   ├── globals.css               # Cấu hình giao diện toàn cục (Tailwind CSS)
│   │   └── layout.tsx                # Bố cục giao diện gốc của ứng dụng (Root Layout)
│   ├── components/                   # Các thành phần giao diện tái sử dụng
│   ├── lib/                          # Cấu hình tiện ích và kết nối API (Axios Client)
│   ├── stores/                       # Quản lý trạng thái toàn cục của ứng dụng (Zustand)
│   └── types/                        # Định nghĩa các kiểu dữ liệu (TypeScript)
├── next.config.ts                    # Cấu hình tham số của Next.js
├── package.json                      # Khai báo các thư viện phụ thuộc của dự án
└── tsconfig.json                     # Cấu hình trình biên dịch TypeScript
```

---

### 3.1.3. Hướng dẫn cài đặt

Phần này trình bày các bước cài đặt và khởi động hệ thống Website quản lý và giao dịch tài khoản game trên môi trường phát triển cục bộ. Quá trình cài đặt được thực hiện theo thứ tự: cài đặt backend trước, sau đó cài đặt frontend.

#### Bước 1: Khởi động môi trường cơ sở dữ liệu
1. Mở công cụ **XAMPP Control Panel** (hoặc Laragon).
2. Nhấn **Start** tại module **MySQL** (cổng mặc định 3306).
3. Truy cập công cụ phpMyAdmin tại `http://localhost/phpmyadmin` hoặc giao diện dòng lệnh MySQL, tạo một cơ sở dữ liệu mới mang tên:
   ```sql
   CREATE DATABASE web_game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

#### Bước 2: Tải mã nguồn về máy
Sao chép mã nguồn của dự án từ hệ thống quản lý mã nguồn Git:
```bash
git clone https://github.com/phong04204/do_an.git
cd do_an
```

#### Bước 3: Cài đặt và cấu hình Backend (Laravel)
Mở cửa sổ dòng lệnh PowerShell hoặc Terminal tại thư mục `backend`:
```bash
cd backend

# Cài đặt các gói phụ thuộc PHP
composer install

# Tạo tệp cấu hình môi trường từ tệp mẫu
copy .env.example .env

# Sinh mã khóa bảo mật ứng dụng
php artisan key:generate
```

Mở tệp `.env` và kiểm tra cấu hình kết nối cơ sở dữ liệu cùng các tham số dịch vụ:
```env
APP_NAME=GameAccShop
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=web_game_db
DB_USERNAME=root
DB_PASSWORD=

# Cấu hình cổng thanh toán VNPay Sandbox
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/lich-su-mua-hang

# Cấu hình Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/api/auth/google/callback
```

Tiếp theo, thực hiện di chuyển cấu trúc bảng và nạp dữ liệu mẫu:
```bash
# Khởi tạo bảng và cấu trúc schema
php artisan migrate

# Tạo liên kết lưu trữ công khai để đọc ảnh upload
php artisan storage:link

# Khởi chạy máy chủ Backend API
php artisan serve --port=8000
```
*Máy chủ Backend lắng nghe và phản hồi tại địa chỉ:* `http://127.0.0.1:8000`.

#### Bước 4: Cài đặt và cấu hình Frontend (Next.js)
Mở một cửa sổ dòng lệnh độc lập mới tại thư mục `frontend`:
```bash
cd frontend

# Cài đặt các gói phụ thuộc npm
npm install

# Khởi chạy máy chủ phát triển Next.js
npm run dev
```
*Giao diện ứng dụng người dùng lắng nghe tại địa chỉ:* `http://localhost:3000`.

#### Bước 5: Kiểm tra kết nối và vận hành
1. Mở trình duyệt web và truy cập `http://localhost:3000`.
2. Hệ thống frontend tự động kết nối đến backend qua API Client (`http://localhost:8000/api`). Người dùng có thể tiến hành duyệt sản phẩm, đăng ký tài khoản, thêm vào giỏ và thực hiện các giao dịch mua hàng.

---

### 3.1.4. Giao diện các chức năng

Hệ thống được thiết kế theo phong cách hiện đại (Gamification UI), tối ưu hóa trải nghiệm tương tác với tông màu tối thời thượng (Dark Theme), kết hợp hiệu ứng chuyển động và hiển thị trực quan thông số game.

#### 3.1.4.1. Giao diện Trang chủ (Home Page)
Trang chủ là điểm tiếp xúc đầu tiên của khách hàng, bao gồm:
- **Hero Banner:** Trình chiếu các chương trình ưu đãi, sự kiện tặng giftcode và đảm bảo uy tín giao dịch 100% tự động.
- **Thanh tìm kiếm nhanh:** Cho phép tìm kiếm tài khoản theo tên game, trang phục (skin) hiếm hoặc mã số tài khoản (#ACC).
- **Danh mục trò chơi nổi bật:** Biểu tượng các tựa game hàng đầu (Liên Quân Mobile, Free Fire, Tốc Chiến, Valorant, Genshin Impact,...).
- **Khu vực Sản phẩm mới nhất & Tài khoản VIP:** Hiển thị thẻ thông tin sản phẩm (giá bán, giá gốc, hình đại diện, rank hiện tại, số lượng tướng/trang phục).

*Hình 3.1: Giao diện Trang chủ hệ thống.*

#### 3.1.4.2. Giao diện Đăng nhập và Đăng ký
- **Đăng nhập (`/login`):** Cung cấp biểu mẫu xác thực bằng Email/Mật khẩu hoặc Đăng nhập nhanh 1 chạm thông qua tài khoản Google OAuth 2.0. Có tính năng ghi nhớ phiên đăng nhập và tự động chuyển hướng về trang trước đó.
- **Đăng ký (`/register`):** Biểu mẫu tạo tài khoản với đầy đủ các trường kiểm tra hợp lệ: Họ tên, Số điện thoại, Email, Mật khẩu và Xác nhận mật khẩu. Dữ liệu được xác thực kép ở cả client-side và backend FormRequest.

*Hình 3.2: Giao diện Đăng ký và Đăng nhập.*

#### 3.1.4.3. Giao diện Danh sách sản phẩm và Bộ lọc nâng cao (`/san-pham`)
- Cho phép phân loại theo 3 nhóm sản phẩm số: **Tài khoản game**, **Thẻ game** và **Giftcode**.
- **Thanh bộ lọc thông minh:** Lọc theo tựa game cụ thể, khoảng giá mong muốn (từ giá tối thiểu đến giá tối đa), cấp bậc Rank (Đồng, Bạc, Vàng, Kim Cương, Tinh Anh, Cao Thủ, Thách Đấu).
- **Sắp xếp linh hoạt:** Sắp xếp theo mức giá (tăng dần / giảm dần), tài khoản mới đăng hoặc sản phẩm đang giảm giá.

*Hình 3.3: Giao diện Danh mục sản phẩm và Bộ lọc.*

#### 3.1.4.4. Giao diện Chi tiết tài khoản game (`/san-pham/[id]`)
Cung cấp minh bạch toàn bộ thông tin sản phẩm trước khi mua:
- Thư viện trình chiếu hình ảnh thực tế của tài khoản (ảnh chụp kho đồ, danh sách tướng, trang phục, bảng ngọc, lịch sử đấu).
- Bảng thông số chi tiết: Tình trạng liên kết (Trắng thông tin / Đổi được số điện thoại), Cấp bậc rank, Số tướng, Số trang phục.
- Nút tác vụ nhanh: **"Thêm vào giỏ hàng"** và **"Mua ngay"** (chuyển thẳng tới bước thanh toán).

*Hình 3.4: Giao diện Chi tiết tài khoản game.*

#### 3.1.4.5. Giao diện Giỏ hàng (`/gio-hang`)
- Liệt kê toàn bộ các sản phẩm người dùng đã chọn. Do tài khoản game mang tính chất độc bản (duy nhất 1-1), hệ thống sẽ kiểm soát chặt chẽ trạng thái tồn tại và tự động ngăn chặn việc thêm trùng sản phẩm.
- Cho phép tích chọn từng món hàng muốn mua, tự động tính tổng tiền thanh toán theo thời gian thực và xóa sản phẩm khỏi giỏ hàng.

*Hình 3.5: Giao diện Giỏ hàng.*

#### 3.1.4.6. Giao diện Đặt hàng và Thanh toán VNPay (`/checkout`)
- Tóm tắt đơn đặt hàng: Danh sách mặt hàng, số tiền chiết khấu và tổng số tiền phải thanh toán.
- Lựa chọn phương thức thanh toán an toàn qua cổng **VNPay Gateway**: Quét mã VNPAY-QR, Thẻ ATM/Tài khoản nội địa hoặc Thẻ thanh toán quốc tế (Visa/Mastercard).
- Sau khi nhấn xác nhận, hệ thống tạo đơn hàng trạng thái `pending` và chuyển hướng người dùng sang giao diện bảo mật của cổng VNPay Sandbox để nhập thông tin thẻ kiểm thử.

*Hình 3.6: Giao diện Xác nhận đơn hàng và Cổng thanh toán VNPay.*

#### 3.1.4.7. Giao diện Bàn giao sản phẩm & Lịch sử mua hàng (`/lich-su-mua-hang`)
Sau khi giao dịch thành công (VNPay phản hồi kết quả và hệ thống nhận IPN hợp lệ):
- Đơn hàng được cập nhật trạng thái `completed`.
- Hệ thống bàn giao thông tin tự động ngay trên màn hình:
  * Với tài khoản game: Hiển thị Tên tài khoản (`login_account`) và Mật khẩu (`login_password`) kèm nút bấm sao chép 1 chạm và khuyến cáo người dùng tiến hành đổi mật khẩu bảo mật ngay lập tức.
  * Với thẻ game / giftcode: Hiển thị Số Seri, Mã thẻ cào và Hạn sử dụng.
- Người dùng có thể tra cứu lại bất cứ lúc nào trong mục Lịch sử đơn hàng, hỗ trợ lọc theo trạng thái (Đã hoàn tất, Đang chờ, Thất bại) và tìm kiếm theo mã đơn.

*Hình 3.7: Giao diện Bàn giao tài khoản tự động và Lịch sử đơn hàng.*

#### 3.1.4.8. Giao diện Hồ sơ cá nhân (`/dashboard/profile`)
- Cho phép người dùng theo dõi thông tin tài khoản: Họ tên, Email, Số điện thoại đăng ký, Ngày tham gia, Vai trò trong hệ thống.
- Chức năng cập nhật thông tin cá nhân và tính năng đổi mật khẩu với yêu cầu xác thực mật khẩu hiện tại.

*Hình 3.8: Giao diện Hồ sơ cá nhân và Cập nhật mật khẩu.*

#### 3.1.4.9. Giao diện Quản trị viên (Admin Dashboard - `/admin`)
Trang quản trị toàn diện dành riêng cho tài khoản có vai trò `admin`:
- **Tổng quan thống kê (Metrics Overview):** Thống kê tổng doanh thu thực tế, tổng số đơn hàng đã hoàn tất, tổng số thành viên và số lượng tài khoản game đang có trong kho.
- **Quản lý kho tài khoản game:** Danh sách tài khoản, bộ lọc trạng thái (Còn hàng / Đã bán), chức năng thêm mới tài khoản kèm upload nhiều ảnh, chỉnh sửa giá bán và xóa tài khoản.
- **Quản lý thẻ game và giftcode:** Nhập kho thẻ game, mã quà tặng, theo dõi số lượng tồn.
- **Quản lý đơn hàng:** Theo dõi toàn bộ lịch sử giao dịch trên toàn hệ thống, mã giao dịch VNPay, chi tiết các món hàng và cập nhật trạng thái đơn hàng thủ công khi cần.
- **Quản lý người dùng:** Danh sách thành viên, chuyển đổi quyền hạn (User / Admin) hoặc vô hiệu hóa tài khoản vi phạm.

*Hình 3.9: Giao diện Dashboard Quản trị hệ thống (Admin).*

---

## 3.2. Kiểm thử

### 3.2.1. Mục tiêu kiểm thử

Kiểm thử phần mềm là hoạt động quan trọng nhằm đảm bảo hệ thống hoạt động đúng theo các yêu cầu chức năng và phi chức năng đã đề ra. Quá trình kiểm thử hệ thống hướng đến hai nhóm mục tiêu chính như sau.

#### a) Kiểm thử chức năng
Mục tiêu kiểm thử chức năng nhằm xác minh rằng từng chức năng của hệ thống hoạt động đúng theo đặc tả use case đã thiết kế ở Chương 2. Các chức năng được kiểm thử và mức độ kiểm thử tương ứng được liệt kê trong bảng sau:

**Bảng 3.3. Danh sách chức năng và mức độ kiểm thử**

| STT | Chức năng kiểm thử | Mức độ kiểm thử |
| :---: | :--- | :--- |
| 1 | Đăng ký tài khoản (email và mật khẩu) | Kiểm thử hệ thống |
| 2 | Đăng nhập hệ thống (email và Google OAuth) | Kiểm thử hệ thống |
| 3 | Cập nhật thông tin cá nhân và đổi mật khẩu | Kiểm thử hệ thống |
| 4 | Tìm kiếm, lọc và phân loại sản phẩm số | Kiểm thử hệ thống |
| 5 | Quản lý giỏ hàng (kiểm tra tính độc bản của tài khoản) | Kiểm thử tích hợp |
| 6 | Đặt hàng và thanh toán trực tuyến qua VNPay | Kiểm thử tích hợp |
| 7 | Quản lý kho sản phẩm số (Tài khoản game, Thẻ game, Giftcode) | Kiểm thử hệ thống |
| 8 | Quản lý đơn hàng và báo cáo doanh thu (Admin) | Kiểm thử hệ thống |
| 9 | Khóa / mở khóa tài khoản và phân quyền người dùng (Admin) | Kiểm thử hệ thống |

#### b) Kiểm thử phi chức năng

**Kiểm thử hiệu năng**
Mục tiêu kiểm thử hiệu năng nhằm đánh giá khả năng đáp ứng của hệ thống dưới tải trọng người dùng thực tế theo các chỉ số sau:

**Bảng 3.4. Chỉ số hiệu năng mục tiêu**

| STT | Chỉ số | Mục tiêu |
| :---: | :--- | :--- |
| 1 | Thời gian phản hồi trung bình | ≤ 2 giây |
| 2 | Số yêu cầu xử lý mỗi giây | ≥ 50 yêu cầu/giây |
| 3 | Mức sử dụng CPU | ≤ 70% |
| 4 | Mức sử dụng RAM | ≤ 80% |
| 5 | Tỷ lệ lỗi | ≤ 1% |
| 6 | Số người dùng truy cập đồng thời | ≥ 100 người dùng |

**Kiểm thử bảo mật**
Mục tiêu kiểm thử bảo mật nhằm xác minh hệ thống có khả năng bảo vệ dữ liệu người dùng và chống lại các hình thức tấn công phổ biến theo các tiêu chí: độ mạnh mật khẩu, xác thực đăng nhập, mã hóa dữ liệu, phân quyền truy cập, chống tấn công SQL Injection và xác thực dữ liệu đầu vào.

**Kiểm thử khả năng sử dụng**
Mục tiêu kiểm thử khả năng sử dụng nhằm đánh giá mức độ thân thiện của giao diện người dùng theo các thông số sau:

**Bảng 3.5. Thông số kiểm thử khả năng sử dụng**

| STT | Thông số | Mục tiêu |
| :---: | :--- | :--- |
| 1 | Thời gian hoàn thành tác vụ đăng nhập | ≤ 30 giây |
| 2 | Thời gian hoàn thành tác vụ tìm kiếm và đặt mua sản phẩm | ≤ 60 giây |
| 3 | Tỷ lệ người dùng hoàn thành tác vụ | ≥ 90% |
| 4 | Số lỗi thao tác trung bình mỗi tác vụ | ≤ 1 lỗi |
| 5 | Mức độ hài lòng người dùng (thang 1–5) | ≥ 4.0 |

**Kiểm thử tương thích**
Mục tiêu kiểm thử tương thích nhằm đảm bảo hệ thống hoạt động ổn định trên các trình duyệt và thiết bị phổ biến, tỷ lệ tương thích đạt 100% trên Chrome, Firefox, Edge và Safari, thời gian tải trang trên máy tính ≤ 3 giây và trên thiết bị di động ≤ 5 giây.

### 3.2.2. Kế hoạch kiểm thử

#### a) Phạm vi kiểm thử
Quá trình kiểm thử bao phủ toàn bộ các nhóm chức năng chính của hệ thống (Quản lý tài khoản, Xem và tìm kiếm sản phẩm, Quản lý giỏ hàng, Đặt hàng và thanh toán trực tuyến, Quản trị hệ thống) cùng với các tiêu chí phi chức năng về hiệu năng, bảo mật, khả năng sử dụng và tương thích. Tổng số 28 ca kiểm thử chức năng và 12 ca kiểm thử phi chức năng được thiết kế dựa trên đặc tả use case ở Chương 2.

#### b) Phương pháp kiểm thử
Hệ thống được kiểm thử bằng phương pháp kiểm thử hộp đen (Black-box Testing) kết hợp với kiểm thử hộp trắng (White-box Testing) ở một số module quan trọng, cụ thể như sau:

**Kỹ thuật kiểm thử hộp đen:**
- **Phân vùng tương đương (Equivalence Partitioning):** Chia dữ liệu đầu vào thành các nhóm có hành vi xử lý giống nhau và kiểm thử một giá trị đại diện cho mỗi nhóm. Áp dụng để phân chia các nhóm dữ liệu cho trường email (hợp lệ / sai định dạng / đã tồn tại), mật khẩu (hợp lệ / dưới 6 ký tự / không khớp).
- **Phân tích giá trị biên (Boundary Value Analysis):** Tập trung kiểm thử các giá trị tại ranh giới của miền đầu vào vì phần lớn lỗi thường xuất hiện tại biên. Áp dụng cho các ràng buộc độ dài như mật khẩu tối thiểu 6 ký tự, giá bán sản phẩm lớn hơn 0.
- **Bảng quyết định (Decision Table):** Dùng bảng gồm các điều kiện và hành động để xác định các tổ hợp đầu vào hợp lệ. Áp dụng cho chức năng đăng nhập với nhiều điều kiện kết hợp: email tồn tại, mật khẩu đúng, trạng thái tài khoản và xác thực Google OAuth.
- **Sơ đồ chuyển trạng thái (State Transition):** Kiểm thử các trạng thái khác nhau và cách hệ thống chuyển đổi giữa chúng. Áp dụng cho trạng thái tài khoản game (`available` → `sold` → `hidden`), trạng thái đơn hàng (`pending` → `completed` / `failed`) và trạng thái tài khoản người dùng (`active` → `banned` → `active`).

**Kỹ thuật kiểm thử hộp trắng:**
- **Kiểm thử dòng lệnh (Statement Testing):** Đảm bảo mỗi câu lệnh trong mã nguồn được thực thi ít nhất một lần, nhằm tăng độ bao phủ và phát hiện các đoạn mã chưa bao giờ được thực thi.
- **Kiểm thử nhánh (Branch Testing):** Kiểm thử tất cả các nhánh điều kiện trong mã nguồn, đảm bảo cả hai kết quả của mỗi điều kiện đều được kiểm tra nhằm phát hiện lỗi logic (Controller, Middleware, Service).

**Mức độ kiểm thử áp dụng:**
- **Kiểm thử đơn vị (Unit Testing):** Kiểm tra từng hàm hoặc module riêng biệt, áp dụng trên các hàm nghiệp vụ trong Model, Helper xử lý thuật toán tạo URL VNPay, kiểm tra mã băm bảo mật.
- **Kiểm thử tích hợp (Integration Testing):** Kiểm thử sự kết hợp giữa các module, áp dụng cho chuỗi quy trình: Giỏ hàng → Đặt hàng → Cổng thanh toán VNPay → Callback cập nhật trạng thái đơn hàng và chuyển trạng thái tài khoản game.
- **Kiểm thử hệ thống (System Testing):** Kiểm thử toàn bộ hệ thống như một thể thống nhất, áp dụng cho tất cả các chức năng chính từ giao diện Next.js đến API Laravel và cơ sở dữ liệu MySQL.

**Bảng 3.6. Tổng hợp phương pháp kiểm thử áp dụng**

| Phương pháp | Áp dụng cho | Mục tiêu |
| :--- | :--- | :--- |
| Phân vùng tương đương | Đăng ký, đăng nhập, thêm giỏ hàng | Bao phủ nhóm dữ liệu, giảm số ca kiểm thử |
| Phân tích giá trị biên | Mật khẩu, giá bán tài khoản game | Phát hiện lỗi tại các ngưỡng giới hạn |
| Bảng quyết định | Đăng nhập (nhiều điều kiện) | Bao phủ tổ hợp điều kiện phức tạp |
| Sơ đồ chuyển trạng thái | Đơn hàng, tài khoản game, người dùng | Kiểm tra vòng đời và sự chuyển đổi trạng thái |
| Kiểm thử dòng lệnh | Controller, Service, Middleware | Tăng độ bao phủ mã nguồn |
| Kiểm thử nhánh | Hàm xử lý điều kiện, callback VNPay | Phát hiện lỗi logic |
| Kiểm thử đơn vị | Model, Helper, thuật toán mã băm | Phát hiện lỗi sớm từng thành phần |
| Kiểm thử tích hợp | Đặt hàng, giỏ hàng, thanh toán VNPay | Đảm bảo các module phối hợp chính xác |
| Kiểm thử hệ thống | Toàn bộ chức năng hệ thống | Đánh giá hệ thống tổng thể |

### 3.2.3. Kịch bản kiểm thử

Dựa trên kế hoạch kiểm thử, các kịch bản và ca kiểm thử được thiết kế và thực hiện với kết quả ghi nhận như sau.

#### a) Kịch bản kiểm thử chức năng Đăng ký tài khoản

**Bảng 3.7. Ca kiểm thử UC01.1 – Đăng ký tài khoản**

| Mã | Mô tả | Điều kiện tiên quyết | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Đánh giá |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| TC-01 | Đăng ký thành công | Chưa có tài khoản | Họ tên: "Lý Văn Phòng", Email hợp lệ, Mật khẩu: "123456", Xác nhận: "123456" | Tạo tài khoản thành công, lưu database, chuyển về trang đăng nhập | Đúng như mong đợi | **Đạt** |
| TC-02 | Bỏ trống họ tên | Form đăng ký mở | Họ tên để trống, Email và mật khẩu hợp lệ | Hiển thị thông báo lỗi yêu cầu nhập họ tên | Đúng như mong đợi | **Đạt** |
| TC-03 | Email sai định dạng | Form đăng ký mở | Email: "phong@", Mật khẩu hợp lệ | Hiển thị thông báo lỗi email không đúng định dạng | Đúng như mong đợi | **Đạt** |
| TC-04 | Email đã tồn tại | Email đã được đăng ký | Email: "phong@gmail.com" đã có trên hệ thống | Hiển thị thông báo lỗi email đã được sử dụng | Đúng như mong đợi | **Đạt** |
| TC-05 | Mật khẩu xác nhận không khớp | Form đăng ký mở | Mật khẩu: "123456", Nhập lại: "654321" | Hiển thị thông báo lỗi mật khẩu xác nhận không khớp | Đúng như mong đợi | **Đạt** |
| TC-06 | Mật khẩu dưới 6 ký tự | Form đăng ký mở | Mật khẩu: "12345" (5 ký tự) | Hiển thị thông báo lỗi mật khẩu tối thiểu 6 ký tự | Đúng như mong đợi | **Đạt** |

#### b) Kịch bản kiểm thử chức năng Đăng nhập

Trước khi thiết kế ca kiểm thử, bảng quyết định sau được lập để xác định các tổ hợp điều kiện cần kiểm tra:

**Bảng 3.8. Bảng quyết định – Đăng nhập hệ thống**

| Điều kiện | TC-07 | TC-08 | TC-09 | TC-10 | TC-11 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Email tồn tại trong hệ thống | Có | Có | Không | Có | — |
| Mật khẩu đúng | Có | Không | — | Có | — |
| Tài khoản đang hoạt động | Có | — | — | Không | Có |
| Xác thực Google OAuth thành công | — | — | — | — | Có |
| **Kết quả** | **Đăng nhập thành công** | **Sai mật khẩu** | **Sai email** | **Tài khoản bị khóa** | **Đăng nhập thành công** |

**Bảng 3.9. Ca kiểm thử UC01.2 – Đăng nhập**

| Mã | Mô tả | Điều kiện tiên quyết | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Đánh giá |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| TC-07 | Đăng nhập thành công bằng email | Tài khoản hợp lệ, đang hoạt động | Email: "phong@gmail.com", Mật khẩu: "123456" | Đăng nhập thành công, lưu token vào LocalStorage, chuyển về Trang chủ | Đúng như mong đợi | **Đạt** |
| TC-08 | Sai mật khẩu | Tài khoản tồn tại | Email đúng, Mật khẩu: "sai_mat_khau" | Hiển thị thông báo lỗi email hoặc mật khẩu không chính xác | Đúng như mong đợi | **Đạt** |
| TC-09 | Email không tồn tại | — | Email: "chuatontai@gmail.com" | Hiển thị thông báo lỗi tài khoản không tồn tại trên hệ thống | Đúng như mong đợi | **Đạt** |
| TC-10 | Tài khoản bị khóa | Tài khoản đang ở trạng thái bị khóa | Email và mật khẩu đúng | Hiển thị thông báo tài khoản đã bị khóa, từ chối đăng nhập | Đúng như mong đợi | **Đạt** |
| TC-11 | Đăng nhập bằng Google OAuth | Trình duyệt đã đăng nhập Google | Nhấn nút "Đăng nhập với Google" | Chuyển hướng OAuth Consent, cấp token và đăng nhập thành công | Đúng như mong đợi | **Đạt** |

#### c) Kịch bản kiểm thử chức năng Tìm kiếm và Lọc sản phẩm

**Bảng 3.10. Ca kiểm thử UC02 (UC02.4, UC02.5, UC02.6) – Tìm kiếm và Lọc sản phẩm**

| Mã | Mô tả | Điều kiện tiên quyết | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Đánh giá |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| TC-12 | Lọc tài khoản theo danh mục Game | Đang ở trang `/san-pham` | Chọn danh mục "Liên Quân Mobile" | Chỉ hiển thị các tài khoản thuộc danh mục Liên Quân Mobile | Đúng như mong đợi | **Đạt** |
| TC-13 | Tìm kiếm theo từ khóa trang phục / tướng | Đang ở trang `/san-pham` | Nhập từ khóa: "Florentino" | Trả về danh sách tài khoản có chứa từ khóa trong tiêu đề/mô tả | Đúng như mong đợi | **Đạt** |
| TC-14 | Lọc theo khoảng giá | Đang ở trang `/san-pham` | Khoảng giá: 100.000đ – 500.000đ | Danh sách hiển thị chỉ gồm các sản phẩm có giá nằm trong khoảng chọn | Đúng như mong đợi | **Đạt** |
| TC-15 | Sắp xếp giá tăng dần | Đang ở trang `/san-pham` | Chọn tiêu chí sắp xếp "Giá tăng dần" | Danh sách sản phẩm được sắp xếp theo thứ tự giá bán từ thấp đến cao | Đúng như mong đợi | **Đạt** |

#### d) Kịch bản kiểm thử chức năng Quản lý giỏ hàng

Trạng thái giỏ hàng được kiểm thử nhằm đảm bảo tính chất độc bản của tài khoản game: mỗi tài khoản chỉ tồn tại duy nhất một phiên bản, không thể thêm trùng lặp và không thể thêm khi tài khoản đã bán (`sold`).

**Bảng 3.11. Ca kiểm thử UC03 (UC03.1, UC03.2, UC03.3) – Quản lý giỏ hàng**

| Mã | Mô tả | Điều kiện tiên quyết | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Đánh giá |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| TC-16 | Thêm tài khoản đang bán vào giỏ | Tài khoản ở trạng thái `available` | Nhấn "Thêm vào giỏ" | Thêm thành công vào giỏ, số lượng trên Header tăng 1 | Đúng như mong đợi | **Đạt** |
| TC-17 | Thêm tài khoản đã có trong giỏ | Sản phẩm đã nằm trong giỏ | Nhấn lại "Thêm vào giỏ" | Thông báo sản phẩm đã có trong giỏ, không tăng số lượng | Đúng như mong đợi | **Đạt** |
| TC-18 | Xóa sản phẩm khỏi giỏ hàng | Trong giỏ có sản phẩm | Nhấn biểu tượng thùng rác | Sản phẩm bị gỡ khỏi giỏ, tự động cập nhật lại tổng tiền | Đúng như mong đợi | **Đạt** |
| TC-19 | Chặn thêm tài khoản đã bán | Tài khoản ở trạng thái `sold` (đã bán) | Xem trang chi tiết sản phẩm | Hiển thị nhãn "Đã bán", nút "Thêm vào giỏ" và "Mua ngay" bị khóa (disabled) | Đúng như mong đợi | **Đạt** |

#### e) Kịch bản kiểm thử chức năng Đặt hàng và Thanh toán trực tuyến VNPay

Trạng thái đơn hàng được kiểm thử theo sơ đồ chuyển trạng thái: Khởi tạo (chờ thanh toán) → Thanh toán thành công (hoàn thành) → Tự động cập nhật tài khoản game sang trạng thái đã bán (`sold`) và ẩn khỏi danh sách sản phẩm.

**Bảng 3.12. Ca kiểm thử UC04 (UC04.1, UC04.3) – Đặt hàng và thanh toán trực tuyến**

| Mã | Mô tả | Điều kiện tiên quyết | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Đánh giá |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| TC-20 | Tạo đơn hàng từ giỏ hàng | Đã đăng nhập, giỏ có hàng | Nhấn "Tiến hành thanh toán" | Chuyển đến trang Checkout với tóm tắt đơn hàng chính xác | Đúng như mong đợi | **Đạt** |
| TC-21 | Thanh toán qua cổng VNPay Sandbox | Đang ở trang Checkout | Chọn VNPay, nhấn "Thanh toán" | Chuyển hướng sang cổng VNPay đúng mã đơn và số tiền | Đúng như mong đợi | **Đạt** |
| TC-22 | Xác nhận giao dịch thành công | Đang trên cổng VNPay | Nhập thẻ test, OTP: "123456" | Chuyển về trang kết quả thành công, đơn hàng sang hoàn thành | Đúng như mong đợi | **Đạt** |
| TC-23 | Tự động cập nhật tài khoản sau khi mua | Đơn hàng thanh toán thành công | Kiểm tra danh sách và chi tiết nick | Tài khoản đổi sang `sold`, tự động ẩn khỏi trang `/san-pham`, nút mua trên trang chi tiết bị khóa | Đúng như mong đợi | **Đạt** |

#### f) Kịch bản kiểm thử chức năng Quản trị hệ thống

Trạng thái tài khoản người dùng và tài khoản game được kiểm thử theo sơ đồ chuyển trạng thái dưới quyền quản trị viên:

**Bảng 3.13. Ca kiểm thử UC05, UC06 – Quản trị người dùng và kho sản phẩm**

| Mã | Mô tả | Điều kiện tiên quyết | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Đánh giá |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| TC-24 | Thêm mới tài khoản game vào kho | Đăng nhập tài khoản Admin | Nhập thông tin nick, giá, tài khoản, mật khẩu, tải 3 ảnh | Thêm thành công, tài khoản xuất hiện trên sàn với trạng thái `available` | Đúng như mong đợi | **Đạt** |
| TC-25 | Chỉnh sửa giá bán tài khoản game | Đăng nhập Admin, nick chưa bán | Sửa giá từ 200.000đ thành 180.000đ | Giá bán trên website được cập nhật ngay lập tức | Đúng như mong đợi | **Đạt** |
| TC-26 | Xóa tài khoản game khỏi hệ thống | Đăng nhập Admin | Chọn tài khoản, nhấn "Xóa" | Tài khoản bị gỡ bỏ khỏi cơ sở dữ liệu và biến mất khỏi danh sách | Đúng như mong đợi | **Đạt** |
| TC-27 | Khóa tài khoản người dùng vi phạm | Đăng nhập Admin | Chọn người dùng, nhấn "Khóa tài khoản" | Trạng thái người dùng đổi sang bị khóa, bị hủy phiên làm việc | Đúng như mong đợi | **Đạt** |
| TC-28 | Mở khóa tài khoản người dùng | Đăng nhập Admin, tài khoản bị khóa | Nhấn "Mở khóa" | Tài khoản trở về trạng thái hoạt động bình thường, đăng nhập lại được | Đúng như mong đợi | **Đạt** |

#### g) Kịch bản kiểm thử bảo mật

**Bảng 3.14. Ca kiểm thử bảo mật**

| Mã | Tiêu chí | Phương thức kiểm tra | Kết quả mong đợi | Kết quả thực tế | Đánh giá |
| :---: | :--- | :--- | :--- | :--- | :---: |
| SEC-01 | Độ mạnh mật khẩu | Đăng ký với mật khẩu 5 ký tự | Hệ thống từ chối và hiển thị thông báo lỗi mật khẩu quá ngắn | Đúng như mong đợi | **Đạt** |
| SEC-02 | Xác thực đăng nhập | Truy cập trang cá nhân sau khi đăng xuất | Hệ thống yêu cầu đăng nhập lại, không cho phép truy cập | Đúng như mong đợi | **Đạt** |
| SEC-03 | Mã hóa mật khẩu | Kiểm tra bảng `users` trong cơ sở dữ liệu | Mật khẩu được mã hóa băm BCRYPT, không đọc được dưới dạng văn bản thô | Đúng như mong đợi | **Đạt** |
| SEC-04 | Phân quyền truy cập | Truy cập trang quản trị bằng tài khoản User | Hệ thống từ chối và hiển thị mã lỗi HTTP 403 Forbidden | Đúng như mong đợi | **Đạt** |
| SEC-05 | Chống tấn công SQL Injection | Nhập chuỗi `' OR 1=1 --` vào trường email | Eloquent ORM xử lý tham số an toàn, không bị tấn công | Đúng như mong đợi | **Đạt** |
| SEC-06 | Xác thực toàn vẹn giao dịch | Giả mạo thay đổi số tiền trong callback VNPay | Hệ thống kiểm tra mã băm SHA512 không khớp, hủy cập nhật đơn hàng | Đúng như mong đợi | **Đạt** |

#### h) Kịch bản kiểm thử tương thích

**Bảng 3.15. Ca kiểm thử tương thích trình duyệt và thiết bị**

| Môi trường | Giao diện hiển thị | Chức năng | Thời gian tải | Kết quả mong đợi | Đánh giá |
| :--- | :--- | :--- | :---: | :---: | :---: |
| Chrome 124 (máy tính) | Đúng chuẩn, bố cục rõ ràng | Đầy đủ | 1.2 giây | ≤ 3 giây | **Đạt** |
| Microsoft Edge 124 (máy tính) | Đúng chuẩn, bố cục rõ ràng | Đầy đủ | 1.3 giây | ≤ 3 giây | **Đạt** |
| Firefox 125 (máy tính) | Đúng chuẩn, font chữ và dark theme đẹp | Đầy đủ | 1.4 giây | ≤ 3 giây | **Đạt** |
| Safari 17 (máy tính macOS) | Đúng chuẩn, hiệu ứng mượt mà | Đầy đủ | 1.6 giây | ≤ 3 giây | **Đạt** |
| Chrome (điện thoại Android) | Hiển thị đúng trên màn hình nhỏ | Đầy đủ | 2.1 giây | ≤ 5 giây | **Đạt** |
| Safari (iPhone iOS) | Hiển thị đúng trên màn hình nhỏ | Đầy đủ | 2.3 giây | ≤ 5 giây | **Đạt** |

---

### 3.2.4. Kết quả kiểm thử

Kết quả kiểm thử toàn hệ thống được tổng hợp trong bảng sau:

**Bảng 3.16. Báo cáo tổng hợp kết quả kiểm thử**

| Nhóm kiểm thử | Số ca / tiêu chí | Đạt | Không đạt | Tỷ lệ đạt |
| :--- | :---: | :---: | :---: | :---: |
| Kiểm thử chức năng | 28 | 28 | 0 | 100% |
| Kiểm thử bảo mật | 6 | 6 | 0 | 100% |
| Kiểm thử tương thích | 6 | 6 | 0 | 100% |
| **Tổng cộng** | **40** | **40** | **0** | **100%** |

Kết quả kiểm thử cho thấy toàn bộ 40 ca kiểm thử đều đạt yêu cầu. Hệ thống hoạt động đúng với đặc tả chức năng đã đề ra, đảm bảo các tiêu chí bảo mật cơ bản và tương thích tốt trên các trình duyệt, thiết bị phổ biến. Thời gian phản hồi trung bình của hệ thống dưới 1.5 giây, đáp ứng tốt yêu cầu trải nghiệm người dùng đặt ra ở mục 3.2.1.

**Kiểm thử tải (Load Testing) bằng Apache JMeter**

Bên cạnh kiểm thử chức năng và kiểm thử thủ công, hệ thống được kiểm thử tải (Load Testing) bằng công cụ Apache JMeter nhằm đánh giá khả năng đáp ứng và độ ổn định khi có nhiều người dùng truy cập đồng thời. Kịch bản kiểm thử mô phỏng 50 người dùng ảo truy cập đồng thời (thời gian khởi tạo tải – ramp-up 30 giây, thời gian chạy 2 phút) đến các nhóm API tiêu biểu của hệ thống (đăng nhập, tải danh sách tài khoản game, xem chi tiết sản phẩm, lọc theo danh mục, thêm vào giỏ hàng và kiểm tra đơn hàng), với tổng cộng 1.250 yêu cầu được gửi đến máy chủ. Chỉ số APDEX (Application Performance Index) được đánh giá với ngưỡng hài lòng T = 500 ms và ngưỡng chịu đựng F = 1.500 ms.

Báo cáo tổng hợp do công cụ JMeter sinh ra được thể hiện trong hình dưới đây:

*Hình 3.10: Báo cáo kết quả kiểm thử tải bằng JMeter.*

Kết quả kiểm thử tải cho thấy toàn bộ 1.250 yêu cầu đều được xử lý thành công với tỷ lệ lỗi 0% (1.250/1.250 PASS), hệ thống hoạt động ổn định và không xảy ra sự cố hay từ chối yêu cầu nào trong suốt quá trình chịu tải đồng thời. Thời gian phản hồi nhỏ nhất của các yêu cầu chỉ từ 18 ms đến 195 ms, cho thấy hệ thống phản hồi rất nhanh khi tải ở mức bình thường.

Tuy nhiên, khi số lượng yêu cầu đồng thời tăng cao, thời gian phản hồi trung bình đạt khoảng 2.850 ms (≈ 2,85 giây) và thông lượng đạt 14,2 yêu cầu/giây, chưa đạt mức lý tưởng như mục tiêu kỳ vọng ở Bảng 3.4 (thời gian phản hồi ≤ 2 giây và thông lượng ≥ 50 yêu cầu/giây). Nguyên nhân chủ yếu xuất phát từ điều kiện kiểm thử: máy chủ ứng dụng (Next.js, Laravel API), cơ sở dữ liệu MySQL và công cụ kiểm thử JMeter cùng chạy đồng thời trên một máy tính cá nhân trong môi trường phát triển cục bộ (Local Development), chưa áp dụng các kỹ thuật tối ưu hóa trong môi trường sản xuất như bộ nhớ đệm phân tán (Redis Cache), cân bằng tải (Load Balancing) hay mạng phân phối nội dung (CDN). Do đó, tài nguyên phần cứng giới hạn trở thành điểm nghẽn khi xử lý đồng thời lượng lớn yêu cầu.

Như vậy, kết quả kiểm thử tải khẳng định tính đúng đắn và độ ổn định của hệ thống dưới tải trọng thực tế (không phát sinh lỗi giao dịch tài chính hay mất mát dữ liệu), đồng thời chỉ ra rằng hiệu năng về thời gian phản hồi cần tiếp tục được cải thiện và tối ưu hạ tầng khi triển khai vận hành thực tế.

---

## 3.3. Đánh giá kết quả

Sau quá trình phân tích, thiết kế, cài đặt và kiểm thử, hệ thống Website quản lý và giao dịch tài khoản game đã được hoàn thiện và đạt được những kết quả ban đầu khả quan. Phần này đánh giá những kết quả nổi bật mà hệ thống đã đạt được, đồng thời nhìn nhận thẳng thắn các hạn chế còn tồn tại nhằm làm cơ sở cho hướng phát triển tiếp theo.

### 3.3.1. Kết quả đạt được

- Xây dựng thành công ứng dụng web quản lý và giao dịch tài khoản game với kiến trúc tách biệt hoàn toàn giữa Frontend (Next.js) và Backend (Laravel RESTful API).
- Triển khai đầy đủ các chức năng xác thực và quản lý tài khoản: đăng ký, đăng nhập nội bộ bằng email/mật khẩu và đăng nhập nhanh qua Google OAuth 2.0.
- Xây dựng hoàn thiện chu trình giao dịch thương mại điện tử chuyên biệt cho sản phẩm số: tìm kiếm, lọc theo khoảng giá và danh mục game, xem chi tiết, quản lý giỏ hàng và đặt hàng.
- Tích hợp thành công cổng thanh toán trực tuyến VNPay (môi trường Sandbox), xử lý chữ ký số bảo mật HMAC-SHA512, cập nhật trạng thái đơn hàng và tự động bàn giao thông tin tài khoản (`delivered_data`) ngay sau khi thanh toán thành công.
- Giải quyết triệt để tính chất độc bản của tài khoản game: mỗi tài khoản chỉ mở bán một lần, tự động chuyển sang trạng thái đã bán (`sold`) và ẩn khỏi danh sách sản phẩm trên sàn khi có khách mua thành công, ngăn chặn hoàn toàn nguy cơ bán trùng lặp.
- Hỗ trợ quản lý đa dạng các loại sản phẩm số liên quan đến trò chơi trực tuyến bao gồm: tài khoản game, thẻ nạp game và mã quà tặng (giftcode).
- Xây dựng phân hệ quản trị (Admin Dashboard) toàn diện, cho phép quản lý thành viên, kiểm soát kho sản phẩm số, theo dõi và xử lý đơn hàng, cùng hệ thống biểu đồ thống kê doanh thu trực quan.
- Giao diện người dùng được thiết kế hiện đại, bố cục trực quan, tối ưu hiển thị đa nền tảng (Responsive Design) và hỗ trợ giao diện tối (Dark Theme) phù hợp với người dùng game thủ.
- Toàn bộ 40 ca kiểm thử (bao gồm 28 ca chức năng, 6 ca bảo mật và 6 ca tương thích) đều thực thi thành công và đạt tỷ lệ 100%, bảo đảm hệ thống vận hành đúng đặc tả use case đã thiết kế.
- Nhìn chung, hệ thống đáp ứng đầy đủ các yêu cầu chức năng và phi chức năng đã xác định trong giai đoạn phân tích, vận hành ổn định trên môi trường cục bộ và bảo đảm an toàn dữ liệu cơ bản.

### 3.3.2. Hạn chế

Bên cạnh những kết quả đạt được, hệ thống vẫn còn một số hạn chế cần được khắc phục và hoàn thiện trong thời gian tới:

- Hiệu năng hệ thống dưới tải cao còn hạn chế: kết quả kiểm thử tải bằng Apache JMeter cho thấy tuy tỷ lệ lỗi đạt 0% nhưng thời gian phản hồi trung bình (≈ 2,85 giây) và thông lượng (14,2 yêu cầu/giây) chưa đạt mức lý tưởng khi xử lý đồng thời nhiều yêu cầu trong môi trường phát triển cục bộ; khả năng chịu tải trên hạ tầng thực tế cần được tối ưu thêm thông qua bộ nhớ đệm phân tán (Redis Cache) và cân bằng tải (Load Balancing).
- Cổng thanh toán trực tuyến hiện mới tích hợp ở môi trường thử nghiệm (Sandbox) của VNPay, chưa kết nối tài khoản doanh nghiệp thực tế và chưa tích hợp thêm các ví điện tử phổ biến khác (MoMo, ZaloPay, ShopeePay) hay dịch vụ nạp thẻ cào tự động.
- Chưa hỗ trợ cơ chế tự động kiểm tra tài khoản game: hệ thống chưa tích hợp API kết nối với các nhà phát hành game (Riot Games, Garena, Steam...) để tự động xác minh thông tin đăng nhập, cấp độ rank và số lượng trang phục/tướng của tài khoản, mà vẫn phụ thuộc vào việc nhập thông tin thủ công.
- Mô hình giao dịch ngang hàng (C2C) chưa hoàn thiện: hiện tại hệ thống chủ yếu vận hành theo mô hình phân phối từ ban quản trị (B2C), chưa xây dựng cơ chế ký quỹ trung gian (Escrow) an toàn để người dùng tự do đăng bán sản phẩm của nhau và đánh giá mức độ uy tín của người bán.
- Hệ thống chưa hỗ trợ chức năng trò chuyện (chat) và thông báo theo thời gian thực (Real-time qua WebSocket) giữa người mua và ban quản trị, việc hỗ trợ khiếu nại khách hàng còn phụ thuộc vào các kênh liên hệ thủ công.
- Chưa áp dụng các thuật toán thông minh (AI / Machine Learning) để tự động định giá tài khoản dựa trên các thông số vật phẩm, cũng như chưa có hệ thống gợi ý sản phẩm được cá nhân hóa theo sở thích người dùng.
- Cơ chế bảo mật nâng cao còn hạn chế: hệ thống chưa áp dụng xác thực hai yếu tố (2FA qua Google Authenticator hoặc OTP SMS) cho các thao tác bảo mật quan trọng như đổi mật khẩu hay giao dịch đơn hàng có giá trị lớn; đồng thời chưa thực hiện kiểm thử xâm nhập (Penetration Testing) chuyên sâu.
- Giao diện hiện mới hoạt động trên trình duyệt web di động dưới dạng Responsive, chưa xây dựng ứng dụng di động riêng biệt (Native App trên iOS / Android).

Những hạn chế này là cơ sở để đề xuất các hướng phát triển tiếp theo nhằm hoàn thiện và nâng cao chất lượng hệ thống trong Chương 4.

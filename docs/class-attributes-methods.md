# Thuộc tính và phương thức của các lớp

## 1. Lớp User

| Thành phần | Nội dung |
|---|---|
| Thuộc tính | `id: bigint`, `name: string`, `email: string`, `phone: string`, `password: string`, `role: enum(admin, seller, buyer)`, `status: enum(active, banned)`, `remember_token: string`, `created_at: datetime`, `updated_at: datetime`, `deleted_at: datetime` |
| Phương thức | `gameAccounts()`, `gameCards()`, `gameGiftcodes()`, `orders()`, `carts()`, `isAdmin(): bool`, `isSeller(): bool` |
| Mô tả | Lớp biểu diễn người dùng trong hệ thống. Vai trò quản trị viên, người bán và người mua được phân biệt thông qua thuộc tính `role`, không tách thành các lớp riêng. |

## 2. Lớp GameAccount

| Thành phần | Nội dung |
|---|---|
| Thuộc tính | `id: bigint`, `seller_id: bigint`, `title: string`, `description: text`, `price: decimal`, `images: json`, `account_username: string`, `account_password: text`, `status: enum(available, sold, hidden)`, `created_at: datetime`, `updated_at: datetime`, `deleted_at: datetime` |
| Phương thức | `seller()`, `orderItems()`, `carts()` |
| Mô tả | Lớp biểu diễn tài khoản game được đăng bán. Các thông tin đăng nhập như `account_username` và `account_password` được ẩn khi trả về dữ liệu công khai. |

## 3. Lớp GameCard

| Thành phần | Nội dung |
|---|---|
| Thuộc tính | `id: bigint`, `seller_id: bigint`, `title: string`, `description: text`, `price: decimal`, `card_serial: string`, `card_code: string`, `status: enum(available, sold, hidden)`, `created_at: datetime`, `updated_at: datetime`, `deleted_at: datetime` |
| Phương thức | `seller()`, `orderItems()`, `carts()` |
| Mô tả | Lớp biểu diễn thẻ game được bán trên hệ thống. Mã thẻ và số serial là dữ liệu nhạy cảm nên được ẩn ở API công khai. |

## 4. Lớp GameGiftcode

| Thành phần | Nội dung |
|---|---|
| Thuộc tính | `id: bigint`, `seller_id: bigint`, `title: string`, `description: text`, `price: decimal`, `giftcode_string: string`, `status: enum(available, sold, hidden)`, `created_at: datetime`, `updated_at: datetime`, `deleted_at: datetime` |
| Phương thức | `seller()`, `orderItems()`, `carts()` |
| Mô tả | Lớp biểu diễn mã giftcode. Chuỗi giftcode là dữ liệu bàn giao sau khi thanh toán thành công nên không hiển thị công khai. |

## 5. Lớp Cart

| Thành phần | Nội dung |
|---|---|
| Thuộc tính | `id: bigint`, `user_id: bigint`, `cartable_type: string`, `cartable_id: bigint`, `created_at: datetime`, `updated_at: datetime` |
| Phương thức | `user()`, `cartable()` |
| Mô tả | Lớp biểu diễn sản phẩm trong giỏ hàng của người dùng. Quan hệ `cartable()` là quan hệ đa hình, có thể tham chiếu tới `GameAccount`, `GameCard` hoặc `GameGiftcode`. Giỏ hàng không có thuộc tính số lượng vì mỗi sản phẩm số chỉ được mua một lần. |

## 6. Lớp Order

| Thành phần | Nội dung |
|---|---|
| Thuộc tính | `id: bigint`, `buyer_id: bigint`, `total_amount: decimal`, `payment_method: string`, `payment_transaction_id: string`, `status: enum(pending, completed, failed)`, `created_at: datetime`, `updated_at: datetime` |
| Phương thức | `buyer()`, `items()` |
| Mô tả | Lớp biểu diễn đơn hàng của người mua. Mỗi đơn hàng thuộc về một người mua và có thể chứa nhiều dòng chi tiết đơn hàng. |

## 7. Lớp OrderItem

| Thành phần | Nội dung |
|---|---|
| Thuộc tính | `id: bigint`, `order_id: bigint`, `price: decimal`, `purchasable_type: string`, `purchasable_id: bigint`, `delivered_data: json`, `created_at: datetime`, `updated_at: datetime` |
| Phương thức | `order()`, `purchasable()` |
| Mô tả | Lớp biểu diễn từng sản phẩm trong đơn hàng. Quan hệ `purchasable()` là quan hệ đa hình, có thể tham chiếu tới `GameAccount`, `GameCard` hoặc `GameGiftcode`. Thuộc tính `delivered_data` lưu bản sao dữ liệu bàn giao sau khi thanh toán thành công. |

## 8. Dịch vụ ngoài VNPay

| Thành phần | Nội dung |
|---|---|
| Thuộc tính | Không lưu thành bảng dữ liệu riêng trong hệ thống. |
| Phương thức | `generateVNPayUrl()`, `vnpayCallback()` |
| Mô tả | VNPay là dịch vụ thanh toán bên ngoài. Hệ thống tạo liên kết thanh toán, chuyển người dùng sang VNPay và nhận kết quả thanh toán thông qua callback. |

## 9. Tổng hợp quan hệ giữa các lớp

| Quan hệ | Bội số | Ý nghĩa |
|---|---:|---|
| `User` - `GameAccount` | `1 - 0..*` | Một người bán có thể đăng nhiều tài khoản game. |
| `User` - `GameCard` | `1 - 0..*` | Một người bán có thể đăng nhiều thẻ game. |
| `User` - `GameGiftcode` | `1 - 0..*` | Một người bán có thể đăng nhiều giftcode. |
| `User` - `Cart` | `1 - 0..*` | Một người dùng có thể có nhiều sản phẩm trong giỏ hàng. |
| `User` - `Order` | `1 - 0..*` | Một người mua có thể tạo nhiều đơn hàng. |
| `Order` - `OrderItem` | `1 - 1..*` | Một đơn hàng chứa một hoặc nhiều dòng sản phẩm. |
| `Cart` - `GameAccount/GameCard/GameGiftcode` | `0..* - 0..1` | Một dòng giỏ hàng tham chiếu tới đúng một sản phẩm số thông qua quan hệ đa hình. |
| `OrderItem` - `GameAccount/GameCard/GameGiftcode` | `0..* - 0..1` | Một dòng đơn hàng tham chiếu tới đúng một sản phẩm đã mua thông qua quan hệ đa hình. |

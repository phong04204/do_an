# Cấu trúc các bảng trong cơ sở dữ liệu

Hệ thống sử dụng cơ sở dữ liệu quan hệ để lưu trữ người dùng, sản phẩm số, giỏ hàng và đơn hàng. Phần dưới đây trình bày các bảng dữ liệu nghiệp vụ của hệ thống.

## 1. Danh sách bảng

| STT | Tên bảng | Chức năng chính |
|---:|---|---|
| 1 | `users` | Lưu tài khoản và quyền người dùng |
| 2 | `game_accounts` | Lưu tài khoản game đăng bán |
| 3 | `game_cards` | Lưu thẻ game đăng bán |
| 4 | `game_giftcodes` | Lưu giftcode đăng bán |
| 5 | `carts` | Lưu sản phẩm trong giỏ hàng |
| 6 | `orders` | Lưu thông tin đơn hàng |
| 7 | `order_items` | Lưu chi tiết sản phẩm trong đơn hàng |

## 2. Cấu trúc các bảng

### 2.1. Bảng `users`

Bảng `users` lưu trữ thông tin tài khoản và vai trò của người sử dụng trong hệ thống.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | Khóa chính, tự tăng | Mã người dùng |
| `name` | `VARCHAR` | Không rỗng | Họ tên người dùng |
| `email` | `VARCHAR` | Không rỗng, duy nhất | Địa chỉ email đăng nhập |
| `phone` | `VARCHAR` | Có thể rỗng | Số điện thoại |
| `password` | `VARCHAR` | Không rỗng | Mật khẩu đã mã hóa |
| `role` | `ENUM('admin', 'seller', 'buyer')` | Mặc định `buyer` | Vai trò sử dụng hệ thống |
| `status` | `ENUM('active', 'banned')` | Mặc định `active` | Trạng thái tài khoản |
| `remember_token` | `VARCHAR` | Có thể rỗng | Mã ghi nhớ đăng nhập |
| `created_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm tạo |
| `updated_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm cập nhật |
| `deleted_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm xóa mềm |

### 2.2. Bảng `game_accounts`

Bảng `game_accounts` lưu các tài khoản game được đăng bán.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | Khóa chính, tự tăng | Mã tài khoản game |
| `seller_id` | `BIGINT UNSIGNED` | Khóa ngoại tham chiếu `users.id`, xóa dây chuyền | Người đăng bán |
| `title` | `VARCHAR` | Không rỗng | Tiêu đề sản phẩm |
| `description` | `TEXT` | Có thể rỗng | Mô tả chi tiết |
| `price` | `DECIMAL(15,2)` | Không rỗng | Giá bán |
| `images` | `JSON` | Có thể rỗng | Danh sách hình ảnh |
| `account_username` | `VARCHAR` | Không rỗng | Tên đăng nhập tài khoản bàn giao |
| `account_password` | `TEXT` | Không rỗng | Mật khẩu tài khoản bàn giao |
| `status` | `ENUM('available', 'sold', 'hidden')` | Mặc định `available`, có chỉ mục | Trạng thái sản phẩm |
| `created_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm tạo |
| `updated_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm cập nhật |
| `deleted_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm xóa mềm |

### 2.3. Bảng `game_cards`

Bảng `game_cards` lưu thông tin thẻ game được đăng bán.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | Khóa chính, tự tăng | Mã thẻ game |
| `seller_id` | `BIGINT UNSIGNED` | Khóa ngoại tham chiếu `users.id`, xóa dây chuyền | Người đăng bán |
| `title` | `VARCHAR` | Không rỗng | Tiêu đề thẻ game |
| `description` | `TEXT` | Có thể rỗng | Mô tả chi tiết |
| `price` | `DECIMAL(15,2)` | Không rỗng | Giá bán |
| `card_serial` | `VARCHAR` | Không rỗng | Số serial thẻ |
| `card_code` | `VARCHAR` | Không rỗng | Mã nạp thẻ |
| `status` | `ENUM('available', 'sold', 'hidden')` | Mặc định `available`, có chỉ mục | Trạng thái sản phẩm |
| `created_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm tạo |
| `updated_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm cập nhật |
| `deleted_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm xóa mềm |

### 2.4. Bảng `game_giftcodes`

Bảng `game_giftcodes` lưu các mã quà tặng điện tử được đăng bán.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | Khóa chính, tự tăng | Mã giftcode |
| `seller_id` | `BIGINT UNSIGNED` | Khóa ngoại tham chiếu `users.id`, xóa dây chuyền | Người đăng bán |
| `title` | `VARCHAR` | Không rỗng | Tiêu đề sản phẩm |
| `description` | `TEXT` | Có thể rỗng | Mô tả chi tiết |
| `price` | `DECIMAL(15,2)` | Không rỗng | Giá bán |
| `giftcode_string` | `VARCHAR` | Không rỗng | Chuỗi giftcode bàn giao |
| `status` | `ENUM('available', 'sold', 'hidden')` | Mặc định `available`, có chỉ mục | Trạng thái sản phẩm |
| `created_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm tạo |
| `updated_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm cập nhật |
| `deleted_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm xóa mềm |

### 2.5. Bảng `carts`

Bảng `carts` lưu các sản phẩm được người dùng đưa vào giỏ hàng. Do sản phẩm là tài sản số duy nhất, bảng không lưu số lượng.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | Khóa chính, tự tăng | Mã dòng giỏ hàng |
| `user_id` | `BIGINT UNSIGNED` | Khóa ngoại tham chiếu `users.id`, xóa dây chuyền | Người sở hữu giỏ hàng |
| `cartable_type` | `VARCHAR` | Không rỗng, thuộc chỉ mục ghép | Loại sản phẩm trong giỏ hàng |
| `cartable_id` | `BIGINT UNSIGNED` | Không rỗng, thuộc chỉ mục ghép | Mã sản phẩm trong giỏ hàng |
| `created_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm thêm vào giỏ |
| `updated_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm cập nhật |

`cartable_type` và `cartable_id` tạo quan hệ đa hình tới một trong ba bảng `game_accounts`, `game_cards` hoặc `game_giftcodes`.

### 2.6. Bảng `orders`

Bảng `orders` lưu thông tin chung của một đơn hàng thanh toán.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | Khóa chính, tự tăng | Mã đơn hàng |
| `buyer_id` | `BIGINT UNSIGNED` | Khóa ngoại tham chiếu `users.id`, xóa dây chuyền | Người mua |
| `total_amount` | `DECIMAL(15,2)` | Không rỗng | Tổng tiền đơn hàng |
| `payment_method` | `VARCHAR` | Không rỗng | Phương thức thanh toán |
| `payment_transaction_id` | `VARCHAR` | Có thể rỗng, duy nhất | Mã giao dịch thanh toán |
| `status` | `ENUM('pending', 'completed', 'failed')` | Mặc định `pending`, có chỉ mục | Trạng thái đơn hàng |
| `created_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm tạo |
| `updated_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm cập nhật |

### 2.7. Bảng `order_items`

Bảng `order_items` lưu từng sản phẩm thuộc một đơn hàng và dữ liệu được bàn giao sau thanh toán.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | Khóa chính, tự tăng | Mã chi tiết đơn hàng |
| `order_id` | `BIGINT UNSIGNED` | Khóa ngoại tham chiếu `orders.id`, xóa dây chuyền | Đơn hàng chứa sản phẩm |
| `price` | `DECIMAL(15,2)` | Không rỗng | Giá sản phẩm tại thời điểm mua |
| `purchasable_type` | `VARCHAR` | Không rỗng, thuộc chỉ mục ghép | Loại sản phẩm đã mua |
| `purchasable_id` | `BIGINT UNSIGNED` | Không rỗng, thuộc chỉ mục ghép | Mã sản phẩm đã mua |
| `delivered_data` | `JSON` | Không rỗng | Dữ liệu sản phẩm bàn giao cho người mua |
| `created_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm tạo |
| `updated_at` | `TIMESTAMP` | Có thể rỗng | Thời điểm cập nhật |

`purchasable_type` và `purchasable_id` tạo quan hệ đa hình tới một trong ba bảng `game_accounts`, `game_cards` hoặc `game_giftcodes`.

## 3. Quan hệ giữa các bảng

| Bảng nguồn | Bảng đích | Kiểu quan hệ | Khóa liên kết |
|---|---|---|---|
| `users` | `game_accounts` | Một - nhiều | `game_accounts.seller_id` tham chiếu `users.id` |
| `users` | `game_cards` | Một - nhiều | `game_cards.seller_id` tham chiếu `users.id` |
| `users` | `game_giftcodes` | Một - nhiều | `game_giftcodes.seller_id` tham chiếu `users.id` |
| `users` | `carts` | Một - nhiều | `carts.user_id` tham chiếu `users.id` |
| `users` | `orders` | Một - nhiều | `orders.buyer_id` tham chiếu `users.id` |
| `orders` | `order_items` | Một - nhiều | `order_items.order_id` tham chiếu `orders.id` |
| `carts` | Bảng sản phẩm số | Đa hình | `cartable_type`, `cartable_id` |
| `order_items` | Bảng sản phẩm số | Đa hình | `purchasable_type`, `purchasable_id` |

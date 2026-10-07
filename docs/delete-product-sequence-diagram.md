# Biểu đồ tuần tự Xóa sản phẩm

Biểu đồ mô tả luồng Admin xóa sản phẩm trong trang quản trị. Quy trình bao gồm chọn sản phẩm cần xóa, xác nhận thao tác, gửi yêu cầu xóa, kiểm tra điều kiện xử lý và cập nhật dữ liệu trong cơ sở dữ liệu.

```mermaid
sequenceDiagram
    actor Admin as Admin
    participant UI as AdminDashboard
    participant Controller as AdminController
    participant Product as GameAccount/GameCard/GameGiftcode
    participant DB as Database

    Admin->>UI: 1. Chọn sản phẩm cần xóa
    UI-->>Admin: 2. Hiển thị hộp thoại xác nhận
    Admin->>UI: 3. Xác nhận xóa sản phẩm
    UI->>Controller: 4. Gửi yêu cầu xóa sản phẩm
    Controller->>Controller: 5. Kiểm tra sản phẩm tồn tại
    alt Sản phẩm không tồn tại
        Controller-->>UI: "Không tìm thấy sản phẩm"
        UI-->>Admin: Hiển thị thông báo lỗi
    else Sản phẩm tồn tại
        Controller->>Product: 6. Thực hiện xóa sản phẩm
        Product->>DB: DELETE sản phẩm
        DB-->>Product: Xóa thành công
        Product-->>Controller: Kết quả xóa sản phẩm
        Controller-->>UI: "Xóa sản phẩm thành công"
        UI-->>Admin: 7. Hiển thị thông báo
    end
```

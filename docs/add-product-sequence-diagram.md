# Biểu đồ tuần tự Thêm sản phẩm

Biểu đồ mô tả luồng Admin thêm sản phẩm mới trong trang quản trị. Vì trang quản lý chỉ dành cho Admin, biểu đồ tập trung vào xử lý nhập liệu và lưu sản phẩm. Sản phẩm có thể là tài khoản game, thẻ game hoặc giftcode.

```mermaid
sequenceDiagram
    actor Admin as Admin
    participant UI as AdminDashboard
    participant Controller as AdminController
    participant Product as GameAccount/GameCard/GameGiftcode
    participant DB as Database

    Admin->>UI: 1. Chọn chức năng thêm sản phẩm
    UI-->>Admin: 2. Hiển thị form thêm sản phẩm
    Admin->>UI: 3. Nhập thông tin sản phẩm
    Admin->>UI: 4. Nhấn "Lưu"
    UI->>Controller: 5. POST /api/admin/{product-type}
    Controller->>Controller: 6. Validate dữ liệu bắt buộc
    alt Dữ liệu không hợp lệ
        Controller-->>UI: "Thông tin sản phẩm không hợp lệ"
        UI-->>Admin: Hiển thị lỗi, nhập lại
    else Dữ liệu hợp lệ
        Controller->>Product: 7. Tạo sản phẩm
        Product->>DB: INSERT sản phẩm
        DB-->>Product: Lưu thành công
        Product-->>Controller: Sản phẩm mới
        Controller-->>UI: "Thêm sản phẩm thành công"
        UI-->>Admin: 8. Cập nhật danh sách và thông báo thành công
    end
```

# Biểu đồ tuần tự Sửa sản phẩm

Biểu đồ mô tả luồng Admin sửa thông tin sản phẩm trong trang quản trị. Quy trình bao gồm chọn sản phẩm cần chỉnh sửa, hiển thị dữ liệu hiện có, cập nhật thông tin, kiểm tra tính hợp lệ và lưu thay đổi vào cơ sở dữ liệu.

```mermaid
sequenceDiagram
    actor Admin as Admin
    participant UI as AdminDashboard
    participant Controller as AdminController
    participant Product as GameAccount/GameCard/GameGiftcode
    participant DB as Database

    Admin->>UI: 1. Chọn sản phẩm cần sửa
    UI-->>Admin: 2. Hiển thị form thông tin hiện có
    Admin->>UI: 3. Cập nhật thông tin sản phẩm
    Admin->>UI: 4. Nhấn "Lưu thay đổi"
    UI->>Controller: 5. Gửi yêu cầu cập nhật sản phẩm
    Controller->>Controller: 6. Kiểm tra tính hợp lệ
    alt Dữ liệu không hợp lệ
        Controller-->>UI: "Thông tin sản phẩm không hợp lệ"
        UI-->>Admin: Hiển thị lỗi, nhập lại
    else Dữ liệu hợp lệ
        Controller->>Product: 7. Cập nhật sản phẩm
        Product->>DB: UPDATE thông tin sản phẩm
        DB-->>Product: Cập nhật thành công
        Product-->>Controller: Đối tượng sản phẩm đã cập nhật
        Controller-->>UI: "Sửa sản phẩm thành công"
        UI-->>Admin: 8. Hiển thị thông báo
    end
```

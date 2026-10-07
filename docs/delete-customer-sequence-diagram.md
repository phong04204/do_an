# Biểu đồ tuần tự Xóa khách hàng

Biểu đồ mô tả luồng Quản trị viên xóa thông tin khách hàng trong trang quản trị. Quy trình bao gồm hiển thị hộp thoại xác nhận, kiểm tra sự tồn tại của khách hàng và thực hiện xóa khỏi bảng `users`.

```mermaid
sequenceDiagram
    actor Admin as Admin
    participant UI as AdminDashboard
    participant Controller as AdminController
    participant User as UserModel
    participant DB as users

    Admin->>UI: 1. Chọn khách hàng cần xóa
    UI-->>Admin: 2. Hiển thị hộp thoại xác nhận
    Admin->>UI: 3. Xác nhận xóa khách hàng
    UI->>Controller: 4. DELETE /admin/users/{id}
    Controller->>Controller: 5. Kiểm tra khách hàng tồn tại
    alt Khách hàng không tồn tại
        Controller-->>UI: "Không tìm thấy khách hàng"
        UI-->>Admin: Hiển thị thông báo lỗi
    else Khách hàng tồn tại
        Controller->>User: 6. Thực hiện xóa khách hàng
        User->>DB: DELETE FROM users WHERE id
        DB-->>User: Xóa thành công
        User-->>Controller: Kết quả xóa khách hàng
        Controller-->>UI: "Xóa khách hàng thành công"
        UI-->>Admin: 7. Hiển thị thông báo
    end
```

# Biểu đồ tuần tự Sửa thông tin khách hàng

Biểu đồ mô tả luồng Quản trị viên chỉnh sửa thông tin khách hàng trong trang quản trị. Quy trình bao gồm tải dữ liệu hiện tại, hiển thị form chỉnh sửa, kiểm tra dữ liệu cập nhật và lưu thay đổi vào bảng `users`.

```mermaid
sequenceDiagram
    actor Admin as Admin
    participant UI as AdminDashboard
    participant Controller as AdminController
    participant User as UserModel
    participant DB as users

    Admin->>UI: 1. Chọn khách hàng cần sửa
    UI->>Controller: 2. Yêu cầu thông tin khách hàng
    Controller->>User: 3. Lấy thông tin khách hàng
    User->>DB: SELECT FROM users WHERE id
    DB-->>User: Dữ liệu khách hàng
    User-->>Controller: Đối tượng khách hàng
    Controller-->>UI: Trả về thông tin hiện tại
    UI-->>Admin: Hiển thị form chỉnh sửa
    Admin->>UI: 4. Cập nhật thông tin khách hàng
    Admin->>UI: 5. Nhấn "Lưu"
    UI->>Controller: 6. PUT /admin/users/{id}
    Controller->>Controller: 7. Kiểm tra dữ liệu hợp lệ
    alt Dữ liệu không hợp lệ
        Controller-->>UI: Thông tin khách hàng không hợp lệ
        UI-->>Admin: Hiển thị lỗi, yêu cầu nhập lại
    else Dữ liệu hợp lệ
        Controller->>User: 8. Cập nhật khách hàng
        User->>DB: UPDATE users
        DB-->>User: Cập nhật thành công
        User-->>Controller: Đối tượng khách hàng đã cập nhật
        Controller-->>UI: Cập nhật thông tin khách hàng thành công
        UI-->>Admin: 9. Hiển thị thông báo
    end
```

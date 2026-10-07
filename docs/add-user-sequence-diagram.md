# Biểu đồ tuần tự Thêm khách hàng

Biểu đồ mô tả luồng Quản trị viên thêm khách hàng mới trong trang quản trị. Quy trình bao gồm nhập thông tin khách hàng, kiểm tra tính hợp lệ, tạo bản ghi khách hàng và hiển thị thông báo kết quả.

```mermaid
sequenceDiagram
    actor Admin as Admin
    participant UI as AdminDashboard
    participant Controller as AdminController
    participant User as UserModel
    participant DB as users

    Admin->>UI: 1. Chọn chức năng thêm khách hàng
    UI-->>Admin: 2. Hiển thị form thêm khách hàng
    Admin->>UI: 3. Nhập thông tin khách hàng
    Admin->>UI: 4. Nhấn "Lưu"
    UI->>Controller: 5. Gửi yêu cầu tạo khách hàng
    Controller->>Controller: 6. Kiểm tra dữ liệu hợp lệ
    alt Dữ liệu không hợp lệ
        Controller-->>UI: Thông tin khách hàng không hợp lệ
        UI-->>Admin: Hiển thị lỗi, yêu cầu nhập lại
    else Dữ liệu hợp lệ
        Controller->>User: 7. Tạo khách hàng mới
        User->>DB: INSERT INTO users
        DB-->>User: Lưu thành công
        User-->>Controller: Đối tượng khách hàng đã tạo
        Controller-->>UI: Thêm khách hàng thành công
        UI-->>Admin: 8. Hiển thị thông báo
    end
```

# Biểu đồ tuần tự Thêm tài khoản game

Biểu đồ mô tả luồng Admin thêm tài khoản game mới trong trang quản trị. Quy trình bao gồm nhập thông tin tài khoản, gửi yêu cầu tạo mới, kiểm tra dữ liệu bắt buộc và lưu bản ghi tài khoản game vào cơ sở dữ liệu.

```mermaid
sequenceDiagram
    actor Admin as Admin
    participant UI as AdminDashboard
    participant Controller as AdminController
    participant Account as GameAccountModel
    participant DB as Database

    Admin->>UI: 1. Chọn chức năng thêm tài khoản game
    UI-->>Admin: 2. Hiển thị form thêm tài khoản
    Admin->>UI: 3. Nhập thông tin tài khoản game
    Admin->>UI: 4. Nhấn "Lưu"
    UI->>Controller: 5. Gửi yêu cầu tạo tài khoản game
    Controller->>Controller: 6. Kiểm tra dữ liệu hợp lệ
    alt Dữ liệu không hợp lệ
        Controller-->>UI: "Thông tin tài khoản không hợp lệ"
        UI-->>Admin: Hiển thị lỗi, nhập lại
    else Dữ liệu hợp lệ
        Controller->>Account: 7. Tạo tài khoản game
        Account->>DB: Lưu dữ liệu tài khoản
        DB-->>Account: Lưu thành công
        Account-->>Controller: Đối tượng tài khoản đã tạo
        Controller-->>UI: "Thêm tài khoản game thành công"
        UI-->>Admin: 8. Hiển thị thông báo
    end
```

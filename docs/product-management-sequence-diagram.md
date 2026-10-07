# Biểu đồ tuần tự Quản lý sản phẩm

Biểu đồ mô tả luồng quản trị sản phẩm trong hệ thống. Admin thao tác trên `AdminDashboard`, frontend gọi API quản trị, backend kiểm tra quyền admin rồi thêm/sửa/xóa sản phẩm ở một trong ba nhóm: tài khoản game, thẻ game hoặc giftcode.

```mermaid
sequenceDiagram
    actor Admin as Admin
    participant UI as AdminDashboard
    participant API as apiClient
    participant Controller as AdminController
    participant Auth as requireAdmin()
    participant Product as GameAccount/GameCard/GameGiftcode
    participant DB as Database

    Admin->>UI: Chọn tab Sản phẩm
    UI->>API: GET /api/admin/game-accounts/cards/giftcodes
    API->>Controller: Gửi request lấy danh sách
    Controller->>Auth: Kiểm tra role admin

    alt Không có quyền admin
        Auth-->>Controller: abort(403)
        Controller-->>API: 403 Forbidden
        API-->>UI: Trả lỗi
        UI-->>Admin: Hiển thị lỗi không có quyền
    else Có quyền admin
        Auth-->>Controller: Hợp lệ
        Controller->>Product: Truy vấn danh sách sản phẩm
        Product->>DB: SELECT sản phẩm theo loại
        DB-->>Product: Trả dữ liệu
        Product-->>Controller: Danh sách sản phẩm
        Controller-->>API: 200 OK
        API-->>UI: Trả danh sách
        UI-->>Admin: Hiển thị bảng sản phẩm
    end

    Admin->>UI: Thêm / sửa / xóa sản phẩm

    alt Thêm sản phẩm
        UI->>API: POST /api/admin/{product-type}
        API->>Controller: Gửi dữ liệu sản phẩm
        Controller->>Auth: Kiểm tra role admin
        Controller->>Controller: Validate dữ liệu bắt buộc
        Controller->>Product: create(data)
        Product->>DB: INSERT sản phẩm
        DB-->>Product: Sản phẩm mới
        Product-->>Controller: Trả sản phẩm
        Controller-->>API: 201 Created
        API-->>UI: Trả sản phẩm mới
        UI-->>Admin: Cập nhật bảng và thông báo thành công
    else Sửa sản phẩm
        UI->>API: PUT /api/admin/{product-type}/{id}
        API->>Controller: Gửi dữ liệu cập nhật
        Controller->>Auth: Kiểm tra role admin
        Controller->>Product: findOrFail(id)
        Product->>DB: SELECT sản phẩm theo id
        DB-->>Product: Trả sản phẩm
        Controller->>Product: update(data)
        Product->>DB: UPDATE sản phẩm
        DB-->>Product: Xác nhận cập nhật
        Product-->>Controller: Sản phẩm đã cập nhật
        Controller-->>API: 200 OK
        API-->>UI: Trả sản phẩm đã cập nhật
        UI-->>Admin: Cập nhật bảng và thông báo thành công
    else Xóa sản phẩm
        UI->>API: DELETE /api/admin/{product-type}/{id}
        API->>Controller: Gửi yêu cầu xóa
        Controller->>Auth: Kiểm tra role admin
        Controller->>Product: findOrFail(id)
        Product->>DB: SELECT sản phẩm theo id
        DB-->>Product: Trả sản phẩm
        Controller->>Product: delete()
        Product->>DB: DELETE / soft delete sản phẩm
        DB-->>Product: Xác nhận xóa
        Product-->>Controller: Hoàn tất
        Controller-->>API: 200 OK
        API-->>UI: Xóa thành công
        UI-->>Admin: Loại sản phẩm khỏi bảng
    end
```


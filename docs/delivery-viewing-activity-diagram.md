# AD-UC06 - Tự động bàn giao & Xem thông tin sản phẩm sau mua (Activity Diagram)

Biểu đồ hoạt động mô tả tiến trình thực hiện use case **Xem thông tin bàn giao sản phẩm số**, phân chia theo 2 phân làn (**Người mua** và **Hệ thống**), thể hiện rõ tính năng bảo mật quyền truy cập đơn hàng, ẩn/hiện mật khẩu và tiện ích sao chép thông tin bàn giao.

---

## 1. Sơ đồ hoạt động (Mermaid Diagram)

```mermaid
flowchart TD
    %% Khởi tạo
    Start([●]) --> ViewHistory["Truy cập trang Lịch sử mua hàng (/orders)"]
    ViewHistory --> CheckAuth{"Đã đăng nhập?"}

    %% ================= XÁC THỰC =================
    CheckAuth -- "Chưa" --> RedirectLogin["Chuyển hướng sang trang Đăng nhập"]
    RedirectLogin --> MergeEnd{" "}

    CheckAuth -- "Đã đăng nhập" --> FetchOrders["Gửi yêu cầu GET /api/orders kèm Bearer Token"]
    FetchOrders --> LoadOrdersList["Hệ thống tải danh sách đơn hàng của người dùng"]
    LoadOrdersList --> SelectOrder["Khách hàng chọn một đơn hàng hoàn tất để xem chi tiết"]

    %% ================= KIỂM TRA QUYỀN SỞ HỮU =================
    SelectOrder --> CheckOwnership["Kiểm tra quyền sở hữu: order.buyer_id == auth.id"]
    CheckOwnership --> IsOwner{"Chính chủ đơn?"}

    IsOwner -- "Không" --> ShowForbidden["Báo lỗi 403 Forbidden - Không có quyền truy cập"]
    ShowForbidden --> MergeEnd

    %% ================= HIỂN THỊ DỮ LIỆU BẢN GIAO =================
    IsOwner -- "Có" --> DecryptData["Trích xuất dữ liệu bàn giao (delivered_data)"]
    DecryptData --> RenderDetail["Hiển thị chi tiết đơn hàng & khung bàn giao"]
    RenderDetail --> MaskPassword["Mặc định che mật khẩu/mã thẻ dạng '••••••••'"]
    MaskPassword --> UserAction{"Thao tác người dùng?"}

    %% ================= THAO TÁC XEM / COPY =================
    UserAction -- "Ẩn/Hiện mật khẩu" --> ToggleEye["Nhấn biểu tượng 'Con mắt'"]
    ToggleEye --> ToggleDisplay["Hệ thống chuyển đổi hiển thị văn bản rõ / ẩn"]
    ToggleDisplay --> UserAction

    UserAction -- "Sao chép nhanh" --> ClickCopy["Nhấn nút 'Sao chép' (Copy)"]
    ClickCopy --> CopyToClipboard["Hệ thống ghi dữ liệu vào Clipboard của máy khách"]
    CopyToClipboard --> ShowTooltip["Hiển thị thông báo Toast 'Đã sao chép vào bộ nhớ tạm!'"]
    ShowTooltip --> MergeAction{" "}

    UserAction -- "Đăng nhập vào game" --> MergeAction
    MergeAction --> MergeEnd

    %% ================= KẾT THÚC =================
    MergeEnd --> EndNode(((◉)))

    %% Định dạng màu sắc chuẩn luận văn
    classDef yellowRhombus fill:#fff9db,stroke:#cc0000,stroke-width:1.2px,color:#990000;
    classDef mergeRhombus fill:#f8cecc,stroke:#b85450,stroke-width:1px;
    class CheckAuth,IsOwner,UserAction yellowRhombus;
    class MergeAction,MergeEnd mergeRhombus;
```

---

## 2. Bảng phân làn trách nhiệm (Swimlanes)

| Phân làn | Các hành động và quyết định |
| :--- | :--- |
| **Người mua hàng** | 1. Bắt đầu $\rightarrow$ Truy cập trang **Lịch sử mua hàng (`/orders`)**.<br>2. Chọn xem một đơn hàng đã mua.<br>3. Tại màn hình chi tiết:<br>&nbsp;&nbsp;&nbsp;&nbsp;• Bấm nút "Con mắt" để xem rõ mật khẩu/mã thẻ.<br>&nbsp;&nbsp;&nbsp;&nbsp;• Bấm nút *"Sao chép"* để copy thông tin đăng nhập mà không cần gõ lại thủ công.<br>4. Tiến hành đăng nhập vào game để trải nghiệm. |
| **Hệ thống** | 1. **Kiểm tra đăng nhập**: Nếu chưa có token thì chuyển hướng đăng nhập.<br>2. **Kiểm tra phân quyền sở hữu (Policy)**: Ngăn chặn người dùng xem trộm đơn hàng của tài khoản khác.<br>3. **Trích xuất thông tin bàn giao** (`delivered_data`) từ CSDL:<br>&nbsp;&nbsp;&nbsp;&nbsp;• Nếu là Tài khoản game: Trả về Username & Password.<br>&nbsp;&nbsp;&nbsp;&nbsp;• Nếu là Thẻ cào / Giftcode: Trả về Mã thẻ, Serial và hạn dùng.<br>4. Quản lý trạng thái che/mở mật khẩu và hỗ trợ tương tác với Clipboard của trình duyệt. |

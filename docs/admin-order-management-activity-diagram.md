# AD-UC08 - Quản lý và Xử lý đơn hàng phía Quản trị viên (Activity Diagram)

Biểu đồ hoạt động mô tả tiến trình thực hiện use case **Quản lý và Xử lý đơn hàng**, phân chia theo 2 phân làn (**Quản trị viên** và **Hệ thống**), đặc biệt nhấn mạnh quy trình xử lý đơn hàng, đối soát thanh toán và cơ chế tự động hoàn trả sản phẩm số khi hủy đơn hàng.

---

## 1. Sơ đồ hoạt động (Mermaid Diagram)

```mermaid
flowchart TD
    %% Khởi tạo
    Start([●]) --> OpenOrderTab["Admin truy cập tab 'Quản lý đơn hàng'"]
    OpenOrderTab --> FetchAllOrders["Hệ thống tải danh sách đơn hàng toàn sàn"]
    FetchAllOrders --> FilterOrders["Admin lọc theo trạng thái (Pending / Completed / Cancelled)"]
    FilterOrders --> SelectOrderRow["Chọn một đơn hàng cụ thể để xem chi tiết"]

    %% ================= XEM CHI TIẾT =================
    SelectOrderRow --> LoadDetailModal["Hệ thống mở modal chi tiết đơn hàng"]
    LoadDetailModal --> ReviewInfo["Kiểm tra thông tin người mua, số tiền, mã giao dịch VNPay"]
    ReviewInfo --> ActionDecision{"Hành động xử lý?"}

    %% ================= NHÁNH 1: ĐỐI SOÁT BÌNH THƯỜNG =================
    ActionDecision -- "Đơn hợp lệ (Completed)" --> CloseView["Đóng cửa sổ xem chi tiết"]
    CloseView --> MergeEnd{" "}

    %% ================= NHÁNH 2: XỬ LÝ KHIẾU NẠI / HỦY ĐƠN =================
    ActionDecision -- "Khiếu nại / Hủy đơn" --> ClickCancelOrder["Nhấn 'Hủy đơn & Hoàn hàng'"]
    ClickCancelOrder --> InputReason["Nhập lý do hủy đơn (giao dịch lỗi, khách khiếu nại...)"]
    InputReason --> ConfirmCancelModal["Hệ thống yêu cầu xác nhận thao tác hủy đơn"]
    ConfirmCancelModal --> IsConfirmed{"Xác nhận hủy?"}

    IsConfirmed -- "Không" --> CancelProcess["Đóng cảnh báo, giữ nguyên trạng thái đơn"]
    CancelProcess --> MergeEnd

    %% ================= THỰC HIỆN HỦY VÀ HOÀN SẢN PHẨM =================
    IsConfirmed -- "Đồng ý" --> ExecCancelOrder["Gửi yêu cầu PUT /api/admin/orders/{id}/cancel"]
    ExecCancelOrder --> UpdateOrderStatus["Cập nhật trạng thái đơn hàng sang 'cancelled'"]
    UpdateOrderStatus --> RollbackProducts["Tự động chuyển các sản phẩm trong đơn từ 'sold' về 'available'"]
    RollbackProducts --> SaveLog["Ghi nhận lịch sử hủy đơn & lý do vào hệ thống"]
    SaveLog --> ShowToastDone["Hiển thị thông báo 'Đã hủy đơn hàng và hoàn trả sản phẩm lên sàn!'"]
    ShowToastDone --> RefreshOrderList["Làm mới danh sách đơn hàng & trạng thái tồn kho"]
    RefreshOrderList --> MergeEnd

    %% ================= KẾT THÚC =================
    MergeEnd --> EndNode(((◉)))

    %% Định dạng màu sắc chuẩn luận văn
    classDef yellowRhombus fill:#fff9db,stroke:#cc0000,stroke-width:1.2px,color:#990000;
    classDef mergeRhombus fill:#f8cecc,stroke:#b85450,stroke-width:1px;
    class ActionDecision,IsConfirmed yellowRhombus;
    class MergeEnd mergeRhombus;
```

---

## 2. Bảng phân làn trách nhiệm (Swimlanes)

| Phân làn | Các hành động và quyết định |
| :--- | :--- |
| **Quản trị viên (Admin)** | 1. Mở trang **Quản lý đơn hàng** tại Dashboard Admin.<br>2. Lọc danh sách theo trạng thái hoặc tìm kiếm mã giao dịch.<br>3. Mở xem chi tiết đơn hàng để đối soát thông tin.<br>4. Nếu phát sinh khiếu nại từ khách hàng:<br>&nbsp;&nbsp;&nbsp;&nbsp;• Bấm chọn *"Hủy đơn & Hoàn hàng"*.<br>&nbsp;&nbsp;&nbsp;&nbsp;• Nhập lý do hủy đơn và xác nhận thao tác.<br>5. Nhận kết quả cập nhật trên hệ thống. |
| **Hệ thống** | 1. **Tải và phân trang** toàn bộ danh sách đơn hàng từ CSDL `orders`.<br>2. **Hiển thị chi tiết đơn hàng**: Bao gồm người mua, sản phẩm mua, giá trị thanh toán, mã giao dịch VNPay.<br>3. **Xử lý hủy đơn và hoàn trả sản phẩm (Rollback Product)**:<br>&nbsp;&nbsp;&nbsp;&nbsp;• Cập nhật bản ghi `orders.status = 'cancelled'`.<br>&nbsp;&nbsp;&nbsp;&nbsp;• Tự động quét các sản phẩm trong đơn và chuyển trạng thái từ `sold` trở lại `available` để sàn tiếp tục bày bán.<br>&nbsp;&nbsp;&nbsp;&nbsp;• Cập nhật lại doanh thu và hiển thị thông báo thành công cho Admin. |

# AD-UC05 - Đặt hàng và Thanh toán trực tuyến qua VNPay (Activity Diagram)

Biểu đồ hoạt động mô tả tiến trình thực hiện use case **Đặt hàng và Thanh toán trực tuyến**, phân chia theo 3 phân làn (**Người mua**, **Hệ thống cửa hàng**, và **Cổng thanh toán VNPay**), bao gồm các kiểm tra chống trùng mua hàng và xử lý Webhook/IPN tự động.

---

## 1. Sơ đồ hoạt động (Mermaid Diagram)

```mermaid
flowchart TD
    %% Khởi tạo
    Start([●]) --> ViewCheckout["Mở trang Thanh toán (/checkout)"]
    ViewCheckout --> SelectMethod["Chọn phương thức thanh toán (VNPay)"]
    SelectMethod --> ClickPay["Nhấn nút 'Thanh toán ngay'"]

    %% ================= KIỂM TRA SẢN PHẨM =================
    ClickPay --> CheckStock["Hệ thống kiểm tra trạng thái các sản phẩm trong giỏ"]
    CheckStock --> IsAvailable{"Sản phẩm còn khả dụng?"}

    IsAvailable -- "Không (Đã bán)" --> ShowSoldErr["Thông báo 'Sản phẩm đã có người mua'"]
    ShowSoldErr --> RemoveSoldItem["Loại bỏ sản phẩm khỏi giỏ hàng"]
    RemoveSoldItem --> ReturnCart["Quay lại giỏ hàng"]
    ReturnCart --> MergeEnd{" "}

    %% ================= KHỞI TẠO ĐƠN HÀNG =================
    IsAvailable -- "Có (Available)" --> CreateOrderPending["Tạo bản ghi Order trạng thái 'pending'"]
    CreateOrderPending --> LockProduct["Tạm khóa sản phẩm để giữ chỗ"]
    LockProduct --> GenVnpUrl["Tạo URL thanh toán VNPay kèm chữ ký HMAC-SHA512"]
    GenVnpUrl --> RedirectVnp["Chuyển hướng trình duyệt sang Cổng VNPay"]

    %% ================= TẠI CỔNG VNPAY =================
    RedirectVnp --> ScanQR["Khách hàng quét mã VNPAY-QR hoặc nhập thẻ ATM"]
    ScanQR --> VnpProcess["Cổng VNPay xử lý giao dịch thanh toán"]
    VnpProcess --> VnpResult{"Kết quả giao dịch?"}

    %% ================= KẾT QUẢ GIAO DỊCH =================
    VnpResult -- "Hủy hoặc Thất bại" --> CancelFlow["VNPay trả về mã lỗi hoặc người dùng hủy"]
    CancelFlow --> ReleaseProduct["Mở khóa lại sản phẩm (available)"]
    ReleaseProduct --> MarkOrderCancel["Cập nhật đơn hàng thành 'cancelled'"]
    MarkOrderCancel --> ShowFailPage["Hiển thị thông báo thanh toán không thành công"]
    ShowFailPage --> MergeEnd

    VnpResult -- "Thành công" --> VnpCallback["VNPay gửi dữ liệu Callback & IPN về hệ thống"]
    VnpCallback --> VerifyChecksum["Hệ thống kiểm tra chữ ký số bí mật (vnp_SecureHash)"]
    VerifyChecksum --> HashValid{"Chữ ký hợp lệ?"}

    HashValid -- "Không" --> LogSecurity["Ghi log cảnh báo can thiệp chữ ký bảo mật"]
    LogSecurity --> MergeEnd

    HashValid -- "Có" --> CompleteOrder["Cập nhật trạng thái đơn hàng thành 'completed'"]
    CompleteOrder --> MarkProductSold["Cập nhật sản phẩm sang 'sold' (Ẩn khỏi sàn)"]
    MarkProductSold --> DeliverData["Tự động trích xuất mã thẻ/tài khoản lưu vào đơn hàng"]
    DeliverData --> ShowSuccessPage["Chuyển hướng người dùng sang trang 'Thanh toán thành công'"]
    ShowSuccessPage --> MergeEnd

    %% ================= KẾT THÚC =================
    MergeEnd --> EndNode(((◉)))

    %% Định dạng màu sắc chuẩn luận văn
    classDef yellowRhombus fill:#fff9db,stroke:#cc0000,stroke-width:1.2px,color:#990000;
    classDef mergeRhombus fill:#f8cecc,stroke:#b85450,stroke-width:1px;
    class IsAvailable,VnpResult,HashValid yellowRhombus;
    class MergeEnd mergeRhombus;
```

---

## 2. Bảng phân làn trách nhiệm (Swimlanes)

| Phân làn | Các hành động và quyết định |
| :--- | :--- |
| **Người mua hàng** | 1. Bắt đầu $\rightarrow$ Truy cập trang **Thanh toán (`/checkout`)**.<br>2. Chọn phương thức thanh toán **VNPay** $\rightarrow$ Bấm *"Thanh toán ngay"*.<br>3. Tại cổng VNPay: Thực hiện quét mã QR hoặc nhập thông tin thẻ ATM ngân hàng.<br>4. Nhận thông báo kết quả: Trang thông báo thành công hoặc trang thông báo thất bại. |
| **Hệ thống website** | 1. **Kiểm tra tình trạng khả dụng** của sản phẩm trong CSDL:<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Nếu đã có người mua trước:* Báo lỗi, xóa sản phẩm đã bán và đưa khách về giỏ hàng.<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Nếu còn hàng:* Tạo đơn hàng `pending`, tạm khóa sản phẩm.<br>2. **Tạo URL cổng VNPay** kèm mã kiểm tra chữ ký SHA-512 $\rightarrow$ Chuyển hướng người mua.<br>3. **Tiếp nhận Webhook / IPN từ VNPay**:<br>&nbsp;&nbsp;&nbsp;&nbsp;• Kiểm tra chữ ký số `vnp_SecureHash`.<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Nếu thanh toán thành công:* Đổi trạng thái đơn sang `completed`, đổi sản phẩm sang `sold`, tự động bàn giao thông tin bảo mật vào đơn hàng.<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Nếu thanh toán thất bại/hủy:* Đổi đơn sang `cancelled`, hoàn trả sản phẩm về `available`. |
| **Cổng VNPay** | 1. Hiển thị giao diện cổng thanh toán an toàn cho người dùng.<br>2. Giao tiếp với ngân hàng phát hành thẻ để thực hiện trừ tiền.<br>3. Trả về kết quả giao dịch và gửi dữ liệu IPN về Backend của website. |

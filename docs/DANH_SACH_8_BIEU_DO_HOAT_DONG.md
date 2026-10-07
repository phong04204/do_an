# TỔNG HỢP 8 BIỂU ĐỒ HOẠT ĐỘNG (ACTIVITY DIAGRAMS)
## DỰ ÁN: WEBSITE KINH DOANH TÀI KHOẢN, THẺ NẠP VÀ GIFTCODE GAME TRỰC TUYẾN

> **Tài liệu phục vụ Báo cáo Đồ án tốt nghiệp Công nghệ Thông tin**  
> **Sinh viên thực hiện:** Lý Văn Phòng  
> **Vị trí trong báo cáo:** Chương 2 - Phân tích & Thiết kế hệ thống (Mục 2.4.2 Biểu đồ hoạt động)

---

## MỤC LỤC DANH MỤC 8 BIỂU ĐỒ HOẠT ĐỘNG

| Mã biểu đồ | Tên biểu đồ hoạt động | Tác nhân chính | File tài liệu chi tiết |
| :---: | :--- | :--- | :--- |
| **AD-01** | Biểu đồ hoạt động Đăng ký tài khoản | Khách vãng lai | [register-activity-diagram.md](file:///d:/test/docs/register-activity-diagram.md) |
| **AD-02** | Biểu đồ hoạt động Đăng nhập hệ thống | Người dùng / Admin | [login-activity-diagram.md](file:///d:/test/docs/login-activity-diagram.md) |
| **AD-03** | Biểu đồ hoạt động Tìm kiếm và Lọc sản phẩm | Khách hàng | [product-search-activity-diagram.md](file:///d:/test/docs/product-search-activity-diagram.md) |
| **AD-04** | Biểu đồ hoạt động Thêm sản phẩm & Quản lý giỏ hàng | Người mua hàng | [add-to-cart-activity-diagram.md](file:///d:/test/docs/add-to-cart-activity-diagram.md) |
| **AD-05** | Biểu đồ hoạt động Đặt hàng và Thanh toán qua VNPay | Người mua & VNPay | [order-payment-activity-diagram.md](file:///d:/test/docs/order-payment-activity-diagram.md) |
| **AD-06** | Biểu đồ hoạt động Bàn giao & Xem thông tin sau mua | Người mua hàng | [delivery-viewing-activity-diagram.md](file:///d:/test/docs/delivery-viewing-activity-diagram.md) |
| **AD-07** | Biểu đồ hoạt động Quản lý sản phẩm số (Admin) | Quản trị viên | [admin-product-management-activity-diagram.md](file:///d:/test/docs/admin-product-management-activity-diagram.md) |
| **AD-08** | Biểu đồ hoạt động Quản lý & Xử lý đơn hàng (Admin) | Quản trị viên | [admin-order-management-activity-diagram.md](file:///d:/test/docs/admin-order-management-activity-diagram.md) |

---

## 1. BIỂU ĐỒ AD-01: ĐĂNG KÝ TÀI KHOẢN (REGISTER)

```mermaid
flowchart TD
    Start([●]) --> OpenPage["Mở trang đăng ký"]
    OpenPage --> InputInfo["Nhập thông tin (Họ tên, Email, Mật khẩu, SĐT)"]
    InputInfo --> ClickSubmit["Nhấn 'Đăng ký'"]
    ClickSubmit --> CheckValid["Kiểm tra định dạng dữ liệu (Validation)"]
    CheckValid --> IsValid{"Dữ liệu hợp lệ?"}

    IsValid -- "Không" --> ShowInputError["Thông báo lỗi nhập liệu"]
    ShowInputError --> InputInfo

    IsValid -- "Có" --> CheckEmailUnique["Kiểm tra Email đã tồn tại trong CSDL?"]
    CheckEmailUnique --> IsUnique{"Email trùng?"}

    IsUnique -- "Có trùng" --> ShowDuplicateError["Báo lỗi 'Email đã được đăng ký'"]
    ShowDuplicateError --> InputInfo

    IsUnique -- "Chưa có" --> HashPass["Mã hóa mật khẩu an toàn (Bcrypt)"]
    HashPass --> SaveUser["Lưu bản ghi vào bảng users"]
    SaveUser --> AutoLogin["Tự động tạo Token đăng nhập"]
    AutoLogin --> RedirectHome["Chuyển hướng về Trang chủ"]
    RedirectHome --> EndNode(((◉)))
```

### Bảng phân làn Swimlanes (AD-01)
- **Khách hàng:** Điền biểu mẫu đăng ký $\rightarrow$ Nhấn Đăng ký $\rightarrow$ Nhận phản hồi hoặc được chuyển hướng về trang chủ.
- **Hệ thống:** Kiểm tra tính hợp lệ dữ liệu $\rightarrow$ Kiểm tra Email duy nhất $\rightarrow$ Mã hóa mật khẩu $\rightarrow$ Lưu bản ghi vào CSDL $\rightarrow$ Cấp phát token và phiên làm việc.

---

## 2. BIỂU ĐỒ AD-02: ĐĂNG NHẬP HỆ THỐNG (LOGIN)

```mermaid
flowchart TD
    Start([●]) --> OpenLoginPage["Mở trang đăng nhập"]
    OpenLoginPage --> InputCreds["Nhập Email và Mật khẩu"]
    InputCreds --> ClickLogin["Nhấn 'Đăng nhập'"]
    ClickLogin --> CheckAuth["Kiểm tra thông tin tài khoản"]
    CheckAuth --> AuthOk{"Khớp thông tin?"}

    AuthOk -- "Không khớp" --> ShowAuthErr["Báo lỗi 'Tài khoản hoặc mật khẩu không đúng'"]
    ShowAuthErr --> InputCreds

    AuthOk -- "Khớp" --> CheckStatus{"Tài khoản Active?"}
    CheckStatus -- "Bị khóa" --> ShowLockedErr["Báo lỗi 'Tài khoản bị khóa'"]
    ShowLockedErr --> EndNode(((◉)))

    CheckStatus -- "Hoạt động" --> CreateToken["Tạo API Token (Sanctum)"]
    CreateToken --> CheckRole{"Vai trò (Role)?"}

    CheckRole -- "Admin" --> ToAdmin["Chuyển hướng sang Bảng quản trị (/admin)"]
    CheckRole -- "Buyer" --> ToUserHome["Chuyển hướng về Trang chủ mua sắm"]

    ToAdmin --> EndNode
    ToUserHome --> EndNode
```

### Bảng phân làn Swimlanes (AD-02)
- **Người dùng:** Nhập Email & Mật khẩu $\rightarrow$ Bấm Đăng nhập $\rightarrow$ Điều hướng về giao diện tương ứng.
- **Hệ thống:** Xác thực mật khẩu $\rightarrow$ Kiểm tra trạng thái kích hoạt tài khoản $\rightarrow$ Sinh Token $\rightarrow$ Phân quyền điều hướng (Admin vào `/admin`, Khách vào Trang chủ).

---

## 3. BIỂU ĐỒ AD-03: TÌM KIẾM VÀ LỌC SẢN PHẨM (SEARCH & FILTER)

```mermaid
flowchart TD
    Start([●]) --> OpenProducts["Mở trang Sản phẩm (/san-pham)"]
    OpenProducts --> FetchDefault["Tải danh mục và danh sách mặc định"]
    FetchDefault --> ActionChoice{"Phương thức tra cứu?"}

    ActionChoice -- "Tìm từ khóa" --> InputKeyword["Nhập từ khóa (tên tướng, skin, súng...)"]
    InputKeyword --> SubmitSearch["Nhấn Enter hoặc icon Tìm kiếm"]
    SubmitSearch --> MergeQuery{" "}

    ActionChoice -- "Lọc & Sắp xếp" --> SelectFilters["Chọn tiêu chí (Game, Loại hàng, Mức giá)"]
    SelectFilters --> SelectSort["Chọn thứ tự sắp xếp"]
    SelectSort --> MergeQuery

    MergeQuery --> SendApiReq["Gửi yêu cầu API kèm tham số query"]
    SendApiReq --> ExecuteQuery["Hệ thống thực thi truy vấn cơ sở dữ liệu"]
    ExecuteQuery --> HasResult{"Tìm thấy sản phẩm?"}

    HasResult -- "Không" --> ShowEmpty["Hiển thị 'Không tìm thấy sản phẩm phù hợp'"]
    ShowEmpty --> EndNode(((◉)))

    HasResult -- "Có" --> RenderProducts["Hiển thị danh sách sản phẩm"]
    RenderProducts --> EndNode
```

### Bảng phân làn Swimlanes (AD-03)
- **Khách hàng:** Nhập từ khóa tìm kiếm hoặc bấm chọn các ô lọc (Game, Giá, Thẻ/Acc) $\rightarrow$ Xem kết quả hiển thị.
- **Hệ thống:** Tiếp nhận tham số $\rightarrow$ Xây dựng câu truy vấn SQL động $\rightarrow$ Trả về kết quả phân trang và giao diện sản phẩm.

---

## 4. BIỂU ĐỒ AD-04: THÊM SẢN PHẨM & QUẢN LÝ GIỎ HÀNG (CART)

```mermaid
flowchart TD
    Start([●]) --> ProductsPage["Giao diện trang sản phẩm"]
    ProductsPage --> ProductDetail["Xem chi tiết & Nhấn 'Thêm vào giỏ hàng'"]
    ProductDetail --> CheckStock{"Kiểm tra còn hàng?"}

    CheckStock -- "Đã bán (sold)" --> ShowSoldAlert["Báo lỗi 'Sản phẩm đã có người mua'"]
    ShowSoldAlert --> EndNode(((◉)))

    CheckStock -- "Còn hàng (available)" --> CheckType{"Loại sản phẩm?"}

    CheckType -- "Tài khoản game" --> CheckInCart{"Giỏ đã có acc này?"}
    CheckInCart -- "Đã có" --> ShowCartExist["Báo lỗi 'Tài khoản đã có trong giỏ hàng'"]
    ShowCartExist --> EndNode
    CheckInCart -- "Chưa có" --> AddAccToCart["Thêm vào giỏ hàng với Số lượng = 1"]
    AddAccToCart --> UpdateCartUI["Cập nhật giỏ hàng & Hiển thị thông báo thành công"]

    CheckType -- "Thẻ cào / Giftcode" --> CheckCardInCart{"Đã có trong giỏ?"}
    CheckCardInCart -- "Đã có" --> IncreaseQty["Tăng số lượng lên 1"]
    CheckCardInCart -- "Chưa có" --> AddCardToCart["Thêm mới vào giỏ hàng"]
    IncreaseQty --> UpdateCartUI
    AddCardToCart --> UpdateCartUI

    UpdateCartUI --> EndNode
```

### Bảng phân làn Swimlanes (AD-04)
- **Khách hàng:** Nhấn "Thêm vào giỏ hàng" $\rightarrow$ Nhận phản hồi và xem giỏ hàng được cập nhật.
- **Hệ thống:** Kiểm tra tính độc nhất của Tài khoản game (không cho trùng lặp, số lượng = 1) $\rightarrow$ Hỗ trợ cộng dồn số lượng cho Thẻ cào/Giftcode $\rightarrow$ Đồng bộ trạng thái giỏ hàng.

---

## 5. BIỂU ĐỒ AD-05: ĐẶT HÀNG VÀ THANH TOÁN QUA VNPAY (CHECKOUT)

```mermaid
flowchart TD
    Start([●]) --> ViewCheckout["Mở trang Thanh toán (/checkout)"]
    ViewCheckout --> SelectVnp["Chọn phương thức thanh toán VNPay"]
    SelectVnp --> ClickPay["Nhấn nút 'Thanh toán ngay'"]

    ClickPay --> CheckStock["Kiểm tra trạng thái sản phẩm trong CSDL"]
    CheckStock --> IsAvailable{"Còn khả dụng?"}

    IsAvailable -- "Đã có người mua" --> ShowErrSold["Báo lỗi sản phẩm đã bán & loại khỏi giỏ"]
    ShowErrSold --> EndNode(((◉)))

    IsAvailable -- "Còn hàng" --> CreatePendingOrder["Tạo đơn hàng 'pending' & Khóa tạm sản phẩm"]
    CreatePendingOrder --> GenVnpUrl["Tạo URL VNPay kèm mã băm HMAC-SHA512"]
    GenVnpUrl --> RedirectVnp["Chuyển hướng sang Cổng VNPay"]

    RedirectVnp --> ScanQR["Khách hàng quét mã QR hoặc nhập thẻ ATM"]
    ScanQR --> VnpProcess["Cổng VNPay xử lý giao dịch"]
    VnpProcess --> VnpResult{"Kết quả VNPay?"}

    VnpResult -- "Thất bại / Hủy" --> UnlockProduct["Mở khóa lại sản phẩm (available)"]
    UnlockProduct --> MarkCancel["Cập nhật đơn hàng sang 'cancelled'"]
    MarkCancel --> ShowFail["Hiển thị thông báo thanh toán không thành công"]
    ShowFail --> EndNode

    VnpResult -- "Thành công" --> VnpIPN["VNPay gửi IPN Callback về hệ thống"]
    VnpIPN --> CheckSign{"Chữ ký hợp lệ?"}
    CheckSign -- "Hợp lệ" --> MarkCompleted["Cập nhật đơn hàng 'completed' & sản phẩm 'sold'"]
    MarkCompleted --> AutoDeliver["Tự động bàn giao dữ liệu số vào đơn hàng"]
    AutoDeliver --> ShowSuccess["Chuyển hướng sang trang 'Thanh toán thành công'"]
    ShowSuccess --> EndNode
```

### Bảng phân làn Swimlanes (AD-05)
- **Người mua:** Xác nhận thanh toán $\rightarrow$ Thao tác trên cổng VNPay $\rightarrow$ Nhận trang kết quả.
- **Hệ thống:** Khóa tạm sản phẩm $\rightarrow$ Sinh URL thanh toán $\rightarrow$ Nhận kết quả IPN và kiểm tra chữ ký SHA-512 $\rightarrow$ Hoàn tất đơn hàng và cập nhật tồn kho.
- **Cổng VNPay:** Tiếp nhận giao dịch, trừ tiền người mua và phản hồi dữ liệu an toàn về hệ thống.

---

## 6. BIỂU ĐỒ AD-06: BÀN GIAO & XEM THÔNG TIN SAU MUA (DELIVERY)

```mermaid
flowchart TD
    Start([●]) --> OpenHistory["Khách hàng vào 'Lịch sử mua hàng'"]
    OpenHistory --> CheckLogin{"Đã đăng nhập?"}

    CheckLogin -- "Chưa" --> GoLogin["Chuyển hướng đăng nhập"]
    GoLogin --> EndNode(((◉)))

    CheckLogin -- "Đã đăng nhập" --> LoadOrders["Tải danh sách đơn hàng đã mua"]
    LoadOrders --> ClickOrder["Chọn đơn hàng đã thanh toán thành công"]
    ClickOrder --> CheckOwner{"Đúng chủ đơn hàng?"}

    CheckOwner -- "Không đúng" --> Show403["Báo lỗi 403 Forbidden"]
    Show403 --> EndNode

    CheckOwner -- "Chính chủ" --> ExtractData["Trích xuất delivered_data (tài khoản/mã thẻ)"]
    ExtractData --> RenderDetail["Hiển thị màn hình bàn giao sản phẩm"]
    RenderDetail --> MaskData["Mặc định che mật khẩu dạng ••••••••"]

    MaskData --> UserInteract{"Thao tác?"}
    UserInteract -- "Bấm Con mắt" --> TogglePassword["Ẩn / Hiện mật khẩu"]
    TogglePassword --> UserInteract

    UserInteract -- "Bấm Sao chép" --> CopyClipboard["Sao chép thông tin vào Clipboard máy khách"]
    CopyClipboard --> ToastCopied["Hiển thị Toast 'Đã sao chép!'"]
    ToastCopied --> EndNode
```

### Bảng phân làn Swimlanes (AD-06)
- **Người mua:** Vào lịch sử đơn hàng $\rightarrow$ Chọn xem chi tiết $\rightarrow$ Xem mật khẩu hoặc bấm sao chép để đăng nhập vào game.
- **Hệ thống:** Kiểm tra quyền sở hữu đơn hàng (Authorization Policy) $\rightarrow$ Trích xuất dữ liệu bàn giao $\rightarrow$ Hỗ trợ bảo mật ẩn mật khẩu và tương tác Clipboard.

---

## 7. BIỂU ĐỒ AD-07: QUẢN LÝ SẢN PHẨM SỐ - ADMIN (PRODUCTS)

```mermaid
flowchart TD
    Start([●]) --> AccessAdmin["Admin mở Bảng quản trị (/admin)"]
    AccessAdmin --> CheckRole{"Quyền Admin?"}

    CheckRole -- "Không" --> DenyAccess["Từ chối truy cập"]
    DenyAccess --> EndNode(((◉)))

    CheckRole -- "Hợp lệ" --> OpenTabProduct["Mở tab Quản lý sản phẩm"]
    OpenTabProduct --> ActionType{"Thao tác?"}

    %% Thêm mới
    ActionType -- "Thêm mới" --> FormAdd["Điền tên, giá, tải ảnh bìa"]
    FormAdd --> FillSecret["Nhập thông tin bí mật (Tài khoản/Mật khẩu hoặc Mã thẻ)"]
    FillSecret --> SubmitSave["Nhấn 'Lưu sản phẩm'"]
    SubmitSave --> ValidateForm{"Dữ liệu hợp lệ?"}

    %% Sửa
    ActionType -- "Sửa" --> FormEdit["Chọn sản phẩm & Sửa giá, mô tả, ảnh, ẩn/hiện"]
    FormEdit --> SubmitUpdate["Nhấn 'Cập nhật'"]
    SubmitUpdate --> ValidateForm

    %% Xóa
    ActionType -- "Xóa" --> ConfirmDelete{"Xác nhận xóa?"}
    ConfirmDelete -- "Đồng ý" --> DeleteProductDb["Xóa sản phẩm trong CSDL"]
    DeleteProductDb --> RefreshList["Làm mới danh sách hiển thị"]
    RefreshList --> EndNode

    ValidateForm -- "Lỗi" --> ShowError["Báo lỗi nhập liệu"]
    ShowError --> FormAdd

    ValidateForm -- "Hợp lệ" --> SaveProductDb["Lưu sản phẩm và thông tin bảo mật vào CSDL"]
    SaveProductDb --> RefreshList
```

### Bảng phân làn Swimlanes (AD-07)
- **Quản trị viên:** Chọn thêm/sửa/xóa $\rightarrow$ Nhập dữ liệu và thông tin tài khoản đăng nhập $\rightarrow$ Bấm lưu.
- **Hệ thống:** Kiểm tra quyền quản trị $\rightarrow$ Xác thực dữ liệu đầu vào $\rightarrow$ Lưu vào bảng CSDL tương ứng $\rightarrow$ Cập nhật lại giao diện.

---

## 8. BIỂU ĐỒ AD-08: QUẢN LÝ VÀ XỬ LÝ ĐƠN HÀNG - ADMIN (ORDERS)

```mermaid
flowchart TD
    Start([●]) --> OpenOrderTab["Admin mở tab 'Quản lý đơn hàng'"]
    OpenOrderTab --> FetchOrders["Hệ thống tải danh sách đơn hàng toàn sàn"]
    FetchOrders --> FilterStatus["Lọc đơn hàng theo trạng thái (Pending / Completed / Cancelled)"]
    FilterStatus --> OpenDetailModal["Mở xem chi tiết đơn hàng cần kiểm tra"]
    OpenDetailModal --> CheckCase{"Tình trạng đơn?"}

    CheckCase -- "Bình thường" --> CloseModal["Đóng xem chi tiết, đối soát doanh thu"]
    CloseModal --> EndNode(((◉)))

    CheckCase -- "Khách khiếu nại / Giao dịch lỗi" --> ClickCancel["Admin nhấn 'Hủy đơn & Hoàn hàng'"]
    ClickCancel --> InputReason["Nhập lý do hủy đơn hàng"]
    InputReason --> ConfirmCancel{"Xác nhận hủy?"}

    ConfirmCancel -- "Không" --> CloseModal
    ConfirmCancel -- "Đồng ý" --> UpdateOrderCancel["Cập nhật đơn hàng sang 'cancelled'"]
    UpdateOrderCancel --> RollbackItems["Tự động chuyển sản phẩm trong đơn từ 'sold' về 'available'"]
    RollbackItems --> SaveAuditLog["Ghi log xử lý vào hệ thống"]
    SaveAuditLog --> ToastSuccess["Hiển thị thông báo 'Đã hủy đơn và hoàn trả sản phẩm lên sàn!'"]
    ToastSuccess --> ReloadOrders["Cập nhật lại danh sách đơn hàng & tồn kho"]
    ReloadOrders --> EndNode
```

### Bảng phân làn Swimlanes (AD-08)
- **Quản trị viên:** Theo dõi danh sách đơn hàng, lọc theo trạng thái $\rightarrow$ Khi có khiếu nại: Thực hiện hủy đơn và hoàn trả sản phẩm.
- **Hệ thống:** Cập nhật trạng thái đơn hàng $\rightarrow$ **Cơ chế tự động hoàn kho**: Quét các sản phẩm trong đơn và chuyển trạng thái từ `sold` trở lại `available` để sàn tiếp tục kinh doanh.

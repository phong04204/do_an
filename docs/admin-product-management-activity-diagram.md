# AD-UC07 - Quản lý sản phẩm số phía Quản trị viên (Activity Diagram)

Biểu đồ hoạt động mô tả tiến trình thực hiện use case **Quản lý sản phẩm số (Thêm mới, Cập nhật, Xóa)** phía Admin, phân chia theo 2 phân làn (**Quản trị viên** và **Hệ thống**), đặc thù cho việc quản lý các mặt hàng số có dữ liệu nhạy cảm (tài khoản đăng nhập, thẻ nạp, giftcode).

---

## 1. Sơ đồ hoạt động (Mermaid Diagram)

```mermaid
flowchart TD
    %% Khởi tạo
    Start([●]) --> OpenAdmin["Admin truy cập Bảng quản trị (/admin)"]
    OpenAdmin --> CheckAdminAuth{"Xác thực quyền Admin?"}

    CheckAdminAuth -- "Không" --> AccessDenied["Chặn truy cập & Chuyển hướng về Trang chủ"]
    AccessDenied --> MergeEnd{" "}

    CheckAdminAuth -- "Hợp lệ" --> OpenProductTab["Mở tab Quản lý sản phẩm"]
    OpenProductTab --> ChooseAction{"Thao tác quản lý?"}

    %% ================= NHÁNH 1: THÊM MỚI SẢN PHẨM =================
    ChooseAction -- "Thêm mới" --> ClickAdd["Nhấn nút 'Thêm sản phẩm mới'"]
    ClickAdd --> SelectType["Chọn loại hàng (Tài khoản game / Thẻ cào / Giftcode)"]
    SelectType --> InputFields["Nhập tiêu đề, giá bán, danh mục, tải ảnh sản phẩm"]
    InputFields --> InputSecret["Nhập thông tin bí mật (Tài khoản/Mật khẩu hoặc Mã thẻ/Serial)"]
    InputSecret --> ClickSave["Nhấn 'Lưu sản phẩm'"]
    ClickSave --> MergeValidate{" "}

    %% ================= NHÁNH 2: SỬA SẢN PHẨM =================
    ChooseAction -- "Sửa thông tin" --> ClickEdit["Chọn sản phẩm & Nhấn 'Chỉnh sửa'"]
    ClickEdit --> LoadCurrentData["Hệ thống hiển thị dữ liệu sản phẩm hiện tại"]
    LoadCurrentData --> EditFields["Admin sửa giá, mô tả, ảnh hoặc ẩn/hiện sản phẩm"]
    EditFields --> ClickUpdate["Nhấn 'Cập nhật'"]
    ClickUpdate --> MergeValidate

    %% ================= NHÁNH 3: XÓA SẢN PHẨM =================
    ChooseAction -- "Xóa sản phẩm" --> ClickDelete["Nhấn nút 'Xóa' tại sản phẩm"]
    ClickDelete --> ConfirmModal["Hệ thống hiển thị hộp thoại xác nhận xóa"]
    ConfirmModal --> ConfirmDelete{"Xác nhận xóa?"}

    ConfirmDelete -- "Hủy" --> CancelAction["Đóng hộp thoại, giữ nguyên dữ liệu"]
    CancelAction --> MergeEnd

    ConfirmDelete -- "Đồng ý" --> ExecDelete["Gửi yêu cầu DELETE /api/admin/products/{id}"]
    ExecDelete --> DeleteDb["Xóa sản phẩm trong CSDL (hoặc chuyển trạng thái hidden)"]
    DeleteDb --> RefreshList["Làm mới danh sách sản phẩm"]
    RefreshList --> MergeEnd

    %% ================= XỬ LÝ LƯU & VALIDATE =================
    MergeValidate --> ValidateData["Hệ thống kiểm tra dữ liệu đầu vào (Validation)"]
    ValidateData --> IsDataValid{"Dữ liệu hợp lệ?"}

    IsDataValid -- "Lỗi" --> ShowFormErrors["Hiển thị cảnh báo lỗi tương ứng tại form"]
    ShowFormErrors --> InputFields

    IsDataValid -- "Hợp lệ" --> SaveToDb["Lưu thông tin sản phẩm và dữ liệu số vào CSDL"]
    SaveToDb --> ShowSuccessToast["Hiển thị thông báo 'Lưu sản phẩm thành công!'"]
    ShowSuccessToast --> RefreshList

    %% ================= KẾT THÚC =================
    MergeEnd --> EndNode(((◉)))

    %% Định dạng màu sắc chuẩn luận văn
    classDef yellowRhombus fill:#fff9db,stroke:#cc0000,stroke-width:1.2px,color:#990000;
    classDef mergeRhombus fill:#f8cecc,stroke:#b85450,stroke-width:1px;
    class CheckAdminAuth,ChooseAction,ConfirmDelete,IsDataValid yellowRhombus;
    class MergeValidate,MergeEnd mergeRhombus;
```

---

## 2. Bảng phân làn trách nhiệm (Swimlanes)

| Phân làn | Các hành động và quyết định |
| :--- | :--- |
| **Quản trị viên (Admin)** | 1. Đăng nhập với tư cách Quản trị viên $\rightarrow$ Truy cập tab **Quản lý sản phẩm**.<br>2. Chọn hành vi tương ứng tại nút **Thao tác quản lý?**:<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Thêm mới:* Chọn loại hàng $\rightarrow$ Điền thông tin giá, mô tả, ảnh $\rightarrow$ **Nhập thông tin đăng nhập/mã thẻ bảo mật** $\rightarrow$ Bấm *"Lưu sản phẩm"*.<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Sửa:* Chọn sản phẩm $\rightarrow$ Thay đổi giá cả, mô tả hoặc trạng thái ẩn/hiện $\rightarrow$ Bấm *"Cập nhật"*.<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Xóa:* Nhấn xóa $\rightarrow$ Xác nhận đồng ý trên hộp thoại cảnh báo.<br>3. Xem danh sách được tự động cập nhật lại trên màn hình. |
| **Hệ thống** | 1. **Kiểm tra quyền hạn Admin (Middleware)**: Ngăn chặn người dùng thường truy cập trái phép.<br>2. **Kiểm tra dữ liệu đầu vào (Validation)**: Đảm bảo giá trị tiền tệ $> 0$, các trường bắt buộc không để trống.<br>3. **Xử lý lưu trữ**: Lưu trữ hình ảnh và ghi bản ghi vào bảng `game_accounts` hoặc `game_cards` tương ứng.<br>4. Đồng bộ lại bảng quản trị và gửi thông báo thành công cho người quản trị. |

# AD-UC2 - Thêm sản phẩm & Quản lý giỏ hàng (Activity Diagram)

Biểu đồ hoạt động mô tả tiến trình hợp nhất giữa hai chức năng: **Thêm sản phẩm vào giỏ hàng** và **Quản lý giỏ hàng (Xem, Sửa số lượng, Xóa sản phẩm)**. Sơ đồ được chuẩn hóa theo 2 phân làn (**Người dùng** và **Hệ thống**).

---

## 1. Sơ đồ hoạt động (Mermaid Diagram)

```mermaid
flowchart TD
    %% Khởi tạo
    Start([●]) --> ProductsPage["Giao diện trang sản phẩm"]
    ProductsPage --> ShowProducts["Hiển thị danh sách các sản phẩm"]
    ShowProducts --> ChooseFunction{"Chọn chức năng"}

    %% ================= NHÁNH 1: THÊM SẢN PHẨM VÀO GIỎ HÀNG =================
    ChooseFunction -- "[Thêm sản phẩm vào giỏ hàng]" --> SelectProduct["Chọn sản phẩm cần thêm vào giỏ hàng."]
    SelectProduct --> ClickAddToCart["Nhấn nút 'Thêm vào giỏ hàng'"]
    ClickAddToCart --> AddSuccess["Thêm sản phẩm vào giỏ hàng thành công"]
    AddSuccess --> MergeFinal{" "}

    %% ================= NHÁNH 2: SỬA SỐ LƯỢNG / XÓA / XEM GIỎ HÀNG =================
    ChooseFunction -- "[Sửa số lượng/Xóa/Xem giỏ hàng]" --> CartPage["Giao diện giỏ hàng"]
    CartPage --> CartAction{"Thao tác?"}

    %% Nhánh con 2.1: Sửa số lượng
    CartAction -- "[Sửa số lượng]" --> InputQty["Nhập số lượng"]
    InputQty --> ClickUpdate["Nhấn nút cập nhật"]
    ClickUpdate --> UpdateSuccess["Sửa số lượng sản phẩm trong giỏ hàng thành công."]
    UpdateSuccess --> MergeCart{" "}

    %% Nhánh con 2.2: Xóa sản phẩm
    CartAction -- "[Xóa]" --> SelectDelete["Chọn sản phẩm cần xóa"]
    SelectDelete --> ClickDelete["Nhấn nút 'Xóa'"]
    ClickDelete --> DeleteSuccess["Xóa sản phẩm trong giỏ hàng thành công"]
    DeleteSuccess --> MergeCart

    %% Gộp luồng và kết thúc
    MergeCart --> MergeFinal
    MergeFinal --> EndNode(((◉)))

    %% Định dạng màu sắc chuẩn luận văn
    classDef yellowRhombus fill:#fff9db,stroke:#cc0000,stroke-width:1.2px,color:#990000;
    classDef mergeRhombus fill:#f8cecc,stroke:#b85450,stroke-width:1px;
    class ChooseFunction,CartAction yellowRhombus;
    class MergeCart,MergeFinal mergeRhombus;
```

---

## 2. Bảng phân làn trách nhiệm (Swimlanes)

| Phân làn | Các hành động và quyết định |
| :--- | :--- |
| **Người dùng** | 1. Bắt đầu $\rightarrow$ Mở **Giao diện trang sản phẩm**.<br>2. Xem danh sách sản phẩm $\rightarrow$ Thực hiện **[Chọn chức năng]**:<br>&nbsp;&nbsp;&nbsp;&nbsp;• **Nhánh 1: [Thêm sản phẩm vào giỏ hàng]:**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Chọn sản phẩm cần thêm vào giỏ hàng.<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Nhấn nút *"Thêm vào giỏ hàng"*.<br>&nbsp;&nbsp;&nbsp;&nbsp;• **Nhánh 2: [Sửa số lượng/Xóa/Xem giỏ hàng]:**<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Truy cập vào **Giao diện giỏ hàng**.<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Rẽ nhánh quyết định thao tác:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ *[Sửa số lượng]:* **Nhập số lượng** $\rightarrow$ **Nhấn nút cập nhật**.<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ *[Xóa]:* **Chọn sản phẩm cần xóa** $\rightarrow$ **Nhấn nút "Xóa"**.<br>3. Đến điểm kết thúc sau khi hoàn tất thao tác. |
| **Hệ thống** | 1. **Hiển thị danh sách các sản phẩm** khi người dùng duyệt trang sản phẩm.<br>2. Tiếp nhận và xử lý các yêu cầu nghiệp vụ tương ứng:<br>&nbsp;&nbsp;&nbsp;&nbsp;• **Thêm sản phẩm vào giỏ hàng thành công.**<br>&nbsp;&nbsp;&nbsp;&nbsp;• **Sửa số lượng sản phẩm trong giỏ hàng thành công.**<br>&nbsp;&nbsp;&nbsp;&nbsp;• **Xóa sản phẩm trong giỏ hàng thành công.**<br>3. Gộp các luồng thành công $\rightarrow$ Điểm kết thúc (End Node). |

---

## 3. Danh sách file đính kèm

- **File Vector SVG (dành cho Word báo cáo):** [cart-management-activity-diagram.svg](file:///d:/test/docs/cart-management-activity-diagram.svg)
- **File mã nguồn Draw.io:** [cart-management-activity-diagram.drawio](file:///d:/test/docs/cart-management-activity-diagram.drawio)
- **Tài liệu đặc tả:** [cart-management-activity-diagram.md](file:///d:/test/docs/cart-management-activity-diagram.md)

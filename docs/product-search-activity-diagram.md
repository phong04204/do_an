# AD-UC03 - Tìm kiếm và Lọc sản phẩm (Activity Diagram)

Biểu đồ hoạt động mô tả tiến trình thực hiện use case **Tìm kiếm và Lọc sản phẩm**, phân chia theo 2 phân làn (**Người dùng** và **Hệ thống**), hỗ trợ kết hợp giữa tìm kiếm theo từ khóa và lọc đa tiêu chí (danh mục game, loại sản phẩm, khoảng giá, sắp xếp).

---

## 1. Sơ đồ hoạt động (Mermaid Diagram)

```mermaid
flowchart TD
    %% Khởi tạo
    Start([●]) --> OpenProducts["Mở trang Danh sách sản phẩm (/san-pham)"]
    OpenProducts --> FetchDefault["Hệ thống tải danh mục & sản phẩm mặc định"]
    FetchDefault --> ActionChoice{"Phương thức tra cứu?"}

    %% ================= NHÁNH 1: TÌM THEO TỪ KHÓA =================
    ActionChoice -- "Tìm từ khóa" --> InputKeyword["Nhập từ khóa tìm kiếm (tên tướng, skin, súng...)"]
    InputKeyword --> SubmitSearch["Nhấn Enter hoặc icon Tìm kiếm"]
    SubmitSearch --> MergeQuery{" "}

    %% ================= NHÁNH 2: LỌC ĐA TIÊU CHÍ =================
    ActionChoice -- "Lọc & Sắp xếp" --> SelectFilters["Chọn tiêu chí lọc (Game, Loại hàng, Mức giá)"]
    SelectFilters --> SelectSort["Chọn thứ tự sắp xếp (Giá tăng/giảm, Mới nhất)"]
    SelectSort --> MergeQuery

    %% ================= XỬ LÝ TRUY VẤN =================
    MergeQuery --> SendApiReq["Gửi yêu cầu GET /api/products kèm tham số query"]
    SendApiReq --> ExecuteQuery["Hệ thống thực thi truy vấn cơ sở dữ liệu"]
    ExecuteQuery --> HasResult{"Tìm thấy sản phẩm?"}

    %% ================= KẾT QUẢ =================
    HasResult -- "Không" --> ShowEmpty["Hiển thị thông báo 'Không tìm thấy sản phẩm phù hợp'"]
    ShowEmpty --> SuggestClear["Gợi ý xóa bộ lọc hoặc tìm từ khóa khác"]
    SuggestClear --> MergeEnd{" "}

    HasResult -- "Có" --> RenderProducts["Hiển thị danh sách sản phẩm (Ảnh, Tên, Giá, Badge)"]
    RenderProducts --> UserBrowse["Người dùng duyệt & chọn xem chi tiết sản phẩm"]
    UserBrowse --> MergeEnd

    %% ================= KẾT THÚC =================
    MergeEnd --> EndNode(((◉)))

    %% Định dạng màu sắc chuẩn luận văn
    classDef yellowRhombus fill:#fff9db,stroke:#cc0000,stroke-width:1.2px,color:#990000;
    classDef mergeRhombus fill:#f8cecc,stroke:#b85450,stroke-width:1px;
    class ActionChoice,HasResult yellowRhombus;
    class MergeQuery,MergeEnd mergeRhombus;
```

---

## 2. Bảng phân làn trách nhiệm (Swimlanes)

| Phân làn | Các hành động và quyết định |
| :--- | :--- |
| **Người dùng** | 1. Bắt đầu $\rightarrow$ Truy cập trang **Danh sách sản phẩm (`/san-pham`)**.<br>2. Chọn hình thức tra cứu tại nút quyết định **Phương thức tra cứu?**:<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Nhánh 1 (Tìm từ khóa):* **Nhập từ khóa** (tên tướng, tên skin, súng...) $\rightarrow$ **Nhấn Tìm kiếm**.<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Nhánh 2 (Lọc & Sắp xếp):* **Chọn tiêu chí lọc** (Tựa game, Loại sản phẩm: Acc/Thẻ/Giftcode, Khoảng giá) $\rightarrow$ **Chọn thứ tự sắp xếp**.<br>3. Nhận phản hồi kết quả:<br>&nbsp;&nbsp;&nbsp;&nbsp;• Nếu không có: Xem thông báo và có thể bấm xóa bộ lọc.<br>&nbsp;&nbsp;&nbsp;&nbsp;• Nếu có: Duyệt danh sách và nhấn vào sản phẩm để xem chi tiết.<br>4. Đến nút Kết thúc (End Node). |
| **Hệ thống** | 1. Khi mở trang: **Tải danh mục & dữ liệu sản phẩm mặc định**.<br>2. Tiếp nhận tham số tìm kiếm/lọc $\rightarrow$ Gửi request API `GET /api/...`<br>3. **Thực thi truy vấn CSDL** (áp dụng các điều kiện `WHERE`, `LIKE %...%`, `ORDER BY`).<br>4. Rẽ nhánh quyết định **Tìm thấy sản phẩm?**:<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Không:* **Hiển thị thông báo rỗng** và gợi ý người dùng.<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Có:* **Render lưới sản phẩm** kèm phân trang, hiển thị hình ảnh đại diện, giá tiền và trạng thái. |

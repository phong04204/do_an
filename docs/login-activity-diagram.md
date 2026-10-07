# AD-UC1.2 - Đăng nhập (Activity Diagram)

Biểu đồ hoạt động mô tả chi tiết tiến trình thực hiện use case **Đăng nhập hệ thống (AD-UC1.2)**, phân chia theo 2 phân làn (**Người dùng** và **Hệ thống**), gồm 2 phương thức: Đăng nhập qua Email và Đăng nhập qua Google.

---

## 1. Sơ đồ hoạt động (Mermaid Diagram)

```mermaid
flowchart TD
    %% Khởi tạo
    Start([●]) --> OpenPage["Mở trang đăng nhập"]
    OpenPage --> Method{"Đăng nhập bằng?"}
    
    %% ================= LUỒNG EMAIL =================
    Method -- "Email" --> InputEmailPass["Nhập email và mật khẩu"]
    InputEmailPass --> ClickSubmit["Nhấn 'Đăng nhập'"]
    ClickSubmit --> CheckInfo["Kiểm tra thông tin"]
    CheckInfo --> Merge1{" "}
    
    %% ================= LUỒNG GOOGLE =================
    Method -- "Google" --> ToGoogle["Chuyển đến Google"]
    ToGoogle --> RecvGoogle["Nhận thông tin Google"]
    RecvGoogle --> ProcessAcc["Xử lý tài khoản"]
    ProcessAcc --> Merge1

    %% ================= KIỂM TRA ĐĂNG NHẬP =================
    Merge1 --> IsSuccess{"Đăng nhập<br/>thành công?"}
    
    IsSuccess -- "Không" --> ShowError["Thông báo lỗi"]
    ShowError --> Merge2{" "}
    
    IsSuccess -- "Có" --> GenToken["Tạo token đăng nhập"]
    GenToken --> ToHome["Chuyển đến trang chủ"]
    ToHome --> Merge2
    
    %% ================= KẾT THÚC =================
    Merge2 --> EndLogin["Kết thúc đăng nhập"]
    EndLogin --> EndNode(((◉)))

    %% Định dạng màu sắc chuẩn
    classDef yellowRhombus fill:#fff9db,stroke:#cc0000,stroke-width:1.2px,color:#990000;
    classDef mergeRhombus fill:#f8cecc,stroke:#b85450,stroke-width:1px;
    class Method,IsSuccess yellowRhombus;
    class Merge1,Merge2 mergeRhombus;
```

---

## 2. Bảng phân làn trách nhiệm (Swimlanes)

| Phân làn | Các hành động và quyết định |
| :--- | :--- |
| **Người dùng** | 1. Bắt đầu $\rightarrow$ **Mở trang đăng nhập**.<br>2. Chọn nhánh: **Đăng nhập bằng?** (Email hoặc Google).<br>3. *Nếu chọn Email:* **Nhập email và mật khẩu** $\rightarrow$ **Nhấn "Đăng nhập"**.<br>4. Khi thành công: Tự động được **Chuyển đến trang chủ**.<br>5. Chuyển đến nút **Kết thúc đăng nhập** $\rightarrow$ Kết thúc tiến trình. |
| **Hệ thống** | 1. *Với luồng Email:* Tiếp nhận yêu cầu $\rightarrow$ **Kiểm tra thông tin** (truy vấn người dùng & kiểm tra mật khẩu Hash).<br>2. *Với luồng Google:* **Chuyển đến Google** $\rightarrow$ **Nhận thông tin Google** $\rightarrow$ **Xử lý tài khoản** (đồng bộ hoặc liên kết tài khoản).<br>3. Gộp 2 luồng tại điểm Merge $\rightarrow$ Rẽ nhánh **Đăng nhập thành công?**:<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Không:* **Thông báo lỗi** $\rightarrow$ Đến điểm gộp kết thúc.<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Có:* **Tạo token đăng nhập** (Sanctum Token) $\rightarrow$ Đưa người dùng chuyển đến trang chủ. |

---

## 3. Danh sách file đính kèm

- **File Vector SVG (dành cho Word báo cáo):** [login-activity-diagram.svg](file:///d:/test/docs/login-activity-diagram.svg)
- **File mã nguồn Draw.io:** [login-activity-diagram.drawio](file:///d:/test/docs/login-activity-diagram.drawio)
- **Tài liệu đặc tả:** [login-activity-diagram.md](file:///d:/test/docs/login-activity-diagram.md)

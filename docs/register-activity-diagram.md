# AD-UC1.1 - Đăng ký tài khoản (Activity Diagram)

Biểu đồ hoạt động mô tả chi tiết tiến trình thực hiện use case **Đăng ký tài khoản (AD-UC1.1)**, phân chia theo 2 phân làn (**Khách vãng lai** và **Hệ thống**), gồm 2 phương thức: Đăng ký qua Email và Đăng ký qua Google.

---

## 1. Sơ đồ hoạt động (Mermaid Diagram)

```mermaid
flowchart TD
    %% Khởi tạo
    Start([●]) --> OpenPage["Mở trang đăng ký"]
    OpenPage --> Method{"Đăng ký bằng?"}
    
    %% ================= LUỒNG EMAIL =================
    Method -- "Email" --> InputInfo["Nhập thông tin đăng ký"]
    InputInfo --> ClickSubmit["Nhấn 'Đăng ký'"]
    ClickSubmit --> CheckInfo["Kiểm tra thông tin"]
    CheckInfo --> Valid{"Hợp lệ?"}
    
    Valid -- "Không" --> ErrEmail["Thông báo lỗi"]
    ErrEmail --> MergeError{" "}
    
    Valid -- "Có" --> CreateAcc["Tạo tài khoản"]
    CreateAcc --> SendMail["Gửi email xác minh"]
    SendMail --> VerifyMail["Xác minh email"]
    VerifyMail --> Verified{"Xác minh?"}
    
    Verified -- "Không" --> ErrVerify["Thông báo lỗi xác minh"]
    Verified -- "Có" --> ActivateAcc["Kích hoạt tài khoản"]
    
    ErrVerify --> MergeVerify{" "}
    ActivateAcc --> MergeVerify
    MergeVerify --> ToLogin["Chuyển đến trang đăng nhập"]
    ToLogin --> MergeFinal{" "}

    %% ================= LUỒNG GOOGLE =================
    Method -- "Google" --> ToGoogle["Chuyển đến Google"]
    ToGoogle --> RecvGoogle["Nhận thông tin Google"]
    RecvGoogle --> GoogSuccess{"Thành công?"}
    
    GoogSuccess -- "Không" --> ErrGoogle["Thông báo lỗi"]
    ErrGoogle --> MergeGoogle{" "}
    
    GoogSuccess -- "Có" --> CreateUpdateAcc["Tạo hoặc cập nhật tài khoản"]
    CreateUpdateAcc --> LoginSystem["Đăng nhập vào hệ thống"]
    LoginSystem --> EnterHome["Chuyển đến trang chủ"]
    
    LoginSystem --> MergeGoogle
    MergeGoogle --> MergeError
    MergeError --> MergeFinal
    EnterHome --> MergeFinal
    
    %% ================= KẾT THÚC =================
    MergeFinal --> EndReg["Kết thúc đăng ký"]
    EndReg --> EndNode(((◉)))

    %% Định dạng màu sắc chuẩn theo mẫu
    classDef yellowRhombus fill:#fff9db,stroke:#cc0000,stroke-width:1.2px,color:#990000;
    classDef mergeRhombus fill:#f8cecc,stroke:#b85450,stroke-width:1px;
    class Method,Valid,Verified,GoogSuccess yellowRhombus;
    class MergeVerify,MergeGoogle,MergeError,MergeFinal mergeRhombus;
```

---

## 2. Bảng phân làn trách nhiệm (Swimlanes)

| Phân làn | Các hành động và quyết định |
| :--- | :--- |
| **Khách vãng lai** | 1. Bắt đầu $\rightarrow$ **Mở trang đăng ký**.<br>2. Quyết định lựa chọn: **Đăng ký bằng?** (Email hoặc Google).<br>3. *Nếu chọn Email:* **Nhập thông tin đăng ký** $\rightarrow$ **Nhấn "Đăng ký"**.<br>4. *Sau khi nhận email xác minh:* Thực hiện **Xác minh email**.<br>5. Được **Chuyển đến trang đăng nhập** $\rightarrow$ Đến nút **Kết thúc đăng ký** $\rightarrow$ Điểm kết thúc.<br>6. *Nếu chọn Google:* Tự động được **Chuyển đến trang chủ** sau khi hoàn tất. |
| **Hệ thống** | 1. *Với luồng Email:* **Kiểm tra thông tin** $\rightarrow$ Rẽ nhánh **Hợp lệ?**:<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Không:* **Thông báo lỗi** $\rightarrow$ Chuyển về luồng kết thúc.<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Có:* **Tạo tài khoản** $\rightarrow$ **Gửi email xác minh**.<br>2. Tiếp nhận yêu cầu xác minh $\rightarrow$ Rẽ nhánh **Xác minh?**:<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Không:* **Thông báo lỗi xác minh**.<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Có:* **Kích hoạt tài khoản**.<br>3. *Với luồng Google:* **Chuyển đến Google** $\rightarrow$ **Nhận thông tin Google** $\rightarrow$ Rẽ nhánh **Thành công?**:<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Không:* **Thông báo lỗi**.<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Có:* **Tạo hoặc cập nhật tài khoản** $\rightarrow$ **Đăng nhập vào hệ thống** $\rightarrow$ Đưa người dùng chuyển đến trang chủ. |

---

## 3. Danh sách file đính kèm

- **File Vector SVG (dành cho Word báo cáo):** [register-activity-diagram.svg](file:///d:/test/docs/register-activity-diagram.svg)
- **File mã nguồn Draw.io:** [register-activity-diagram.drawio](file:///d:/test/docs/register-activity-diagram.drawio)
- **Tài liệu đặc tả:** [register-activity-diagram.md](file:///d:/test/docs/register-activity-diagram.md)

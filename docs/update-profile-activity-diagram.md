# AD-UC1.3 - Cập nhật thông tin cá nhân & Đổi mật khẩu (Activity Diagram)

Biểu đồ hoạt động mô tả chi tiết tiến trình thực hiện use case **Cập nhật thông tin cá nhân & Đổi mật khẩu (AD-UC1.3)**, phân chia theo 2 phân làn (**Người dùng** và **Hệ thống**), hỗ trợ 2 thao tác: Cập nhật thông tin cơ bản (Họ tên, email, số điện thoại) và Thay đổi mật khẩu tài khoản.

---

## 1. Sơ đồ hoạt động (Mermaid Diagram)

```mermaid
flowchart TD
    %% Khởi tạo
    Start([●]) --> OpenPage["Mở trang thông tin"]
    OpenPage --> ShowForm["Hiển thị form cập nhật"]
    ShowForm --> ActionChoice{"Thao tác?"}
    
    %% ================= LUỒNG SỬA THÔNG TIN =================
    ActionChoice -- "Sửa thông tin" --> InputInfo["Nhập tên, email và SĐT"]
    InputInfo --> ClickSave["Nhấn 'Lưu thay đổi'"]
    ClickSave --> CheckInfo["Kiểm tra định dạng & trùng lặp"]
    CheckInfo --> Merge1{" "}
    
    %% ================= LUỒNG ĐỔI MẬT KHẨU =================
    ActionChoice -- "Đổi mật khẩu" --> InputPass["Nhập mật khẩu mới và xác nhận"]
    InputPass --> ClickChangePass["Nhấn 'Đổi mật khẩu'"]
    ClickChangePass --> CheckPass["Kiểm tra độ dài & khớp mật khẩu"]
    CheckPass --> Merge1

    %% ================= KIỂM TRA DỮ LIỆU =================
    Merge1 --> IsValid{"Hợp lệ?"}
    
    IsValid -- "Không" --> ShowError["Thông báo lỗi"]
    ShowError --> Merge2{" "}
    
    IsValid -- "Có" --> UpdateDB["Cập nhật CSDL<br/>(Mã hóa Bcrypt)"]
    UpdateDB --> ShowSuccess["Thông báo thành công"]
    ShowSuccess --> Merge2
    
    %% ================= KẾT THÚC =================
    Merge2 --> EndUpdate["Kết thúc cập nhật"]
    EndUpdate --> EndNode(((◉)))

    %% Định dạng màu sắc chuẩn theo mẫu
    classDef yellowRhombus fill:#fff9db,stroke:#cc0000,stroke-width:1.2px,color:#990000;
    classDef mergeRhombus fill:#f8cecc,stroke:#b85450,stroke-width:1px;
    class ActionChoice,IsValid yellowRhombus;
    class Merge1,Merge2 mergeRhombus;
```

---

## 2. Bảng phân làn trách nhiệm (Swimlanes)

| Phân làn | Các hành động và quyết định |
| :--- | :--- |
| **Người dùng** | 1. Bắt đầu $\rightarrow$ **Mở trang thông tin**.<br>2. Chọn thao tác: **Sửa thông tin** hoặc **Đổi mật khẩu**.<br>3. *Nếu sửa thông tin:* **Nhập tên, email và SĐT** $\rightarrow$ **Nhấn "Lưu thay đổi"**.<br>4. *Nếu đổi mật khẩu:* **Nhập mật khẩu mới và xác nhận** $\rightarrow$ **Nhấn "Đổi mật khẩu"**.<br>5. Nhận kết quả: Xem **Thông báo thành công** (hoặc thông báo lỗi) $\rightarrow$ Đến nút **Kết thúc cập nhật** $\rightarrow$ Điểm kết thúc. |
| **Hệ thống** | 1. Tiếp nhận mở trang $\rightarrow$ **Hiển thị form cập nhật** kèm dữ liệu hiện tại của tài khoản.<br>2. *Với luồng sửa thông tin:* **Kiểm tra định dạng & trùng lặp** (email đúng chuẩn, không trùng với người dùng khác trong CSDL).<br>3. *Với luồng đổi mật khẩu:* **Kiểm tra độ dài & khớp mật khẩu** (mật khẩu $\ge$ 6 ký tự, 2 ô mật khẩu trùng nhau).<br>4. Gộp 2 luồng tại điểm Merge 1 $\rightarrow$ Rẽ nhánh **Hợp lệ?**:<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Không:* **Thông báo lỗi** (báo lỗi cụ thể lên giao diện).<br>&nbsp;&nbsp;&nbsp;&nbsp;• *Có:* **Cập nhật CSDL** (băm mật khẩu với thuật toán Bcrypt `Hash::make()` nếu có đổi pass) $\rightarrow$ Trả về **Thông báo thành công**. |

---

## 3. Danh sách file đính kèm

- **File Vector SVG (dành cho Word báo cáo):** [update-profile-activity-diagram.svg](file:///d:/test/docs/update-profile-activity-diagram.svg)
- **File mã nguồn Draw.io:** [update-profile-activity-diagram.drawio](file:///d:/test/docs/update-profile-activity-diagram.drawio)
- **Tài liệu đặc tả:** [update-profile-activity-diagram.md](file:///d:/test/docs/update-profile-activity-diagram.md)

# Đặc tả use case của hệ thống

## 1. Nhóm Quản lý tài khoản

| Mã UC | Tên use case | Tác nhân | Điều kiện trước | Luồng xử lý chính | Ngoại lệ | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| UC01 | Đăng ký tài khoản | Khách vãng lai | Người dùng chưa có tài khoản trong hệ thống. | Người dùng nhập tên đăng nhập, email, số điện thoại và mật khẩu. Hệ thống kiểm tra dữ liệu, mã hóa mật khẩu và tạo tài khoản mới. | Email hoặc tên đăng nhập đã tồn tại; dữ liệu nhập không hợp lệ. | Tài khoản mới được tạo với vai trò mặc định là khách hàng. |
| UC02 | Đăng nhập | Khách vãng lai, Người dùng, Admin | Người dùng đã có tài khoản hợp lệ. | Người dùng nhập email hoặc tên đăng nhập và mật khẩu. Hệ thống kiểm tra thông tin và cấp token đăng nhập. | Sai thông tin đăng nhập; tài khoản không tồn tại. | Người dùng đăng nhập thành công và được chuyển vào hệ thống. |
| UC03 | Đăng xuất | Người dùng, Admin | Người dùng đã đăng nhập. | Người dùng chọn chức năng đăng xuất. Hệ thống hủy token phiên đăng nhập hiện tại. | Token không hợp lệ hoặc phiên đã hết hạn. | Người dùng thoát khỏi hệ thống. |
| UC04 | Xem thông tin cá nhân | Người dùng, Admin | Người dùng đã đăng nhập. | Người dùng truy cập trang hồ sơ. Hệ thống lấy và hiển thị thông tin tài khoản. | Không xác thực được người dùng. | Thông tin cá nhân được hiển thị. |
| UC05 | Cập nhật hồ sơ | Người dùng, Admin | Người dùng đã đăng nhập. | Người dùng chỉnh sửa tên, email, số điện thoại. Hệ thống kiểm tra dữ liệu và lưu thay đổi. | Email hoặc tên đăng nhập bị trùng; dữ liệu không hợp lệ. | Hồ sơ cá nhân được cập nhật. |
| UC06 | Đổi mật khẩu | Người dùng, Admin | Người dùng đã đăng nhập. | Người dùng nhập mật khẩu mới. Hệ thống kiểm tra độ dài, mã hóa và lưu mật khẩu mới. | Mật khẩu không đạt yêu cầu; xác nhận mật khẩu không khớp. | Mật khẩu được thay đổi thành công. |

## 2. Nhóm Xem và tìm kiếm sản phẩm

| Mã UC | Tên use case | Tác nhân | Điều kiện trước | Luồng xử lý chính | Ngoại lệ | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| UC07 | Xem trang chủ | Khách vãng lai, Người dùng | Hệ thống đang hoạt động. | Người dùng truy cập trang chủ. Hệ thống hiển thị danh mục và sản phẩm nổi bật. | Không tải được dữ liệu sản phẩm. | Trang chủ được hiển thị. |
| UC08 | Xem danh sách sản phẩm | Khách vãng lai, Người dùng | Hệ thống có dữ liệu sản phẩm. | Người dùng truy cập trang sản phẩm. Hệ thống hiển thị tài khoản game, thẻ game và giftcode. | Không có sản phẩm hoặc lỗi tải dữ liệu. | Danh sách sản phẩm được hiển thị. |
| UC09 | Xem chi tiết sản phẩm | Khách vãng lai, Người dùng | Sản phẩm tồn tại trong hệ thống. | Người dùng chọn một sản phẩm. Hệ thống hiển thị hình ảnh, giá, mô tả và trạng thái sản phẩm. | Sản phẩm không tồn tại hoặc đã bị ẩn. | Thông tin chi tiết sản phẩm được hiển thị. |
| UC10 | Tìm kiếm sản phẩm | Khách vãng lai, Người dùng | Người dùng đang ở trang danh sách sản phẩm. | Người dùng nhập từ khóa. Hệ thống lọc sản phẩm theo tên hoặc thông tin liên quan. | Không có sản phẩm phù hợp. | Danh sách kết quả tìm kiếm được hiển thị. |
| UC11 | Lọc sản phẩm | Khách vãng lai, Người dùng | Người dùng đang ở trang danh sách sản phẩm. | Người dùng chọn loại sản phẩm, danh mục hoặc khoảng giá. Hệ thống lọc lại danh sách. | Không có sản phẩm phù hợp bộ lọc. | Danh sách sản phẩm sau lọc được hiển thị. |
| UC12 | Sắp xếp sản phẩm | Khách vãng lai, Người dùng | Người dùng đang ở trang danh sách sản phẩm. | Người dùng chọn kiểu sắp xếp. Hệ thống sắp xếp theo giá hoặc thời gian đăng. | Không có dữ liệu để sắp xếp. | Danh sách sản phẩm được sắp xếp theo tiêu chí đã chọn. |

## 3. Nhóm Quản lý giỏ hàng

| Mã UC | Tên use case | Tác nhân | Điều kiện trước | Luồng xử lý chính | Ngoại lệ | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| UC13 | Thêm sản phẩm vào giỏ hàng | Người dùng | Sản phẩm còn hàng. | Người dùng chọn thêm sản phẩm vào giỏ. Hệ thống lưu sản phẩm vào giỏ hàng. | Sản phẩm không còn hàng hoặc dữ liệu sản phẩm không hợp lệ. | Sản phẩm xuất hiện trong giỏ hàng. |
| UC14 | Xem giỏ hàng | Người dùng | Giỏ hàng có thể rỗng hoặc có sản phẩm. | Người dùng mở trang giỏ hàng. Hệ thống hiển thị danh sách sản phẩm trong giỏ. | Không đọc được dữ liệu giỏ hàng. | Giỏ hàng được hiển thị. |
| UC15 | Chọn sản phẩm cần thanh toán | Người dùng | Giỏ hàng có ít nhất một sản phẩm. | Người dùng chọn một hoặc nhiều sản phẩm. Hệ thống ghi nhận danh sách sản phẩm được chọn. | Người dùng chưa chọn sản phẩm nào. | Sản phẩm cần thanh toán được xác định. |
| UC16 | Kiểm tra sản phẩm không bị trùng trong giỏ hàng | Người dùng | Người dùng chọn thêm một sản phẩm số vào giỏ hàng. | Hệ thống xác định sản phẩm theo loại và mã sản phẩm; mỗi sản phẩm chỉ được lưu một lần trong giỏ hàng. | Sản phẩm đã tồn tại trong giỏ hàng thì hệ thống không thêm bản ghi trùng. | Giỏ hàng không có sản phẩm trùng lặp và không phát sinh số lượng mua nhiều. |
| UC17 | Xóa sản phẩm khỏi giỏ hàng | Người dùng | Sản phẩm có trong giỏ hàng. | Người dùng chọn xóa một sản phẩm. Hệ thống loại sản phẩm khỏi giỏ. | Sản phẩm không tồn tại trong giỏ. | Sản phẩm được xóa khỏi giỏ hàng. |
| UC18 | Xóa toàn bộ giỏ hàng | Người dùng | Giỏ hàng có sản phẩm. | Người dùng chọn xóa toàn bộ. Hệ thống xóa tất cả sản phẩm trong giỏ. | Giỏ hàng đang rỗng. | Giỏ hàng trở về trạng thái rỗng. |
| UC19 | Tính tổng tiền giỏ hàng | Người dùng | Giỏ hàng có sản phẩm được chọn. | Hệ thống cộng giá bán của từng sản phẩm duy nhất được chọn trong giỏ hàng. | Dữ liệu giá không hợp lệ. | Tổng tiền giỏ hàng được hiển thị. |

## 4. Nhóm Đặt hàng và thanh toán

| Mã UC | Tên use case | Tác nhân | Điều kiện trước | Luồng xử lý chính | Ngoại lệ | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| UC20 | Tạo đơn hàng | Người dùng | Người dùng đã chọn sản phẩm cần mua. | Người dùng xác nhận thanh toán. Hệ thống tạo đơn hàng với trạng thái chờ thanh toán. | Không có sản phẩm hợp lệ trong đơn hàng. | Đơn hàng mới được tạo. |
| UC21 | Kiểm tra thông tin đơn hàng | Người dùng | Đơn hàng đã được khởi tạo. | Hệ thống kiểm tra danh sách sản phẩm, tổng tiền và phương thức thanh toán. | Thông tin đơn hàng thiếu hoặc sai. | Đơn hàng đủ điều kiện xử lý tiếp. |
| UC22 | Kiểm tra trạng thái sản phẩm | Hệ thống | Đơn hàng có sản phẩm cần mua. | Hệ thống kiểm tra từng sản phẩm còn ở trạng thái khả dụng hay không. | Sản phẩm đã bán hoặc bị ẩn. | Chỉ các sản phẩm hợp lệ được tiếp tục thanh toán. |
| UC23 | Thanh toán qua VNPay | Người dùng, Cổng VNPay | Đơn hàng hợp lệ và có tổng tiền thanh toán. | Hệ thống tạo URL thanh toán VNPay và chuyển người dùng sang cổng thanh toán. | Không tạo được URL thanh toán; người dùng hủy giao dịch. | Người dùng thực hiện thanh toán trên VNPay. |
| UC24 | Nhận kết quả thanh toán | Cổng VNPay, Hệ thống | Giao dịch VNPay đã hoàn tất hoặc thất bại. | VNPay gửi kết quả về hệ thống qua callback. Hệ thống kiểm tra chữ ký và mã phản hồi. | Chữ ký không hợp lệ; không tìm thấy đơn hàng. | Kết quả thanh toán được ghi nhận. |
| UC25 | Cập nhật trạng thái đơn hàng | Hệ thống | Đã nhận kết quả thanh toán. | Nếu thanh toán thành công, hệ thống cập nhật đơn hàng hoàn tất; nếu thất bại, cập nhật trạng thái thất bại. | Lỗi cập nhật dữ liệu. | Trạng thái đơn hàng được cập nhật. |

## 5. Nhóm Bàn giao sản phẩm sau thanh toán

| Mã UC | Tên use case | Tác nhân | Điều kiện trước | Luồng xử lý chính | Ngoại lệ | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| UC26 | Nhận thông tin tài khoản game | Người dùng | Đơn hàng tài khoản game đã thanh toán thành công. | Hệ thống bàn giao tên đăng nhập và mật khẩu tài khoản game. | Dữ liệu bàn giao không tồn tại. | Người dùng nhận được thông tin tài khoản game. |
| UC27 | Nhận thông tin thẻ game | Người dùng | Đơn hàng thẻ game đã thanh toán thành công. | Hệ thống bàn giao số serial và mã thẻ. | Dữ liệu thẻ không tồn tại. | Người dùng nhận được thông tin thẻ game. |
| UC28 | Nhận mã giftcode | Người dùng | Đơn hàng giftcode đã thanh toán thành công. | Hệ thống bàn giao mã giftcode. | Dữ liệu giftcode không tồn tại. | Người dùng nhận được mã giftcode. |
| UC29 | Ẩn hoặc hiện thông tin bàn giao | Người dùng | Đơn hàng có dữ liệu bàn giao. | Người dùng chọn ẩn hoặc hiện dữ liệu nhạy cảm. Hệ thống thay đổi trạng thái hiển thị. | Không có dữ liệu để hiển thị. | Thông tin bàn giao được ẩn hoặc hiện theo thao tác. |
| UC30 | Sao chép thông tin bàn giao | Người dùng | Thông tin bàn giao đã được hiển thị. | Người dùng chọn sao chép. Hệ thống đưa dữ liệu vào clipboard. | Trình duyệt không hỗ trợ sao chép. | Dữ liệu bàn giao được sao chép. |

## 6. Nhóm Lịch sử mua hàng

| Mã UC | Tên use case | Tác nhân | Điều kiện trước | Luồng xử lý chính | Ngoại lệ | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| UC31 | Xem danh sách đơn hàng đã mua | Người dùng | Người dùng đã đăng nhập. | Người dùng mở lịch sử mua hàng. Hệ thống hiển thị các đơn hàng của người dùng. | Chưa có đơn hàng. | Danh sách đơn hàng được hiển thị. |
| UC32 | Xem chi tiết đơn hàng | Người dùng | Đơn hàng thuộc về người dùng. | Người dùng chọn một đơn hàng. Hệ thống hiển thị chi tiết sản phẩm, trạng thái và thanh toán. | Đơn hàng không tồn tại hoặc không thuộc người dùng. | Chi tiết đơn hàng được hiển thị. |
| UC33 | Lọc đơn hàng theo trạng thái | Người dùng | Có danh sách đơn hàng. | Người dùng chọn trạng thái. Hệ thống lọc danh sách theo trạng thái đã chọn. | Không có đơn hàng phù hợp. | Danh sách sau lọc được hiển thị. |
| UC34 | Tìm kiếm đơn hàng | Người dùng | Có danh sách đơn hàng. | Người dùng nhập mã đơn hoặc tên sản phẩm. Hệ thống tìm kiếm trong lịch sử đơn hàng. | Không có kết quả phù hợp. | Kết quả tìm kiếm được hiển thị. |
| UC35 | Xem lại thông tin bàn giao | Người dùng | Đơn hàng đã hoàn tất và có dữ liệu bàn giao. | Người dùng mở phần thông tin bàn giao trong lịch sử. Hệ thống hiển thị dữ liệu đã bàn giao. | Đơn hàng chưa hoàn tất hoặc thiếu dữ liệu. | Người dùng xem lại được thông tin bàn giao. |

## 7. Nhóm Quản lý người dùng

| Mã UC | Tên use case | Tác nhân | Điều kiện trước | Luồng xử lý chính | Ngoại lệ | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| UC36 | Xem danh sách người dùng | Admin | Admin đã đăng nhập. | Admin truy cập trang quản trị người dùng. Hệ thống hiển thị danh sách tài khoản. | Không có quyền truy cập. | Danh sách người dùng được hiển thị. |
| UC37 | Cập nhật vai trò người dùng | Admin | Người dùng tồn tại trong hệ thống. | Admin chọn tài khoản và thay đổi vai trò. Hệ thống kiểm tra và lưu vai trò mới. | Vai trò không hợp lệ; không có quyền thao tác. | Vai trò người dùng được cập nhật. |
| UC38 | Cập nhật trạng thái người dùng | Admin | Người dùng tồn tại trong hệ thống. | Admin khóa hoặc mở khóa tài khoản. Hệ thống cập nhật trạng thái. | Không tìm thấy người dùng. | Trạng thái tài khoản được thay đổi. |
| UC39 | Xóa người dùng | Admin | Người dùng tồn tại trong hệ thống. | Admin chọn xóa tài khoản. Hệ thống xóa hoặc đánh dấu xóa tài khoản. | Không tìm thấy người dùng; không có quyền xóa. | Tài khoản người dùng bị xóa khỏi danh sách quản trị. |

## 8. Nhóm Quản lý sản phẩm

| Mã UC | Tên use case | Tác nhân | Điều kiện trước | Luồng xử lý chính | Ngoại lệ | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| UC40 | Xem danh sách tài khoản game | Admin | Admin đã đăng nhập. | Admin mở danh sách tài khoản game. Hệ thống hiển thị dữ liệu hiện có. | Không có quyền truy cập. | Danh sách tài khoản game được hiển thị. |
| UC41 | Thêm tài khoản game | Admin | Admin có quyền quản trị sản phẩm. | Admin nhập thông tin tài khoản game, giá, mô tả và dữ liệu bàn giao. Hệ thống lưu sản phẩm. | Thiếu dữ liệu bắt buộc. | Tài khoản game mới được thêm. |
| UC42 | Cập nhật tài khoản game | Admin | Tài khoản game tồn tại. | Admin chỉnh sửa thông tin sản phẩm. Hệ thống kiểm tra và lưu thay đổi. | Sản phẩm không tồn tại. | Tài khoản game được cập nhật. |
| UC43 | Xóa tài khoản game | Admin | Tài khoản game tồn tại. | Admin chọn xóa sản phẩm. Hệ thống xóa tài khoản game khỏi danh sách. | Sản phẩm không tồn tại. | Tài khoản game bị xóa. |
| UC44 | Xem danh sách thẻ game | Admin | Admin đã đăng nhập. | Admin mở danh sách thẻ game. Hệ thống hiển thị dữ liệu thẻ. | Không có quyền truy cập. | Danh sách thẻ game được hiển thị. |
| UC45 | Thêm thẻ game | Admin | Admin có quyền quản trị sản phẩm. | Admin nhập tiêu đề, giá, serial và mã thẻ. Hệ thống lưu thẻ game. | Thiếu serial hoặc mã thẻ. | Thẻ game mới được thêm. |
| UC46 | Cập nhật thẻ game | Admin | Thẻ game tồn tại. | Admin chỉnh sửa thông tin thẻ. Hệ thống lưu thay đổi. | Thẻ không tồn tại. | Thẻ game được cập nhật. |
| UC47 | Xóa thẻ game | Admin | Thẻ game tồn tại. | Admin chọn xóa thẻ. Hệ thống xóa thẻ khỏi danh sách. | Thẻ không tồn tại. | Thẻ game bị xóa. |
| UC48 | Xem danh sách giftcode | Admin | Admin đã đăng nhập. | Admin mở danh sách giftcode. Hệ thống hiển thị dữ liệu giftcode. | Không có quyền truy cập. | Danh sách giftcode được hiển thị. |
| UC49 | Thêm giftcode | Admin | Admin có quyền quản trị sản phẩm. | Admin nhập tiêu đề, giá và mã giftcode. Hệ thống lưu giftcode. | Thiếu mã giftcode. | Giftcode mới được thêm. |
| UC50 | Cập nhật giftcode | Admin | Giftcode tồn tại. | Admin chỉnh sửa thông tin giftcode. Hệ thống lưu thay đổi. | Giftcode không tồn tại. | Giftcode được cập nhật. |
| UC51 | Xóa giftcode | Admin | Giftcode tồn tại. | Admin chọn xóa giftcode. Hệ thống xóa khỏi danh sách. | Giftcode không tồn tại. | Giftcode bị xóa. |

## 9. Nhóm Quản lý đơn hàng và thống kê

| Mã UC | Tên use case | Tác nhân | Điều kiện trước | Luồng xử lý chính | Ngoại lệ | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| UC52 | Xem danh sách đơn hàng | Admin | Admin đã đăng nhập. | Admin mở trang quản lý đơn hàng. Hệ thống hiển thị toàn bộ đơn hàng. | Không có quyền truy cập. | Danh sách đơn hàng được hiển thị. |
| UC53 | Xem chi tiết đơn hàng | Admin | Đơn hàng tồn tại. | Admin chọn một đơn hàng. Hệ thống hiển thị chi tiết sản phẩm, thanh toán và bàn giao. | Đơn hàng không tồn tại. | Chi tiết đơn hàng được hiển thị. |
| UC54 | Cập nhật trạng thái đơn hàng | Admin | Đơn hàng tồn tại. | Admin cập nhật trạng thái đơn hàng. Hệ thống lưu trạng thái mới. | Trạng thái không hợp lệ. | Trạng thái đơn hàng được cập nhật. |
| UC55 | Xem tổng số người dùng | Admin | Admin đã đăng nhập. | Hệ thống thống kê và hiển thị tổng số người dùng. | Lỗi truy vấn dữ liệu. | Tổng số người dùng được hiển thị. |
| UC56 | Xem tổng số sản phẩm | Admin | Admin đã đăng nhập. | Hệ thống thống kê tổng số tài khoản game, thẻ game và giftcode. | Lỗi truy vấn dữ liệu. | Tổng số sản phẩm được hiển thị. |
| UC57 | Xem tổng số đơn hàng | Admin | Admin đã đăng nhập. | Hệ thống thống kê số lượng đơn hàng. | Lỗi truy vấn dữ liệu. | Tổng số đơn hàng được hiển thị. |
| UC58 | Xem doanh thu | Admin | Admin đã đăng nhập. | Hệ thống tính doanh thu từ các đơn hàng hoàn tất. | Lỗi truy vấn dữ liệu. | Doanh thu được hiển thị. |
| UC59 | Xem số lượng đơn hàng chờ xử lý | Admin | Admin đã đăng nhập. | Hệ thống đếm các đơn hàng có trạng thái chờ xử lý. | Lỗi truy vấn dữ liệu. | Số lượng đơn hàng chờ xử lý được hiển thị. |

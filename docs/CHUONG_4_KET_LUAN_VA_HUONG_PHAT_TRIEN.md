# CHƯƠNG 4: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 4.1. Kết luận

Đồ án đã mang lại một giải pháp ứng dụng web quản lý và giao dịch tài khoản game trực tuyến chuyên biệt, an toàn và minh bạch, đáp ứng nhu cầu cấp thiết về mua bán, trao đổi các sản phẩm số (tài khoản game, thẻ game, giftcode) trong cộng đồng người chơi tại Việt Nam. Đề tài đã giải quyết thành công bài toán thay thế các phương thức giao dịch tự phát, tiềm ẩn nhiều nguy cơ lừa đảo và tranh chấp trên mạng xã hội bằng một nền tảng thương mại điện tử tập trung, có quy chuẩn và bảo vệ quyền lợi người dùng. Qua quá trình nghiên cứu lý thuyết, phân tích thiết kế và triển khai thực nghiệm, các mục tiêu chính của đề tài đã được thực hiện với hiệu quả đáng kể:

Nâng cao tính an toàn và minh bạch hóa giao dịch sản phẩm số: Hệ thống đã tự động hóa và chuẩn hóa toàn bộ chu trình nghiệp vụ thương mại điện tử từ khâu tra cứu, tìm kiếm, lọc theo tiêu chí, quản lý giỏ hàng đến thanh toán trực tuyến qua cổng VNPay và bàn giao thông tin bảo mật tự động (`delivered_data`). Đặc biệt, hệ thống đã giải quyết triệt để tính chất độc bản của tài khoản game thông qua cơ chế chuyển đổi trạng thái giao dịch nguyên khối (Database Transaction), tự động cập nhật tài khoản sang trạng thái đã bán (`sold`) và ẩn khỏi danh sách sản phẩm ngay sau khi hoàn tất thanh toán, ngăn chặn hoàn toàn nguy cơ bán trùng lặp.

Ứng dụng công nghệ hiện đại và kiến trúc tiên tiến: Việc áp dụng mô hình kiến trúc tách biệt hoàn toàn (Decoupled Architecture) giữa backend sử dụng framework Laravel 11 và frontend sử dụng Next.js 16 (React 19, TypeScript) kết hợp hệ quản trị cơ sở dữ liệu MySQL đã chứng minh tính hiệu quả vượt trội. Kiến trúc này không chỉ tối ưu hóa hiệu năng kết xuất trang nhờ Server-Side Rendering (SSR), tăng cường khả năng tối ưu hóa công cụ tìm kiếm (SEO) và bảo đảm tính bảo mật của các API RESTful, mà còn nâng cao kỹ năng chuyên môn của người thực hiện trong việc phân tích, thiết kế hệ thống và phát triển phần mềm theo tiêu chuẩn hiện đại.

Bảo đảm chất lượng qua kiểm thử bài bản: Hệ thống được kiểm thử toàn diện thông qua 40 ca kiểm thử chức năng, bảo mật và tương thích đa nền tảng dựa trên các kỹ thuật kiểm thử hộp đen tiêu chuẩn (phân vùng tương đương, phân tích giá trị biên, bảng quyết định, sơ đồ chuyển trạng thái), tất cả đều đạt kết quả 100%. Bên cạnh đó, kết quả kiểm thử tải bằng Apache JMeter đã chứng thực tính đúng đắn và độ ổn định của hệ thống dưới tải trọng đồng thời, bảo đảm không phát sinh lỗi thất thoát dữ liệu hay sai lệch dòng tiền giao dịch.

Giá trị thực tiễn trong thương mại điện tử sản phẩm số: Sản phẩm không chỉ đơn thuần là một website mua sắm mà còn thiết lập một môi trường giao dịch văn minh, uy tín cho các tài sản số trong lĩnh vực thể thao điện tử (Esports) và game trực tuyến. Đồ án đồng thời khẳng định năng lực tự nghiên cứu, làm chủ công nghệ mới và tư duy giải quyết vấn đề thực tiễn của sinh viên, đáp ứng các tiêu chuẩn tuyển dụng kỹ sư phần mềm Full-stack trong ngành công nghệ thông tin.

Mặc dù đạt được nhiều kết quả tích cực, trong quá trình thực hiện đồ án vẫn còn tồn tại một số hạn chế về mặt khả năng chịu tải trên diện rộng, sự đa dạng của các phương thức thanh toán thực tế và các tính năng tương tác thời gian thực. Những hạn chế này mở ra cơ hội để tiếp tục cải tiến, hoàn thiện hệ thống trong tương lai.

## 4.2. Hướng phát triển

Để nâng cao giá trị của hệ thống và mở rộng phạm vi ứng dụng trong thực tiễn, một số hướng phát triển thêm có thể được xem xét như sau:

Tối ưu hóa hiệu năng và khả năng mở rộng:
- Áp dụng các giải pháp lưu trữ đệm phân tán (Redis Cache) để lưu tạm dữ liệu danh mục, cấu hình hệ thống và danh sách sản phẩm phổ biến, giúp giảm tải trực tiếp lên cơ sở dữ liệu MySQL.
- Triển khai mô hình cân bằng tải (Load Balancing) và mạng phân phối nội dung (CDN) nhằm cải thiện tốc độ phản hồi và nâng cao năng lực chịu tải đồng thời của hệ thống trong các khung giờ cao điểm.
- Ứng dụng hàng đợi bất đồng bộ (Message Queue) để xử lý các tác vụ tiêu tốn tài nguyên như gửi thư điện tử xác nhận đơn hàng hay xử lý số liệu báo cáo thống kê.

Nâng cấp cổng thanh toán và mở rộng giao dịch thực tế:
- Hoàn thiện thủ tục pháp lý để chuyển đổi cổng thanh toán VNPay từ môi trường thử nghiệm (Sandbox) sang môi trường tích hợp doanh nghiệp thực tế.
- Tích hợp thêm các phương thức thanh toán phổ biến tại Việt Nam như ví điện tử MoMo, ZaloPay, ShopeePay và dịch vụ tự động hóa nạp thẻ cào viễn thông nhằm tối đa hóa sự tiện lợi cho người dùng.

Phát triển sàn giao dịch ngang hàng (C2C) và cơ chế ký quỹ an toàn:
- Mở rộng mô hình kinh doanh từ bán hàng tập trung (B2C) sang mô hình sàn giao dịch ngang hàng (C2C), cho phép các thành viên cộng đồng tự do đăng tin bán tài khoản game cá nhân.
- Thiết kế và triển khai cơ chế ký quỹ trung gian (Escrow Service): hệ thống đóng vai trò bên thứ ba phong tỏa số tiền thanh toán của người mua; chỉ thực hiện giải ngân cho người bán sau khi người mua xác nhận đã nhận đủ thông tin và đổi mật khẩu tài khoản thành công, triệt tiêu nguy cơ lừa đảo giữa các cá nhân.
- Xây dựng hệ thống đánh giá uy tín và điểm tin cậy của người bán dựa trên lịch sử giao dịch và phản hồi từ người mua.

Tích hợp giao diện lập trình ứng dụng (API) xác thực tài khoản tự động:
- Nghiên cứu kết nối và tích hợp API với các nhà phát hành trò chơi điện tử lớn (Riot Games, Garena, Valve Steam) nhằm tự động hóa quy trình xác minh tính chính xác của tài khoản (cấp bậc rank, số lượng trang phục, tướng) trước khi duyệt mở bán, loại bỏ sai lệch do nhập liệu thủ công.

Tích hợp truyền thông thời gian thực và hỗ trợ khách hàng:
- Xây dựng phân hệ trò chuyện trực tuyến (Live Chat) và thông báo đẩy (Push Notifications) sử dụng công nghệ WebSocket (Laravel Reverb / Pusher), tạo điều kiện cho người mua và ban quản trị tương tác, xử lý khiếu nại và hỗ trợ kỹ thuật tức thời trong quá trình bàn giao sản phẩm.

Ứng dụng trí tuệ nhân tạo (AI) và phân tích dữ liệu:
- Ứng dụng các thuật toán gợi ý thông minh (Recommendation System) để phân tích hành vi tìm kiếm và đề xuất các tài khoản game, mã quà tặng phù hợp nhất với sở thích và ngân sách của từng khách hàng.
- Nghiên cứu mô hình học máy (Machine Learning) hỗ trợ định giá tài khoản game tự động dựa trên các thông số thuộc tính và dữ liệu biến động giá thị trường.

Tăng cường bảo mật và quản lý rủi ro giao dịch:
- Cập nhật các biện pháp bảo mật hiện đại, áp dụng cơ chế xác thực hai lớp (2FA qua Google Authenticator hoặc OTP SMS) cho các thao tác nhạy cảm như đổi mật khẩu, xem dữ liệu bảo mật đã mua hay thay đổi thông tin rút tiền.
- Định kỳ thực hiện kiểm thử xâm nhập (Penetration Testing) chuyên sâu theo chuẩn OWASP nhằm rà soát và khắc phục triệt để các lỗ hổng bảo mật tiềm ẩn.

Phát triển ứng dụng di động đa nền tảng:
- Xây dựng ứng dụng di động (Native App hoặc Cross-platform với React Native / Flutter) trên nền tảng Android và iOS để người dùng có thể tìm kiếm, nhận thông báo biến động tài khoản và quản lý đơn hàng một cách nhanh chóng, thuận tiện mọi lúc mọi nơi.

Những hướng phát triển này không chỉ giúp hoàn thiện các chức năng còn hạn chế của hệ thống hiện tại mà còn tạo ra giá trị gia tăng trong hoạt động thương mại điện tử sản phẩm số, đáp ứng nhu cầu ngày càng cao của thị trường số hóa trong tương lai.

---

# TÀI LIỆU THAM KHẢO

### Tiếng Việt

1. Thạc Bình Cường (2016). *Giáo trình Phân tích và Thiết kế hệ thống thông tin*, Khoa Công nghệ thông tin – Đại học Bách Khoa Hà Nội.
2. Đỗ Trung Tuấn (2014). *Cơ sở dữ liệu*, NXB Đại học Quốc gia Hà Nội.
3. Nguyễn Văn Vỵ (2010). *Giáo trình Phân tích thiết kế hệ thống thông tin quản lý*, NXB Thống kê, Hà Nội.
4. VNPay (2024). *Tài liệu tích hợp cổng thanh toán trực tuyến VNPay Payment Gateway Sandbox*, https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/, truy cập ngày 10/05/2026.

### Tiếng Anh

1. Laravel LLC (2024). *Laravel Documentation (Version 11.x)*, https://laravel.com/docs/11.x, truy cập ngày 15/04/2026.
2. Vercel Inc. (2024). *Next.js Documentation & App Router Guide*, https://nextjs.org/docs, truy cập ngày 18/04/2026.
3. React Core Team (2024). *React 19 Documentation*, https://react.dev, truy cập ngày 20/04/2026.
4. Mozilla Developer Network (MDN) (2024). *Web technology for developers: HTML, CSS, JavaScript, Web Security*, https://developer.mozilla.org, truy cập ngày 22/04/2026.
5. Martin Fowler (2002). *Patterns of Enterprise Application Architecture*, Addison-Wesley Professional.
6. Apache JMeter (2024). *Apache JMeter User's Manual*, https://jmeter.apache.org/usermanual/index.html, truy cập ngày 05/05/2026.

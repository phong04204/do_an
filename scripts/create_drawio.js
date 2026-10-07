const fs = require('fs');

function makeDrawio(id, name, content) {
  return '<mxfile host="Electron" version="22.1.2" type="device">\n' +
    '  <diagram id="' + id + '" name="' + name + '">\n' +
    '    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169">\n' +
    '      <root>\n' +
    '        <mxCell id="0" />\n' +
    '        <mxCell id="1" parent="0" />\n' +
    content +
    '      </root>\n' +
    '    </mxGraphModel>\n' +
    '  </diagram>\n' +
    '</mxfile>';
}

// 1. Search
fs.writeFileSync('d:/test/docs/product-search-activity-diagram.drawio', makeDrawio('ad_uc03', 'AD-UC03 - Tìm kiếm và Lọc sản phẩm', 
  '<mxCell id="title" value="AD-UC03 - Tìm kiếm và Lọc sản phẩm" style="text;html=1;align=center;verticalAlign=middle;fontStyle=1;fontSize=13;fontFamily=Arial;" vertex="1" parent="1"><mxGeometry x="220" y="10" width="350" height="20" as="geometry" /></mxCell>' +
  '<mxCell id="lane_user" value="Người dùng" style="swimlane;whiteSpace=wrap;html=1;startSize=25;fontFamily=Arial;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="40" y="40" width="320" height="700" as="geometry" /></mxCell>' +
  '<mxCell id="lane_sys" value="Hệ thống" style="swimlane;whiteSpace=wrap;html=1;startSize=25;fontFamily=Arial;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="360" y="40" width="380" height="700" as="geometry" /></mxCell>' +
  '<mxCell id="start" value="" style="ellipse;fillColor=#000000;strokeColor=#000000;" vertex="1" parent="lane_user"><mxGeometry x="150" y="40" width="20" height="20" as="geometry" /></mxCell>' +
  '<mxCell id="act1" value="Mở trang Sản phẩm&#xa;(/san-pham)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;fontFamily=Arial;" vertex="1" parent="lane_user"><mxGeometry x="100" y="80" width="120" height="40" as="geometry" /></mxCell>' +
  '<mxCell id="act2" value="Tải danh mục &amp; sản phẩm mặc định" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333333;fontFamily=Arial;" vertex="1" parent="lane_sys"><mxGeometry x="120" y="80" width="140" height="40" as="geometry" /></mxCell>' +
  '<mxCell id="dec1" value="Phương thức?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#fff9db;strokeColor=#cc0000;fontColor=#990000;fontStyle=1;" vertex="1" parent="lane_user"><mxGeometry x="100" y="150" width="120" height="40" as="geometry" /></mxCell>'
));

// 2. Payment
fs.writeFileSync('d:/test/docs/order-payment-activity-diagram.drawio', makeDrawio('ad_uc05', 'AD-UC05 - Đặt hàng và Thanh toán VNPay',
  '<mxCell id="title" value="AD-UC05 - Đặt hàng và Thanh toán VNPay" style="text;html=1;align=center;verticalAlign=middle;fontStyle=1;fontSize=13;fontFamily=Arial;" vertex="1" parent="1"><mxGeometry x="220" y="10" width="380" height="20" as="geometry" /></mxCell>' +
  '<mxCell id="lane_buyer" value="Người mua" style="swimlane;whiteSpace=wrap;html=1;startSize=25;fontFamily=Arial;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="30" y="40" width="220" height="750" as="geometry" /></mxCell>' +
  '<mxCell id="lane_store" value="Hệ thống Store" style="swimlane;whiteSpace=wrap;html=1;startSize=25;fontFamily=Arial;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="250" y="40" width="260" height="750" as="geometry" /></mxCell>' +
  '<mxCell id="lane_vnp" value="Cổng VNPay" style="swimlane;whiteSpace=wrap;html=1;startSize=25;fontFamily=Arial;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="510" y="40" width="240" height="750" as="geometry" /></mxCell>'
));

// 3. Delivery
fs.writeFileSync('d:/test/docs/delivery-viewing-activity-diagram.drawio', makeDrawio('ad_uc06', 'AD-UC06 - Bàn giao và Xem thông tin sau mua',
  '<mxCell id="title" value="AD-UC06 - Bàn giao và Xem thông tin sau mua" style="text;html=1;align=center;verticalAlign=middle;fontStyle=1;fontSize=13;fontFamily=Arial;" vertex="1" parent="1"><mxGeometry x="200" y="10" width="400" height="20" as="geometry" /></mxCell>' +
  '<mxCell id="lane_user" value="Người mua" style="swimlane;whiteSpace=wrap;html=1;startSize=25;fontFamily=Arial;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="40" y="40" width="320" height="700" as="geometry" /></mxCell>' +
  '<mxCell id="lane_sys" value="Hệ thống" style="swimlane;whiteSpace=wrap;html=1;startSize=25;fontFamily=Arial;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="360" y="40" width="380" height="700" as="geometry" /></mxCell>'
));

// 4. Admin Product
fs.writeFileSync('d:/test/docs/admin-product-management-activity-diagram.drawio', makeDrawio('ad_uc07', 'AD-UC07 - Quản lý sản phẩm số (Admin)',
  '<mxCell id="title" value="AD-UC07 - Quản lý sản phẩm số (Admin)" style="text;html=1;align=center;verticalAlign=middle;fontStyle=1;fontSize=13;fontFamily=Arial;" vertex="1" parent="1"><mxGeometry x="200" y="10" width="400" height="20" as="geometry" /></mxCell>' +
  '<mxCell id="lane_admin" value="Quản trị viên (Admin)" style="swimlane;whiteSpace=wrap;html=1;startSize=25;fontFamily=Arial;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="40" y="40" width="320" height="700" as="geometry" /></mxCell>' +
  '<mxCell id="lane_sys" value="Hệ thống" style="swimlane;whiteSpace=wrap;html=1;startSize=25;fontFamily=Arial;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="360" y="40" width="380" height="700" as="geometry" /></mxCell>'
));

// 5. Admin Order
fs.writeFileSync('d:/test/docs/admin-order-management-activity-diagram.drawio', makeDrawio('ad_uc08', 'AD-UC08 - Quản lý và Xử lý đơn hàng (Admin)',
  '<mxCell id="title" value="AD-UC08 - Quản lý và Xử lý đơn hàng (Admin)" style="text;html=1;align=center;verticalAlign=middle;fontStyle=1;fontSize=13;fontFamily=Arial;" vertex="1" parent="1"><mxGeometry x="200" y="10" width="400" height="20" as="geometry" /></mxCell>' +
  '<mxCell id="lane_admin" value="Quản trị viên (Admin)" style="swimlane;whiteSpace=wrap;html=1;startSize=25;fontFamily=Arial;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="40" y="40" width="320" height="700" as="geometry" /></mxCell>' +
  '<mxCell id="lane_sys" value="Hệ thống" style="swimlane;whiteSpace=wrap;html=1;startSize=25;fontFamily=Arial;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="360" y="40" width="380" height="700" as="geometry" /></mxCell>'
));

console.log('All 5 drawio files created successfully.');

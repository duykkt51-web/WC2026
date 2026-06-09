# Setup GitHub Pages + Google Sheets

## 1. Tạo Google Sheet

1. Tạo một Google Sheet mới, ví dụ `World Cup 2026 Prediction Room`.
2. Vào `Extensions` -> `Apps Script`.
3. Xóa nội dung mặc định trong `Code.gs`.
4. Copy toàn bộ nội dung file `google-apps-script/Code.gs` của dự án này vào Apps Script.
5. Bấm `Save`.

## 2. Deploy Apps Script

1. Trong Apps Script, bấm `Deploy` -> `New deployment`.
2. Chọn loại `Web app`.
3. Chọn:
   - `Execute as`: `Me`
   - `Who has access`: `Anyone`
4. Bấm `Deploy`.
5. Copy URL dạng:
   `https://script.google.com/macros/s/.../exec`

Lưu ý: URL này cho phép app ghi vào Google Sheet theo quyền của chủ file. Không chia sẻ URL này ra ngoài nhóm nếu không cần.

## 3. Kết nối trong app

1. Mở app `worldcup-prediction/index.html` sau khi deploy lên GitHub Pages.
2. Vào tab `Quản trị`.
3. Dán URL Web App Apps Script vào ô `URL Web App Apps Script`.
4. Bấm `Lưu cài đặt`.
5. Trạng thái trên góc phải sẽ chuyển sang `Đã kết nối Google Sheets`.

## 4. Deploy GitHub Pages

Đưa thư mục `worldcup-prediction` lên repository GitHub, rồi bật GitHub Pages:

1. Vào repo GitHub.
2. `Settings` -> `Pages`.
3. Chọn branch chứa code.
4. Chọn folder chứa app, hoặc để app ở root nếu muốn URL gọn hơn.

Các file cần có trên GitHub Pages:

- `index.html`
- `styles.css`
- `app.js`
- `data/matches.json`

## 5. Cách dùng

- Mỗi thành viên chọn tên mình ở góc phải.
- Tab `Dự đoán`: nhập tỉ số từng trận.
- Tab `Kết quả`: người quản lý nhập kết quả thật.
- Tab `BXH`: tự tính điểm và tiền.
- Tab `Tổng quan`: xem bảng chi phí 104 trận, phí 30.000/trận/người và hệ thống giải thưởng.
- Tab `Quản trị`: sửa danh sách thành viên, luật điểm, phí tham gia/trận, nhập kết quả và xem chi phí.

## 6. Luật điểm

Chỉ cộng điểm khi dự đoán đúng tỷ số.

- Vòng bảng: 1 điểm
- Vòng 1/16 và 1/8: 2 điểm
- Tứ kết: 3 điểm
- Bán kết: 4 điểm
- Chung kết: 5 điểm

Các trường hợp đoán sai tỷ số hoặc không dự đoán: 0 điểm.

Phí phải đóng:

- Mỗi lượt dự đoán tạm tính 30.000 VNĐ.
- Nếu thành viên đoán đúng tỷ số sau khi có kết quả, thành viên đó được miễn phí trận đó.
- Vì vậy tổng thu thực tế có thể thấp hơn tổng tối đa `104 trận × 30.000 VNĐ × 15 người`.

Toàn bộ dữ liệu chung nằm trong Google Sheet ở các tab:

- `Members`
- `Predictions`
- `AwardPredictions`
- `Results`
- `Settings`

Nếu đã deploy Apps Script trước đó, hãy copy lại file `google-apps-script/Code.gs`, bấm `Save`, rồi deploy `New version` để Google Sheets nhận cấu hình `matchFee = 30000`.

Khi thêm dự đoán giải thưởng, chạy lại hàm `setup()` hoặc mở app và bấm `Đồng bộ` sau khi deploy `Code.gs` mới để Apps Script tạo tab `AwardPredictions`.

Với danh sách mặc định 15 người, phí dự đoán toàn bộ 104 trận là:

`104 trận × 30.000 VNĐ × 15 người = 46.800.000 VNĐ`.

Trong bảng giải thưởng, app chỉ hiển thị các giải cố định:

- Nhà vô địch World Cup 2026: 1.000.000 VNĐ
- Quả bóng Vàng: 1.000.000 VNĐ
- Chiếc giày Vàng: 1.000.000 VNĐ
- Găng tay Vàng: 1.000.000 VNĐ
- Giải phong cách FIFA Fair Play Trophy: 1.000.000 VNĐ

Tổng giải cố định: 5.000.000 VNĐ.

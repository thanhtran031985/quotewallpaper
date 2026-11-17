# Kế hoạch thực hiện — 11-import-history

Nhập/xuất danh ngôn (JSON/CSV) và lịch sử hình nền (PRD D7, R8, R17).

## Mục tiêu
- Nạp hàng loạt danh ngôn từ tệp JSON hoặc CSV vào kho (hỗ trợ UTF-8, BOM, dấu phẩy trong ngoặc kép).
- Kiểm tra số câu hợp lệ, phát hiện câu trùng (R8) và câu sai định dạng trước khi nhập.
- Xuất sao lưu toàn bộ danh ngôn người dùng ra file JSON và chia sẻ qua iOS Share Sheet (expo-sharing).
- Xem lại lịch sử 50 hình nền gần nhất (R17), chạm để mở lại vào màn Xem trước; xử lý trường hợp ảnh hoặc câu đã bị xóa.

---

## Chi tiết các bước

### Bước 1 — Parser nhập danh ngôn (`src/services/quoteParser.ts`)
- Viết test trước trong `tests/unit/quoteParser.test.ts`:
  - Parse JSON hợp lệ: mảng đối tượng `{ text, author }`.
  - Parse CSV hợp lệ: header `text,author`, dấu phẩy trong ngoặc kép `"...",author`, xử lý UTF-8 BOM.
  - TC-LOG-01: phát hiện câu trùng lặp (với store hoặc trong chính file), câu quá 220 ký tự, câu rỗng.
  - Báo cáo chính xác: `validQuotes`, `duplicatesCount`, `invalidCount`.
- Hiện thực `src/services/quoteParser.ts`.

### Bước 2 — Màn hình Nhập & Xuất danh ngôn (`app/quote-import.tsx` & `src/services/quoteExport.ts`)
- Viết test trước trong `tests/components/QuoteImportExport.test.tsx`:
  - Chọn file qua DocumentPicker -> hiển thị bảng tóm tắt số câu hợp lệ/trùng/lỗi.
  - Bấm Nhập: thêm các câu hợp lệ vào kho `useLibraryStore` và quay lại.
  - Xuất sao lưu: gom danh ngôn thành file JSON và gọi `Sharing.shareAsync`.
  - Kết nối vào mục "Nhập / Sao lưu danh ngôn" trong Cài đặt (`app/(tabs)/settings.tsx`).

### Bước 3 — Màn hình Lịch sử hình nền (`app/history.tsx`)
- Viết test trước trong `tests/components/HistoryScreen.test.tsx`:
  - Hiển thị danh sách 50 lựa chọn gần nhất (R17).
  - Xử lý hiển thị "Mục không còn" khi ảnh/câu đã bị xóa khỏi kho.
  - Chạm vào mục lịch sử: mở lại tổ hợp đó trong màn Xem trước (`/preview`).
  - Nút "Xóa lịch sử": xóa sạch lịch sử sau khi xác nhận.
  - Kết nối vào mục "Lịch sử hình nền" trong Cài đặt (`app/(tabs)/settings.tsx`).
- Rà soát toàn bộ kiểm tra hồi quy: `npm run typecheck`, `npm run lint`, `npm test`, `npm run tasks-dashboard`.

---

## Tiêu chí nghiệm thu
- Nhập 500 câu < 3 giây, báo đúng số trùng/lỗi.
- Xem lại và khôi phục được lịch sử hình nền.
- Toàn bộ test suites pass, không lỗi TypeScript hay ESLint.

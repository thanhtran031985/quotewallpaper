# Kế hoạch thực hiện — 09-template-editor

Trình tạo/sửa template tự tạo (PRD D6).

## Mục tiêu
- Cho phép người dùng tùy biến và tạo mới template mang phong cách riêng.
- Canvas xem trước trực tiếp (≈ 55-60% chiều cao) có khung đồng hồ mờ.
- Kéo thả vị trí khối chữ trên màn hình và tự động chặn không cho rơi vào vùng đồng hồ (R13, TC-LOG-01).
- 5 tab công cụ trực quan: Chữ, Khối, Phủ, Ảnh, Khung với bảng 12 màu swatch + mã HEX tùy chọn.
- Hỗ trợ đổi tên template, Hoàn tác 1 bước, cảnh báo xác nhận khi thoát chưa lưu (TC-UI-02).
- Cập nhật tức thì vào kho template và sử dụng được ngay trong Random cũng như Cố định.

---

## Chi tiết các bước

### Bước 1 — Khung màn hình và điều hướng (`app/template-edit/[id].tsx`)
- Viết test trước trong `tests/components/TemplateEditorLayout.test.tsx`:
  - Khởi tạo màn hình với template có sẵn hoặc template mới.
  - Hiển thị Canvas xem trước và thanh 5 tab công cụ: Chữ, Khối, Phủ, Ảnh, Khung.
  - Nối điều hướng từ `app/(tabs)/templates.tsx` (bấm sửa template user hoặc bấm tạo template mới).
- Hiện thực khung giao diện `app/template-edit/[id].tsx`.

### Bước 2 — Kéo khối chữ và chặn vùng đồng hồ R13
- Viết test trước trong `tests/unit/templateEditorLayout.test.ts`:
  - Hàm `clampBoxPosition`: tính toán giới hạn vị trí `yPct`, tự động đẩy khối chữ ra khỏi vùng đồng hồ an toàn (TC-LOG-01).
- Tích hợp `PanResponder` trên canvas xem trước cho phép chạm kéo mượt mà, rung nhẹ (haptics) khi chạm biên hoặc bị chặn bởi vùng đồng hồ.

### Bước 3 — 5 tab công cụ
- Viết test trước trong `tests/components/TemplateEditorTools.test.tsx`:
  - Tab Chữ: cập nhật fontFamily, fontWeight, sizePct, align, color, shadow, uppercase, italic.
  - Tab Khối: cập nhật background (none, solid, blur, paper), backgroundColor, backgroundOpacity, radius, padding, widthPct, borderLeft.
  - Tab Phủ: cập nhật kiểu phủ (none, solid, gradient), màu phủ và độ mờ.
  - Tab Ảnh: cập nhật blur, brightness.
  - Tab Khung: bật/tắt viền khung, độ rộng và màu viền.
  - Bảng 12 màu swatch chuẩn và ô nhập mã HEX.
- Hiện thực các controls trong từng tab công cụ, xem trước cập nhật trực tiếp (TC-UI-01).

### Bước 4 — Lưu, Hoàn tác và Thoát an toàn
- Viết test trước trong `tests/components/TemplateEditorActions.test.tsx`:
  - Đổi tên template bằng modal/alert.
  - Nút "Hoàn tác": quay lại trạng thái style trước đó 1 bước.
  - Thoát khi đã chỉnh sửa nhưng chưa lưu: hiển thị hộp thoại xác nhận (TC-UI-02).
  - Bấm Lưu: validate dữ liệu và lưu vào `useLibraryStore`, quay lại tab Mẫu.
- Rà soát toàn bộ kiểm tra hồi quy: `npm run typecheck`, `npm run lint`, `npm test`, `npm run tasks-dashboard`.

---

## Tiêu chí nghiệm thu
- Tạo và sửa template hoạt động mượt mà, lưu vào store và dùng được ngay trong tab Hôm nay và Xem trước.
- Không thể kéo chữ vào vùng đồng hồ màn hình khóa (R13).
- Toàn bộ test suites pass, không lỗi TypeScript hay ESLint.

# 03-wallpaper-canvas — WallpaperCanvas, layout vùng đồng hồ, fitText, 8 template builtin

- Ngày tạo: 2026-11-16
- Giai đoạn: GĐ1
- Phụ thuộc: 01
- Nhánh git: feat/03-wallpaper-canvas

## Mục tiêu
- Một component render hình nền đúng mọi kích thước từ (ảnh, câu, template), kèm LockScreenOverlay tách riêng.

## Phạm vi
- `src/engine/layout.ts`: tính khung chữ theo % (R13 đẩy khỏi vùng đồng hồ).
- `src/engine/fitText.ts`: ước lượng số dòng/cỡ chữ (R14) — hàm thuần, dùng hệ số độ rộng ký tự theo font; trả `{ fontSize, lines, overflow }`.
- `WallpaperCanvas`: expo-image (contentFit cover + focalPoint), overlay (expo-linear-gradient), blur/brightness ảnh, khối chữ (BlurView cho kiểu blur), khung, tác giả.
- `LockScreenOverlay`: ngày, giờ, khung vùng đồng hồ (tùy chọn hiện).
- Đóng gói font (Serif, Sans, Rounded, Mono, Handwriting) có hỗ trợ tiếng Việt, qua expo-font — hỏi người dùng chọn font.
- Màn dev ẩn (`app/dev-canvas.tsx`, chỉ __DEV__) hiện 8 template cạnh nhau để so sánh.

## Ngoài phạm vi
- Xuất ảnh (task 08).

## Thiết kế
- designs/reference/prototype.html — Phần `.t-*` và lock overlay trong prototype.

## PRD liên quan
- docs/PRD.md mục C (R13, R14), E

## Các bước

### Bước 1 — layout + fitText
- Làm: Hàm thuần.
- Test viết trước: Test: khối chữ không giao vùng đồng hồ; câu 220 ký tự giảm cỡ; vượt min → overflow.
- Kiểm tra: `npm test`.

### Bước 2 — WallpaperCanvas + font
- Làm: Component + font.
- Test viết trước: Snapshot/render test cho 8 template; tác giả ẩn khi showAuthor=false.
- Kiểm tra: `npm test`.

### Bước 3 — LockScreenOverlay + màn dev
- Làm: Overlay, dev-canvas.
- Test viết trước: Test overlay không nằm trong view canvas (ref canvas không chứa overlay).
- Kiểm tra: `npm test`, người dùng xem trên iPhone.

## Chấp nhận khi
- [ ] 8 template hiển thị giống prototype về bố cục.
- [ ] Cùng một input render ở 3 kích thước cho cùng bố cục tương đối.
- [ ] Chữ tiếng Việt có dấu hiển thị đúng ở mọi font.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` xanh.

### Ảnh hưởng dữ liệu
- Không.

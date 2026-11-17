# 08-export-settings-mvp — Lưu vào Ảnh, Cài đặt, Sáng/Tối, hoàn thiện MVP

- Ngày tạo: 2026-11-16
- Giai đoạn: GĐ1
- Phụ thuộc: 04, 05, 06, 07
- Nhánh git: feat/08-export-settings-mvp

## Mục tiêu
- Lưu hình nền thật vào Ảnh (R15), màn Cài đặt (D7 phần MVP), chế độ giao diện; MVP dùng được hằng ngày.

## Phạm vi
- `services/exportWallpaper.ts`: render WallpaperCanvas ẩn ở kích thước pixel màn hình, chụp bằng react-native-view-shot (JPEG 0.92), lưu bằng expo-media-library vào Ảnh + album.
- Cảnh báo overflow (R14) trước khi lưu; toast thành công + sheet "Cách đặt hình nền" 3 bước.
- Cài đặt: nhóm Ngẫu nhiên, Giao diện, tên album, Giới thiệu, Đặt lại dữ liệu (xác nhận 2 lần).
- Rà soát 4 trạng thái mọi tab, accessibilityLabel, Sáng/Tối toàn app.

## Ngoài phạm vi
- Xuất hàng loạt, Phím tắt (task 10).

## Thiết kế
- designs/reference/prototype.html — Fullscreen + Cài đặt trong prototype.

## PRD liên quan
- docs/PRD.md mục D2, D7, C (R14, R15)

## Các bước

### Bước 1 — Export service
- Làm: exportWallpaper.
- Test viết trước: Test: kích thước = width×height×scale; view chụp không chứa overlay; lỗi quyền trả Result lỗi.
- Kiểm tra: `npm test`.

### Bước 2 — Nối nút Lưu + hướng dẫn
- Làm: Màn Xem trước.
- Test viết trước: Test luồng: overflow → hỏi xác nhận.
- Kiểm tra: `npm test`.

### Bước 3 — Cài đặt + giao diện
- Làm: Màn Cài đặt.
- Test viết trước: Test đổi appearance cập nhật theme; Đặt lại dữ liệu cần 2 lần xác nhận.
- Kiểm tra: `npm test`.

### Bước 4 — Rà soát MVP
- Làm: 4 trạng thái, a11y, Sáng/Tối.
- Test viết trước: —
- Kiểm tra: `npm run typecheck`, `npm run lint`, `npm test`, người dùng thử toàn luồng.

## Chấp nhận khi
- [ ] Ảnh lưu đúng độ phân giải màn hình, không có đồng hồ/khung.
- [ ] Ảnh nằm trong album "Quote Wallpaper".
- [ ] Đặt làm hình nền từ Ảnh hiển thị chữ không bị đồng hồ che.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` xanh.

### Ảnh hưởng dữ liệu
- Không (settings đã có từ task 01).

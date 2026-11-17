# 04-home-preview-ui — Tab Hôm nay và màn Xem trước

- Ngày tạo: 2026-11-16
- Giai đoạn: GĐ1
- Phụ thuộc: 02, 03
- Nhánh git: feat/04-home-preview-ui

## Mục tiêu
- Người dùng mở app thấy hình nền ngẫu nhiên, đổi ngẫu nhiên, ghim, xem toàn màn hình với khung màn hình khóa.

## Phạm vi
- Tab Hôm nay theo PRD D1 (thẻ, chip, hàng ghim, 2 nút, dòng thống kê, EmptyState R5).
- Màn Xem trước theo D2 (fullScreenModal, overlay bật/tắt, vuốt ngang đổi, thanh nút kính mờ). Nút Lưu tạm hiển thị toast "Sẽ có ở task 08" — chỉ nối khung.
- Haptic khi đổi; animation chuyển cross-fade ≤ 250ms, tôn trọng Reduce Motion.
- Component dùng chung: `GlassButton`, `Toast`, `EmptyState`, `Chip`.

## Ngoài phạm vi
- Lưu ảnh thật (task 08).

## Thiết kế
- designs/reference/prototype.html — Tab Hôm nay và fullscreen trong prototype.

## PRD liên quan
- docs/PRD.md mục D1, D2, C (R4, R5)

## Các bước

### Bước 1 — Component dùng chung
- Làm: GlassButton, Toast, EmptyState, Chip.
- Test viết trước: Test render + accessibilityLabel.
- Kiểm tra: `npm test`.

### Bước 2 — Tab Hôm nay
- Làm: Theo D1.
- Test viết trước: Test: bấm Đổi ngẫu nhiên gọi shuffle; kho trống hiện EmptyState đúng loại thiếu, nút điều hướng đúng tab.
- Kiểm tra: `npm test`.

### Bước 3 — Màn Xem trước
- Làm: Theo D2.
- Test viết trước: Test: ẩn/hiện overlay; đóng modal.
- Kiểm tra: `npm test`, ảnh chụp Sáng/Tối.

## Chấp nhận khi
- [ ] Mở app thấy hình nền ngay (≤ 1.5s).
- [ ] Ghim hoạt động trên UI.
- [ ] Không bị che bởi Dynamic Island/home indicator/tab bar.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` xanh.

### Ảnh hưởng dữ liệu
- Không.

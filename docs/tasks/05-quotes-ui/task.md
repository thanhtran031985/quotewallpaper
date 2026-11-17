# 05-quotes-ui — Tab Danh ngôn: danh sách, tìm kiếm, thêm/sửa, bật/tắt, yêu thích

- Ngày tạo: 2026-11-16
- Giai đoạn: GĐ1
- Phụ thuộc: 01
- Nhánh git: feat/05-quotes-ui

## Mục tiêu
- Quản lý danh ngôn theo PRD D3.

## Phạm vi
- Danh sách inset grouped (FlatList), tìm kiếm (không dấu cũng tìm được), segmented 4 bộ lọc.
- Sheet thêm/sửa (`app/quote-edit.tsx`): đếm ký tự, validate R8 inline.
- Vuốt trái: Yêu thích, Xóa (chỉ user, có xác nhận). Menu …: Bật tất cả, Tắt tất cả, Khôi phục mặc định.

## Ngoài phạm vi
- Nhập CSV/JSON (task 11).

## Thiết kế
- designs/reference/prototype.html — Tab Danh ngôn + sheet trong prototype.

## PRD liên quan
- docs/PRD.md mục D3, C (R8, R9)

## Các bước

### Bước 1 — Danh sách + lọc + tìm
- Làm: FlatList, segmented, search bỏ dấu.
- Test viết trước: Test lọc 4 chế độ; tìm "binh yen" ra "Bình yên…".
- Kiểm tra: `npm test`.

### Bước 2 — Sheet thêm/sửa
- Làm: quote-edit.
- Test viết trước: Test validate inline, nút Lưu disabled khi lỗi.
- Kiểm tra: `npm test`.

### Bước 3 — Vuốt + menu
- Làm: Swipeable, menu.
- Test viết trước: Test không có nút Xóa với câu default; Khôi phục mặc định.
- Kiểm tra: `npm test`, ảnh chụp Sáng/Tối.

## Chấp nhận khi
- [ ] 1.000 câu cuộn mượt.
- [ ] Thay đổi phản ánh ngay ở tab Hôm nay (thống kê).
- [ ] `npm run typecheck`, `npm run lint`, `npm test` xanh.

### Ảnh hưởng dữ liệu
- Không.

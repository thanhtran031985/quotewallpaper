# 07-templates-ui — Tab Mẫu: chế độ Cố định / Ngẫu nhiên, bật/tắt, nhân bản, xóa

- Ngày tạo: 2026-11-16
- Giai đoạn: GĐ1
- Phụ thuộc: 03
- Nhánh git: feat/07-templates-ui

## Mục tiêu
- Chọn template cố định hoặc tập template ngẫu nhiên theo PRD D5.

## Phạm vi
- Segmented Cố định/Ngẫu nhiên + chú thích; lưới 2 cột thẻ WallpaperCanvas thu nhỏ dùng ảnh+câu hiện tại.
- Cố định: chạm = chọn (pill Đang dùng). Ngẫu nhiên: chạm = bật/tắt (pill Bật), chặn R12.
- Nhấn giữ: Nhân bản (R11), Xóa (user, R11 chuyển fixed), Sửa (mở trình sửa — nối khung, trình sửa ở task 09).
- Hiệu năng: thẻ xem trước dùng ảnh thumbnail; memo hóa.

## Ngoài phạm vi
- Trình tạo/sửa template (task 09).

## Thiết kế
- designs/reference/prototype.html — Tab Mẫu trong prototype.

## PRD liên quan
- docs/PRD.md mục D5, C (R2, R11, R12)

## Các bước

### Bước 1 — Lưới + chế độ
- Làm: Segmented, lưới, pill.
- Test viết trước: Test đổi chế độ cập nhật settings; Cố định đổi current.templateId ngay.
- Kiểm tra: `npm test`.

### Bước 2 — Nhân bản / Xóa
- Làm: Menu ngữ cảnh.
- Test viết trước: Test nhân bản tạo bản user; xóa template đang cố định chuyển về builtin đầu.
- Kiểm tra: `npm test`, ảnh chụp Sáng/Tối.

## Chấp nhận khi
- [ ] Cố định: mọi lần đổi ngẫu nhiên đều cùng template.
- [ ] Lưới 8+ template cuộn mượt.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` xanh.

### Ảnh hưởng dữ liệu
- Không.

# 10-batch-export-shortcuts — Xuất hàng loạt vào album và hướng dẫn Phím tắt

- Ngày tạo: 2026-11-16
- Giai đoạn: GĐ2
- Phụ thuộc: 08
- Nhánh git: feat/10-batch-export-shortcuts

## Mục tiêu
- Xuất N hình ngẫu nhiên vào album để Phím tắt tự đổi hình nền mỗi ngày (R16).

## Phạm vi
- Cài đặt → Xuất hàng loạt: chọn N (5–50), tùy chọn xóa hình cũ của app trong album trước khi xuất (hỏi quyền xóa của iOS).
- Màn tiến độ: thanh tiến độ, Hủy, tổng kết thành công/lỗi.
- Màn Hướng dẫn Phím tắt: các bước có ảnh minh họa, nút mở app Phím tắt (`shortcuts://`).

## Ngoài phạm vi
- App Intents / tự đặt hình nền (không khả thi trong phạm vi Expo managed).

## Thiết kế
- designs/reference/prototype.html — Agent đề xuất theo HIG, chờ duyệt.

## PRD liên quan
- docs/PRD.md mục D7, C (R16)

## Các bước

### Bước 1 — Batch service
- Làm: Vòng lặp pick + render + lưu, hủy được.
- Test viết trước: Test: N lần pick theo noRepeat; lỗi 1 hình không dừng lô; hủy dừng đúng.
- Kiểm tra: `npm test`.

### Bước 2 — Màn tiến độ
- Làm: UI tiến độ.
- Test viết trước: Test hiển thị tổng kết.
- Kiểm tra: `npm test`.

### Bước 3 — Hướng dẫn Phím tắt
- Làm: Màn hướng dẫn.
- Test viết trước: —
- Kiểm tra: Người dùng tự tạo Tự động hóa và xác nhận hình nền đổi.

## Chấp nhận khi
- [ ] Album có đúng N hình mới.
- [ ] Làm theo hướng dẫn, hình nền tự đổi theo lịch.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` xanh.

### Ảnh hưởng dữ liệu
- Không.

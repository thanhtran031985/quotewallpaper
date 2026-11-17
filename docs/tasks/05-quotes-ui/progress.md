# Tiến độ — 05-quotes-ui

Trạng thái: 🔄

| Bước | Nội dung | Trạng thái | Ngày | Commit |
|---|---|---|---|---|
| 1 | Danh sách + lọc + tìm | ✅ | 2026-11-17 | feat(05): step 1 - quotes list, diacritics-insensitive search and filtering |
| 2 | Sheet thêm/sửa | ✅ | 2026-11-17 | feat(05): step 2 - quote-edit modal with inline validation |
| 3 | Vuốt + menu | ⬜ | | |

## Nhật ký
- 2026-11-17: Hoàn thành bước 1. Tạo hàm `matchesSearch` và `removeVietnameseDiacritics` hỗ trợ tìm kiếm không dấu (TC-LOG-01). Màn hình `app/(tabs)/quotes.tsx` hỗ trợ thanh tìm kiếm, 4 segmented tabs (Tất cả, Đang bật, Yêu thích, Tự tạo), danh sách inset grouped với toggle enabled, favorite và xóa danh ngôn người dùng.
- 2026-11-17: Hoàn thành bước 2. Đăng ký màn hình modal `quote-edit` trong `app/_layout.tsx`. Hiện thực `app/quote-edit.tsx` với giao diện sheet Apple HIG, đếm số ký tự (1-220 cho nội dung, ≤60 cho tác giả), validate inline chặn nội dung trùng lặp và chặn nội dung >220 ký tự (TC-UI-01).

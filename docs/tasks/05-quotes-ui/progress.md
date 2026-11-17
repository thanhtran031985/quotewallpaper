# Tiến độ — 05-quotes-ui

Trạng thái: 🔄

| Bước | Nội dung | Trạng thái | Ngày | Commit |
|---|---|---|---|---|
| 1 | Danh sách + lọc + tìm | ✅ | 2026-11-17 | feat(05): step 1 - quotes list, diacritics-insensitive search and filtering |
| 2 | Sheet thêm/sửa | ⬜ | | |
| 3 | Vuốt + menu | ⬜ | | |

## Nhật ký
- 2026-11-17: Hoàn thành bước 1. Tạo hàm `matchesSearch` và `removeVietnameseDiacritics` hỗ trợ tìm kiếm không dấu (TC-LOG-01). Màn hình `app/(tabs)/quotes.tsx` hỗ trợ thanh tìm kiếm, 4 segmented tabs (Tất cả, Đang bật, Yêu thích, Tự tạo), danh sách inset grouped với toggle enabled, favorite và xóa danh ngôn người dùng.

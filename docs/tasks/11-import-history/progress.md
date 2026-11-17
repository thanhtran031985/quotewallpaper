# Tiến độ — 11-import-history

Trạng thái: 🔄

| Bước | Nội dung | Trạng thái | Ngày | Commit |
|---|---|---|---|---|
| 1 | Parser nhập | ✅ | 2026-11-17 | feat(11): step 1 — parser JSON/CSV danh ngôn |
| 2 | UI nhập/xuất | ✅ | 2026-11-17 | feat(11): step 2 — UI nhập và sao lưu danh ngôn |
| 3 | Lịch sử | 🔄 | 2026-11-17 | |

## Nhật ký
- 2026-11-17: Khởi tạo nhánh `feat/11-import-history`, duyệt `plan.md`. Bắt đầu bước 1: `src/services/quoteParser.ts`.
- 2026-11-17: Hoàn thành bước 1. Cài đặt `quoteParser.ts`, test 5/5 passed (parse JSON, CSV có ngoặc kép/BOM, loại bỏ trùng lặp và không hợp lệ).
- 2026-11-17: Hoàn thành bước 2. Cài đặt `quoteExport.ts`, màn hình `quote-import.tsx` với DocumentPicker và tóm tắt thống kê, tích hợp xuất/nhập vào màn hình Settings, test 2/2 passed.

# Tiến độ — 01-domain-store-seed

Trạng thái: 🔄

| Bước | Nội dung | Trạng thái | Ngày | Commit |
|---|---|---|---|---|
| 1 | Kiểu dữ liệu và validate | ✅ | 2026-11-17 | 0b16733 |
| 2 | Store và action | ✅ | 2026-11-17 | 5ece0c5 |
| 3 | Seed và template builtin | ✅ | 2026-11-17 | Pending |
| 4 | Theme tokens và dữ liệu hỏng | ⬜ | | |

## Nhật ký
- 2026-11-17: Hoàn thành Bước 1. Định nghĩa `src/domain/types.ts` và bộ validate trong `src/domain/validate.ts` (R8, TC-LOG-01, TC-LOG-02). Viết test `validate.test.ts` pass 100%.
- 2026-11-17: Hoàn thành Bước 2. Xây dựng `useLibraryStore` và `useSettingsStore` (Zustand + AsyncStorage persist version 1) cùng toàn bộ action CRUD tuân thủ R8, R9, R11, R12 (TC-LOG-03, TC-LOG-04, TC-LOG-05). Test `storeActions.test.ts` pass 100%.
- 2026-11-17: Hoàn thành Bước 3. Khởi tạo 50 danh ngôn mặc định tiếng Việt (`quotes.default.json`), 8 template builtin (`builtin.ts`), 12 ảnh mặc định (`seed.ts`, `CREDITS.md`). Test seed idempotent và khôi phục mặc định pass 100% (TC-LOG-06).

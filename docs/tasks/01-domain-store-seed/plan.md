# Kế hoạch thực hiện: Task 01 — 01-domain-store-seed

- **Mục tiêu:** Định nghĩa toàn bộ kiểu dữ liệu domain, Zustand store persist có version + migrate, dữ liệu mặc định (50 câu danh ngôn, 12 ảnh, 8 template builtin), theme tokens và xử lý chống crash khi dữ liệu lưu trữ bị hỏng.
- **Nhánh git:** feat/01-domain-store-seed

---

### Bước 1 — Kiểu dữ liệu và validate
- **Mô tả:** Định nghĩa `src/domain/types.ts` và bộ hàm validation trong `src/domain/validate.ts`.
- **File tạo/sửa:**
  - `src/domain/types.ts`
  - `src/domain/validate.ts`
  - `tests/unit/validate.test.ts`
- **Test viết trước:** `tests/unit/validate.test.ts` (kiểm tra độ dài quote, chuẩn hóa khoảng trắng, chặn trùng nội dung, validate template/settings schema).
- **Lệnh kiểm tra:** `npm test`.

---

### Bước 2 — Store và action
- **Mô tả:** Cài đặt `zustand` và `@react-native-async-storage/async-storage`, xây dựng `useLibraryStore` và `useSettingsStore` có middleware `persist` (version 1) cùng các action CRUD tuân thủ quy tắc nghiệp vụ R8, R9, R11, R12.
- **File tạo/sửa:**
  - `src/store/migrations.ts`
  - `src/store/useLibraryStore.ts`
  - `src/store/useSettingsStore.ts`
  - `tests/unit/storeActions.test.ts`
- **Test viết trước:** `tests/unit/storeActions.test.ts` (kiểm tra từ chối quote sai độ dài TC-LOG-01, chặn trùng TC-LOG-02, chặn xóa quote mặc định TC-LOG-03, chặn xóa builtin template TC-LOG-04, chặn xóa template bật cuối cùng TC-LOG-05).
- **Lệnh kiểm tra:** `npm test`.

---

### Bước 3 — Seed và template builtin
- **Mô tả:** 
  - Tạo `data/quotes.default.json` (50 danh ngôn tiếng Việt tinh hoa, có nguồn tác giả).
  - Khai báo 8 template builtin trong `src/templates/builtin.ts` theo PRD mục E.
  - Khai báo 12 ảnh mặc định trong `assets/images/defaults/CREDITS.md` và service seed.
  - Viết `src/services/seed.ts` nạp dữ liệu lần đầu idempotent và khôi phục mặc định.
- **File tạo/sửa:**
  - `data/quotes.default.json`
  - `src/templates/builtin.ts`
  - `assets/images/defaults/CREDITS.md`
  - `src/services/seed.ts`
  - `tests/unit/seed.test.ts`
- **Test viết trước:** `tests/unit/seed.test.ts` (kiểm tra seed idempotent chạy 2 lần không trùng TC-LOG-06, khôi phục mặc định bù lại mục thiếu).
- **Lệnh kiểm tra:** `npm test`.

---

### Bước 4 — Theme tokens và dữ liệu hỏng
- **Mô tả:** 
  - Khai báo bảng màu iOS HIG tokens trong `src/theme/tokens.ts` (light/dark, spacing, typography).
  - Hook `src/theme/useTheme.ts` tính toán theme theo setting appearance và colorScheme hệ thống.
  - Xử lý dữ liệu hỏng: nếu dữ liệu AsyncStorage không hợp lệ, lưu bản sao lưu sang `backup_corrupt_<timestamp>`, khôi phục về mặc định an toàn.
- **File tạo/sửa:**
  - `src/theme/tokens.ts`
  - `src/theme/useTheme.ts`
  - `src/services/storageCorruption.ts`
  - `tests/unit/themeAndCorruption.test.ts`
- **Test viết trước:** `tests/unit/themeAndCorruption.test.ts` (test đổi theme, test recovery khi storage hỏng TC-LOG-07).
- **Lệnh kiểm tra:** `npm test`, `npm run typecheck`, `npm run lint`.

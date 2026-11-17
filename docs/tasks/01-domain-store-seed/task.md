# 01-domain-store-seed — Kiểu dữ liệu, store persist, dữ liệu mặc định, theme tokens

- Ngày tạo: 2026-11-16
- Giai đoạn: GĐ0
- Phụ thuộc: 00
- Nhánh git: feat/01-domain-store-seed

## Mục tiêu
- Có toàn bộ kiểu dữ liệu, store zustand persist có version + migrate, và dữ liệu mặc định (danh ngôn, ảnh, 8 template builtin).
- Có theme tokens Sáng/Tối.

## Phạm vi
- `src/domain/types.ts` đúng PRD mục B; `validate.ts` kiểm tra dữ liệu đọc từ storage.
- `useLibraryStore` (quotes, images, templates, current, pinned, history) và `useSettingsStore` — persist AsyncStorage, `version: 1`, khung `migrations.ts`.
- Action CRUD cơ bản: add/update/remove/toggle cho quote, image, template; tuân thủ R8, R9, R11, R12.
- `services/seed.ts`: lần chạy đầu nạp `data/quotes.default.json`, ảnh mặc định, template builtin (`src/templates/builtin.ts`, 8 template PRD mục E). Idempotent.
- `src/theme/tokens.ts` (light/dark) + `useTheme()` theo `settings.appearance`.
- Dữ liệu hỏng: validate fail → khôi phục mặc định, giữ bản hỏng trong key `backup_corrupt_<ts>`, đặt cờ để UI báo.

## Ngoài phạm vi
- Giao diện danh sách (task 05–07).
- Chọn ảnh từ Photos (task 06).

## Thiết kế
- designs/reference/prototype.html — —

## PRD liên quan
- docs/PRD.md mục B, C (R8, R9, R11, R12), E, F

## Các bước

### Bước 1 — Kiểu dữ liệu và validate
- Làm: types.ts, validate.ts.
- Test viết trước: Test validate: dữ liệu hợp lệ pass; thiếu trường/sai kiểu fail với lý do.
- Kiểm tra: `npm test`.

### Bước 2 — Store và action
- Làm: Hai store + action, persist version 1.
- Test viết trước: Test R8 (độ dài, trùng), R9 (không xóa default), R11, R12.
- Kiểm tra: `npm test`.

### Bước 3 — Seed và template builtin
- Làm: seed.ts, builtin.ts, quotes.default.json (hỏi người dùng danh sách hoặc đề xuất 50 câu để duyệt), ảnh mặc định (người dùng cung cấp).
- Test viết trước: Test seed idempotent: chạy 2 lần không nhân đôi; Khôi phục mặc định thêm lại mục thiếu.
- Kiểm tra: `npm test`.

### Bước 4 — Theme tokens và dữ liệu hỏng
- Làm: tokens.ts, useTheme, xử lý dữ liệu hỏng.
- Test viết trước: Test useTheme theo appearance; test dữ liệu hỏng → reset + backup.
- Kiểm tra: `npm test`, `npm run typecheck`.

## Chấp nhận khi
- [ ] Lần mở đầu có 50 danh ngôn, 12 ảnh, 8 template.
- [ ] Mở lại app giữ nguyên dữ liệu đã đổi.
- [ ] Dữ liệu hỏng không crash.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` xanh.

### Ảnh hưởng dữ liệu
- Tạo store version 1.

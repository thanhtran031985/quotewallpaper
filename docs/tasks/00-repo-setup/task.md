# 00-repo-setup — Khung dự án Expo + TypeScript, lint, test, tasks-dashboard

- Ngày tạo: 2026-11-16
- Giai đoạn: GĐ0
- Phụ thuộc: —
- Nhánh git: feat/00-repo-setup

## Mục tiêu
- Tạo dự án Expo (expo-router, TypeScript strict) chạy được trên iPhone qua Expo Go.
- Thiết lập ESLint, Prettier, Jest (jest-expo), script npm và script sinh dashboard task.

## Phạm vi
- Khởi tạo bằng `npx create-expo-app@latest` template tabs/TypeScript, dọn code mẫu.
- Cấu trúc thư mục theo AGENTS.md (app/, src/domain, src/engine, src/store, src/services, src/components, src/templates, src/theme, tests/).
- Script npm: test, test:watch, typecheck, lint, format, tasks-dashboard.
- `scripts/tasks-dashboard.mjs` đọc bảng docs/tasks/README.md, sinh docs/tasks/dashboard.html (tiến độ theo GĐ, bảng task, màu trạng thái kèm chữ).
- `app.json`: tên Quote Wallpaper, bundleIdentifier (hỏi người dùng), chỉ iPhone (`supportsTablet: false`), orientation portrait, userInterfaceStyle automatic, chuỗi quyền Ảnh tiếng Việt.
- 5 tab rỗng đúng thứ tự và nhãn (Hôm nay, Danh ngôn, Ảnh, Mẫu, Cài đặt).

## Ngoài phạm vi
- Store, theme chi tiết, nghiệp vụ (task 01+).

## Thiết kế
- designs/reference/prototype.html — Thứ tự tab và nhãn trong prototype.

## PRD liên quan
- docs/PRD.md mục A, G

## Các bước

### Bước 1 — Khởi tạo dự án và cấu trúc thư mục
- Làm: Tạo dự án, dọn mẫu, tạo thư mục, tsconfig strict + alias `@/` → src.
- Test viết trước: Test khói: render root layout không lỗi.
- Kiểm tra: `npm test`, `npm run typecheck`.

### Bước 2 — Lint, format, script npm
- Làm: ESLint (eslint-config-expo) + Prettier, script npm.
- Test viết trước: —
- Kiểm tra: `npm run lint`, `npx expo-doctor`.

### Bước 3 — Tasks dashboard
- Làm: Viết scripts/tasks-dashboard.mjs (Node thuần, không package ngoài).
- Test viết trước: Test parse bảng README: đếm đúng số task theo trạng thái.
- Kiểm tra: `npm test`, `npm run tasks-dashboard` sinh file.

### Bước 4 — Tab rỗng + chạy trên iPhone
- Làm: 5 tab với Large Title, icon Ionicons.
- Test viết trước: Test render tab bar có đủ 5 nhãn.
- Kiểm tra: `npx expo start`, người dùng quét QR.

## Chấp nhận khi
- [ ] Mở được app trong Expo Go trên iPhone, thấy 5 tab đúng thứ tự.
- [ ] `npm run tasks-dashboard` sinh docs/tasks/dashboard.html.
- [ ] `npx expo-doctor` không lỗi.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` xanh.

### Ảnh hưởng dữ liệu
- Không.

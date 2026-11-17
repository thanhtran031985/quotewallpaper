# Tiến độ — 00-repo-setup

Trạng thái: 🔄

| Bước | Nội dung | Trạng thái | Ngày | Commit |
|---|---|---|---|---|
| 1 | Khởi tạo dự án và cấu trúc thư mục | ✅ | 2026-11-17 | 69507b3 |
| 2 | Lint, format, script npm | ✅ | 2026-11-17 | 85a9ccf |
| 3 | Tasks dashboard | ✅ | 2026-11-17 | 8716afd |
| 4 | Tab rỗng + chạy trên iPhone | ✅ | 2026-11-17 | b04e4dc |

## Nhật ký
- 2026-11-17: Hoàn thành Bước 1. Khởi tạo cấu trúc dự án Expo Router, app.json, tsconfig.json (paths `@/*`), package.json. Viết test `RootLayout.test.tsx`. `npm test` và `npm run typecheck` đều pass.
- 2026-11-17: Hoàn thành Bước 2. Cấu hình ESLint (.eslintrc.js), Prettier (.prettierrc, .prettierignore). `npm run lint`, `npm run format`, `npm run typecheck` và `npm test` đều xanh 100%.
- 2026-11-17: Hoàn thành Bước 3. Viết script `scripts/tasks-dashboard.mjs` sinh `docs/tasks/dashboard.html`. Test `tasksDashboard.test.ts` pass, checklist TC-LOG-01 đạt.
- 2026-11-17: Hoàn thành Bước 4. Tạo 5 tab rỗng (Hôm nay, Danh ngôn, Ảnh, Mẫu, Cài đặt) với icon Ionicons và hỗ trợ Sáng/Tối. Viết test `TabBar.test.tsx` pass 100%, checklist TC-UI-01 đạt.

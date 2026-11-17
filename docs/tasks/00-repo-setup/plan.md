# Kế hoạch thực hiện: Task 00 — 00-repo-setup

- **Mục tiêu:** Dựng khung dự án Expo (Expo Router + TypeScript strict), lint, format, test Jest, script dashboard task và 5 tab rỗng chạy được trên iPhone qua Expo Go.
- **Nhánh git dự kiến:** `feat/00-repo-setup`

---

### Bước 1 — Khởi tạo dự án và cấu trúc thư mục
- **Mô tả:** Khởi tạo Expo app với Expo Router, thiết lập `tsconfig.json` (strict: true, alias `@/*` trỏ về `src/*`), cấu hình `app.json` (tên Quote Wallpaper, portrait, supportsTablet: false, các chuỗi quyền Thư viện ảnh tiếng Việt), tạo cây thư mục chuẩn theo `AGENTS.md`.
- **File tạo/sửa:**
  - `package.json`, `app.json`, `tsconfig.json`
  - `app/_layout.tsx`
  - Thư mục: `src/domain/`, `src/engine/`, `src/store/`, `src/services/`, `src/components/`, `src/templates/`, `src/theme/`, `tests/unit/`, `tests/components/`
- **Test viết trước:** `tests/components/RootLayout.test.tsx` (kiểm tra render root layout không gây crash).
- **Lệnh kiểm tra:** `npm test`, `npm run typecheck`.
- **Rủi ro:** Cấu trúc khởi tạo có thể sinh các file mẫu thừa — cần dọn dẹp để đúng chuẩn cấu trúc dự án.

---

### Bước 2 — Lint, format và script npm
- **Mô tả:** Cài đặt và cấu hình ESLint (`eslint-config-expo`), Prettier; khai báo các npm scripts: `test`, `test:watch`, `typecheck`, `lint`, `format`, `tasks-dashboard`.
- **File tạo/sửa:**
  - `.eslintrc.js` (hoặc `eslint.config.js`)
  - `.prettierrc`
  - `package.json`
- **Test viết trước:** Không có (bước cấu hình tooling).
- **Lệnh kiểm tra:** `npm run lint`, `npm run format`, `npx expo-doctor`.
- **Rủi ro:** Xung đột phiên bản giữa eslint-config-expo và eslint mới; sẽ dùng đúng phiên bản do Expo khuyến nghị (`npx expo install`).

---

### Bước 3 — Tasks dashboard
- **Mô tả:** Viết script `scripts/tasks-dashboard.mjs` bằng Node.js thuần (không dùng package ngoài). Script đọc bảng markdown trong `docs/tasks/README.md`, bóc tách trạng thái các task theo 4 giai đoạn (GĐ0–GĐ3) và sinh ra `docs/tasks/dashboard.html` tự chứa CSS, có màu sắc kèm nhãn chữ trực quan.
- **File tạo/sửa:**
  - `scripts/tasks-dashboard.mjs`
  - `tests/unit/tasksDashboard.test.ts`
- **Test viết trước:** `tests/unit/tasksDashboard.test.ts` (test hàm parse bảng README: đếm đúng tổng số task, thống kê đúng số task theo từng trạng thái ⬜, 🔄, ✅).
- **Lệnh kiểm tra:** `npm test`, `npm run tasks-dashboard` (kiểm tra sinh ra file `docs/tasks/dashboard.html`).
- **Rủi ro:** Định dạng markdown bảng thay đổi làm lệch parser regex — viết regex linh hoạt theo định dạng bảng chuẩn GitHub Flavored Markdown.

---

### Bước 4 — 5 Tab rỗng & chạy thử trên iPhone
- **Mô tả:** Cấu hình `app/(tabs)/_layout.tsx` với 5 tab đúng thứ tự và nhãn: **Hôm nay**, **Danh ngôn**, **Ảnh**, **Mẫu**, **Cài đặt** (dùng icon Ionicons từ `@expo/vector-icons`). Các màn hình tab render tiêu đề Large Title theo HIG.
- **File tạo/sửa:**
  - `app/(tabs)/_layout.tsx`
  - `app/(tabs)/index.tsx` (Hôm nay)
  - `app/(tabs)/quotes.tsx` (Danh ngôn)
  - `app/(tabs)/images.tsx` (Ảnh)
  - `app/(tabs)/templates.tsx` (Mẫu)
  - `app/(tabs)/settings.tsx` (Cài đặt)
  - `tests/components/TabBar.test.tsx`
- **Test viết trước:** `tests/components/TabBar.test.tsx` (kiểm tra tab bar render đủ 5 tab đúng tên nhãn).
- **Lệnh kiểm tra:** `npm test`, `npm run typecheck`, `npx expo-doctor`.
- **Người dùng kiểm tra trên iPhone:**
  - Chạy `npx expo start` và dùng camera iPhone quét mã QR mở trên **Expo Go**.
  - Kiểm tra giao diện hiển thị 5 tab, bấm chuyển qua lại giữa các tab mượt mà.
  - Chuyển chế độ iPhone sang Giao diện Tối để kiểm tra giao diện tự đổi theo hệ thống.

# Kế hoạch thực hiện: Task 03 — 03-wallpaper-canvas

- **Mục tiêu:** Xây dựng module render hình nền `WallpaperCanvas` theo đúng các thông số của Template và tỉ lệ màn hình, hàm thuần `layout.ts` (đẩy khỏi vùng đồng hồ R13), hàm thuần `fitText.ts` (thu nhỏ cỡ chữ / phát hiện overflow R14), component `LockScreenOverlay` và màn dev đối chiếu 8 mẫu builtin.
- **Nhánh git:** feat/03-wallpaper-canvas

---

### Bước 1 — layout + fitText (Hàm thuần)
- **Mô tả:**
  - `src/engine/layout.ts`:
    - Định nghĩa vùng an toàn đồng hồ iOS (`CLOCK_ZONE`: top 8% đến 32% chiều cao màn hình).
    - Hàm `resolveBoxLayout(box, containerWidth, containerHeight)`: chuyển đổi các thông số `%` thành tọa độ pixel thực tế; nếu hộp giao vùng đồng hồ thì tự động đẩy xuống dưới vùng đồng hồ (R13).
  - `src/engine/fitText.ts`:
    - Hàm `fitText(text, options)`: dựa trên kích thước khung chứa và hệ số font, ước lượng số dòng và tự động giảm cỡ chữ từ `baseFontSize` về `minFontSize` (R14).
    - Nếu câu quá dài (ví dụ 220 ký tự) vượt quá chiều cao tối đa ở cỡ `minFontSize`, trả về `{ fontSize: minFontSize, lines, overflow: true, truncatedText }`.
- **File tạo/sửa:**
  - `src/engine/layout.ts`
  - `src/engine/fitText.ts`
  - `tests/unit/layoutAndFitText.test.ts`
- **Test viết trước:** `tests/unit/layoutAndFitText.test.ts` (TC-LOG-01, TC-LOG-02).
- **Lệnh kiểm tra:** `npm test`.

---

### Bước 2 — WallpaperCanvas + font
- **Mô tả:**
  - Cài đặt các thư viện thuộc Stack: `expo-image`, `expo-blur`, `expo-linear-gradient`.
  - Cấu hình font cho 5 nhóm (Serif, Sans, Rounded, Mono, Handwriting) hỗ trợ đầy đủ tiếng Việt.
  - Xây dựng component `src/components/WallpaperCanvas.tsx`:
    - Nền ảnh: `expo-image` với `contentFit="cover"` và dịch chuyển theo `focalPoint` (0..1).
    - Bộ lọc ảnh: `blur`, `brightness`.
    - Phủ màu/Gradient: `expo-linear-gradient` hoặc màu đặc.
    - Hộp văn bản: hỗ trợ `solid`, `blur` (BlurView từ `expo-blur`), `paper`, `none`.
    - Văn bản danh ngôn và tác giả: hiển thị đúng font, màu, bóng đổ, căn lề, tự động ẩn tác giả nếu `showAuthor = false` hoặc `template.style.author.show = false`.
    - Khung viền (frame).
- **File tạo/sửa:**
  - `src/components/WallpaperCanvas.tsx`
  - `tests/components/WallpaperCanvas.test.tsx`
- **Test viết trước:** `tests/components/WallpaperCanvas.test.tsx` (kiểm tra render 8 template builtin, ẩn tác giả khi showAuthor=false).
- **Lệnh kiểm tra:** `npm test`.

---

### Bước 3 — LockScreenOverlay + màn dev
- **Mô tả:**
  - `src/components/LockScreenOverlay.tsx`: hiển thị ngày giờ màn hình khóa và tùy chọn khung đứt đoạn vùng đồng hồ. Tách rời hoàn toàn khỏi `WallpaperCanvas` để không bị chụp khi export.
  - `app/dev-canvas.tsx`: màn hình dev (chỉ hiển thị trong `__DEV__`) liệt kê 8 mẫu template mẫu với ảnh và câu danh ngôn đối chiếu.
- **File tạo/sửa:**
  - `src/components/LockScreenOverlay.tsx`
  - `app/dev-canvas.tsx`
  - `tests/components/LockScreenOverlay.test.tsx`
- **Test viết trước:** `tests/components/LockScreenOverlay.test.tsx`.
- **Lệnh kiểm tra:** `npm test`, `npm run typecheck`, `npm run lint`.

# Kế hoạch thực hiện: Task 04 — 04-home-preview-ui

- **Mục tiêu:** Xây dựng màn hình Tab Hôm nay (PRD D1) và màn hình Xem trước toàn màn hình (PRD D2), hỗ trợ ghim từng thành phần, đổi ngẫu nhiên có rung haptic, xử lý trạng thái kho trống (EmptyState), thanh điều khiển kính mờ và toast thông báo.
- **Nhánh git:** feat/04-home-preview-ui

---

### Bước 1 — Component dùng chung
- **Mô tả:**
  - Cài đặt `expo-haptics`.
  - Xây dựng các component dùng chung theo chuẩn Apple HIG:
    - `src/components/GlassButton.tsx`: nút bấm hiệu ứng kính mờ (Liquid glass, blur, viền mỏng, vùng chạm ≥ 44pt).
    - `src/components/Toast.tsx`: thông báo nổi tạm thời, tự động ẩn sau 2.5s.
    - `src/components/EmptyState.tsx`: giao diện khi kho trống, chỉ rõ loại thiếu kèm nút chuyển tab (R5).
    - `src/components/Chip.tsx`: nhãn nhỏ (pill) trong suốt, hỗ trợ trạng thái active / pinned.
- **File tạo/sửa:**
  - `src/components/GlassButton.tsx`
  - `src/components/Toast.tsx`
  - `src/components/EmptyState.tsx`
  - `src/components/Chip.tsx`
  - `tests/components/CommonComponents.test.tsx`
- **Test viết trước:** `tests/components/CommonComponents.test.tsx`.
- **Lệnh kiểm tra:** `npm test`.

---

### Bước 2 — Tab Hôm nay
- **Mô tả:**
  - Xây dựng `app/(tabs)/index.tsx`:
    - Tự động shuffle khi mở app qua `useShuffleOnOpen()`.
    - Thẻ Hero (tỉ lệ màn hình, bo góc 24pt, đổ bóng) chứa `WallpaperCanvas`.
    - Chip hiển thị tên mẫu template đang chọn.
    - Thanh ghim (Pin bar) gồm 3 nút: ẢNH, CÂU, MẪU (R4); đổi màu accent khi ghim.
    - 2 nút hành động: "Đổi ngẫu nhiên" (có rung haptic) và "Xem & lưu" (mở `/preview`).
    - Dòng thống kê số tổ hợp (`calculateCombinationsCount`).
    - Hiển thị `EmptyState` khi kho thiếu ảnh/câu/template kèm nút chuyển tab tương ứng.
- **File tạo/sửa:**
  - `app/(tabs)/index.tsx`
  - `tests/components/HomeScreen.test.tsx`
- **Test viết trước:** `tests/components/HomeScreen.test.tsx` (TC-UI-01, TC-UI-02, TC-UI-03, TC-UI-04).
- **Lệnh kiểm tra:** `npm test`.

---

### Bước 3 — Màn Xem trước
- **Mô tả:**
  - Xây dựng `app/preview.tsx` (fullScreenModal):
    - Hiển thị hình nền toàn màn hình với `WallpaperCanvas`.
    - `LockScreenOverlay`: hiển thị ngày giờ, hỗ trợ bật/tắt khung viền vùng đồng hồ.
    - Chạm vào màn hình để ẩn/hiện thanh điều khiển.
    - Thanh điều khiển kính mờ đáy màn hình (`GlassButton`): Đóng, Đổi ngẫu nhiên, Bật/tắt đồng hồ, Lưu ảnh (bấm lưu hiện Toast "Tính năng lưu vào Ảnh sẽ có ở Task 08").
- **File tạo/sửa:**
  - `app/preview.tsx`
  - `app/_layout.tsx`
  - `tests/components/PreviewScreen.test.tsx`
- **Test viết trước:** `tests/components/PreviewScreen.test.tsx` (TC-IOS-01).
- **Lệnh kiểm tra:** `npm test`, `npm run typecheck`, `npm run lint`.

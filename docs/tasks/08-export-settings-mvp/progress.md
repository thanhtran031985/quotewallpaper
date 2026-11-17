# Tiến độ — 08-export-settings-mvp

Trạng thái: ✅

| Bước | Nội dung | Trạng thái | Ngày | Commit |
|---|---|---|---|---|
| 1 | Export service | ✅ | 2026-11-17 | feat(08): step 1 - exportWallpaper service with media library and pixel scaling |
| 2 | Nối nút Lưu + hướng dẫn | ✅ | 2026-11-17 | feat(08): step 2 - save wallpaper button, overflow confirmation alert, and iOS wallpaper setup guide |
| 3 | Cài đặt + giao diện | ✅ | 2026-11-17 | feat(08): step 3 - settings screen, theme appearance picker, and double confirmation data reset |
| 4 | Rà soát MVP | ✅ | 2026-11-17 | feat(08): step 4 - close task 08 and complete MVP review |

## Nhật ký
- 2026-11-17: Khởi tạo nhánh `feat/08-export-settings-mvp`. Cài đặt `react-native-view-shot` và `expo-media-library`.
- 2026-11-17: Hoàn thành bước 1. Hiện thực `src/services/exportWallpaper.ts` với hàm tính kích thước chuẩn pixel màn hình (`width × height × scale` - TC-LOG-01) và hàm chụp `captureAndSaveWallpaper` lưu ảnh chất lượng JPEG 0.92 vào thư viện Ảnh và album "Quote Wallpaper".
- 2026-11-17: Hoàn thành bước 2. Tích hợp canvas xuất ẩn không chứa lockscreen overlay/buttons, xử lý kiểm tra overflow R14 và hiển thị Alert cảnh báo rút gọn văn bản (TC-UI-01), hiển thị sheet 3 bước hướng dẫn cài hình nền iOS khi lưu thành công.
- 2026-11-17: Hoàn thành bước 3. Hiện thực `app/(tabs)/settings.tsx` theo chuẩn Apple Inset Grouped: tùy chọn Ngẫu nhiên (4 công tắc), Giao diện (Hệ thống / Sáng / Tối với cập nhật theme tức thì), Tên album, Đặt lại toàn bộ dữ liệu với 2 lần xác nhận an toàn, thông tin phiên bản và quyền riêng tư 100% on-device. Thêm `haptics.selection()` trong `src/services/haptics.ts`.
- 2026-11-17: Hoàn thành bước 4. Rà soát toàn bộ MVP, chuyển các lệnh gọi Expo Media Library sang module `expo-media-library/legacy`, thiết lập `testTimeout: 15000` cho Jest. Toàn bộ 27/27 test suites với 132 tests pass 100%, typecheck và eslint sạch 0 lỗi, hoàn thành Giai đoạn 1 (MVP).

# Kế hoạch thực hiện — 08-export-settings-mvp

Lưu vào Ảnh, Cài đặt, Sáng/Tối, hoàn thiện MVP.

## Mục tiêu
- Lưu hình nền thực tế vào thư viện Ảnh của iPhone và album "Quote Wallpaper" (R15).
- Đảm bảo độ phân giải đúng bằng pixel màn hình (`width × height × scale`), không chứa đồng hồ hay khung đè (TC-LOG-01).
- Cảnh báo người dùng khi chữ bị tràn/cắt (R14) trước khi lưu (TC-UI-01).
- Màn hình Cài đặt hoàn chỉnh với các nhóm tùy chọn Ngẫu nhiên, Giao diện (Sáng/Tối/Hệ thống), Tên album, Đặt lại dữ liệu (xác nhận 2 lần).
- Hoàn thiện MVP dùng được hằng ngày trên Expo Go.

---

## Chi tiết các bước

### Bước 1 — Export service (`src/services/exportWallpaper.ts`)
- Viết test trước trong `tests/unit/exportWallpaper.test.ts`:
  - Kích thước xuất đúng chuẩn pixel (`width × height × scale` - TC-LOG-01).
  - Yêu cầu quyền `MediaLibrary`: nếu từ chối, trả về lỗi có mã `PERMISSION_DENIED` và hướng dẫn mở Cài đặt.
  - Lưu vào Ảnh và thêm vào album mang tên cấu hình (mặc định "Quote Wallpaper").
- Hiện thực `src/services/exportWallpaper.ts` sử dụng `react-native-view-shot` và `expo-media-library`.

### Bước 2 — Nối nút Lưu + Hướng dẫn (`app/preview.tsx`)
- Viết test trước trong `tests/components/PreviewExport.test.tsx`:
  - Bấm nút Lưu: kiểm tra overflow (R14) -> nếu overflow hiện alert hỏi xác nhận trước khi lưu (TC-UI-01).
  - Lưu thành công hiển thị Toast thông báo và mở sheet hướng dẫn 3 bước cài hình nền iOS.
- Nối canvas xuất ẩn không chứa lockscreen overlay, đồng hồ hay nút bấm vào `app/preview.tsx`.

### Bước 3 — Màn Cài đặt (`app/(tabs)/settings.tsx`)
- Viết test trước trong `tests/components/SettingsScreen.test.tsx`:
  - Thay đổi appearance (Hệ thống / Sáng / Tối) cập nhật store và theme tức thì.
  - Các công tắc: `shuffleOnOpen`, `noRepeat`, `favoritesBoost`, `showAuthor`.
  - Đặt lại dữ liệu: hiển thị 2 lần hộp thoại xác nhận bảo vệ dữ liệu.
- Hiện thực `app/(tabs)/settings.tsx` theo chuẩn Apple Inset Grouped.

### Bước 4 — Rà soát MVP
- Kiểm tra toàn bộ 4 trạng thái (loading, empty, error, data) trên tất cả các tab.
- Chạy toàn bộ kiểm tra hồi quy: `npm run typecheck`, `npm run lint`, `npm test`, `npm run tasks-dashboard`.

---

## Tiêu chí nghiệm thu
- Tất cả các test cases trong checklist.md đạt chuẩn.
- Đầy đủ tính năng MVP: Hôm nay, Danh ngôn, Ảnh, Mẫu, Cài đặt, Xem trước và Lưu hình nền vào Photos album.

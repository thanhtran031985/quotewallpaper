# Kế hoạch thực hiện — 10-batch-export-shortcuts

Xuất hàng loạt vào album và hướng dẫn Phím tắt (PRD D7, R16).

## Mục tiêu
- Cho phép người dùng xuất hàng loạt 5–50 hình nền ngẫu nhiên vào album "Quote Wallpaper".
- Mỗi hình được random độc lập theo quy tắc R1–R3, R16.
- Hỗ trợ thanh tiến độ trực quan, nút Hủy an toàn (TC-UI-01).
- Nếu lỗi 1 hình (ví dụ render lỗi), lô xuất vẫn tiếp tục các hình còn lại và báo cáo tổng kết (TC-LOG-01).
- Màn hình hướng dẫn cài đặt Phím tắt (Shortcuts) 4 bước chi tiết, có nút mở nhanh ứng dụng Phím tắt `shortcuts://`.

---

## Chi tiết các bước

### Bước 1 — Batch service (`src/services/batchExport.ts`)
- Viết test trước trong `tests/unit/batchExport.test.ts`:
  - Xuất N hình ngẫu nhiên độc lập theo R1–R3, R16.
  - TC-LOG-01: lỗi 1 hình không làm dừng toàn bộ lô, tiếp tục xuất các hình còn lại.
  - Hủy dừng đúng thời điểm và báo số hình đã xuất thành công.
- Hiện thực `src/services/batchExport.ts`.

### Bước 2 — Màn hình & Tiến độ Xuất hàng loạt (`app/batch-export.tsx`)
- Viết test trước trong `tests/components/BatchExportScreen.test.tsx`:
  - Chọn số lượng hình (5, 10, 20, 30, 50).
  - Bấm bắt đầu: hiển thị thanh tiến độ %, số lượng đang xuất.
  - TC-UI-01: bấm Hủy giữa chừng dừng xuất và hiển thị kết quả các hình đã hoàn thành.
  - Kết nối vào mục "Xuất hàng loạt vào album" trong Cài đặt (`app/(tabs)/settings.tsx`).

### Bước 3 — Màn hình Hướng dẫn Phím tắt (`app/shortcuts-guide.tsx`)
- Viết test trước trong `tests/components/ShortcutsGuideScreen.test.tsx`:
  - Hiển thị 4 bước hướng dẫn cài đặt Tự động hóa iOS với Phím tắt.
  - Bấm nút "Mở ứng dụng Phím tắt" gọi `Linking.openURL('shortcuts://')`.
  - Kết nối vào mục "Hướng dẫn Phím tắt" trong Cài đặt (`app/(tabs)/settings.tsx`).
- Rà soát toàn bộ kiểm tra hồi quy: `npm run typecheck`, `npm run lint`, `npm test`, `npm run tasks-dashboard`.

---

## Tiêu chí nghiệm thu
- Xuất hàng loạt chạy ổn định, có thanh tiến độ và hủy được.
- Đầy đủ hướng dẫn trực quan để người dùng cấu hình tự động đổi hình nền mỗi ngày trên iOS.
- Toàn bộ tests pass, không lỗi TypeScript hay ESLint.

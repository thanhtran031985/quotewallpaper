# Kế hoạch thực hiện — 13-polish-performance

## Mục tiêu
Tối ưu hóa hiệu năng và chất lượng ứng dụng đạt đầy đủ 4 tiêu chí chất lượng PRD mục H, bảo đảm hỗ trợ toàn diện trợ năng (Accessibility/VoiceOver, Dynamic Type, Reduce Motion), và khả năng phục hồi lỗi bền bỉ (resilience).

## Các bước thực hiện

### Bước 1 — Đo lường và tối ưu hiệu năng (Performance Benchmarks)
- Tạo benchmark test engine: kiểm tra thuật toán random pick 10.000 lần trên 200 ảnh và 1.000 câu phải hoàn thành dưới 200ms.
- Tối ưu re-render các màn hình danh sách lớn (quotes, images, templates) bằng cách sử dụng flat list pagination/windowSize tối ưu và React.memo nếu cần.
- Kiểm tra tính năng khởi động và chuyển ảnh dưới 150ms.

### Bước 2 — Trợ năng (Accessibility & VoiceOver)
- Rà soát toàn bộ các màn hình chính (Hôm nay, Danh ngôn, Ảnh, Mẫu, Cài đặt) và các modal (Preview, Quote Edit, Template Editor, Batch Export, Shortcuts Guide, Import, History).
- Bổ sung và chuẩn hóa `accessibilityLabel`, `accessibilityRole`, `accessibilityHint` cho mọi nút bấm, công tắc switch, tab bar và ô nhập liệu.
- Viết test suite kiểm tra độ phủ của accessibility labels trên các components và màn hình.

### Bước 3 — Xử lý các kịch bản lỗi & khả năng phục hồi (Error Resilience)
- Kiểm tra kho trống (0 ảnh, 0 câu, 0 template): hiển thị EmptyState đẹp mắt, hướng dẫn rõ ràng, không crash.
- Kiểm tra file ảnh bị xóa hoặc mất trên đĩa (`fileMissing: true`): tự động bỏ qua khi random và hiển thị nhãn cảnh báo.
- Kiểm tra dữ liệu AsyncStorage bị hỏng cú pháp JSON hoặc sai version schema: `storageCorruption` tự động khôi phục dữ liệu mặc định an toàn và sao lưu dữ liệu cũ.
- Viết test suite tổng thể cho khả năng phục hồi lỗi (`tests/unit/errorResilience.test.ts`).

### Bước 4 — Đóng Task & Hoàn thiện dự án
- Chạy toàn bộ các bài kiểm tra: `npm run typecheck`, `npm run lint`, `npm test`, `npm run tasks-dashboard`.
- Cập nhật checklist, progress, dashboard.
- Merge vào `main` và đẩy lên `origin/main`.

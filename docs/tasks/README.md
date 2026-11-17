# Danh sách task

Bảng tổng các task, chia theo giai đoạn GĐ0–GĐ3 (docs/PRD.md mục G). Bảng này là nguồn của `npm run tasks-dashboard`: giữ đúng các cột #, Task, Trạng thái, Phụ thuộc, Nhánh git.

| # | Task | Trạng thái | Phụ thuộc | Nhánh git |
|---|---|---|---|---|
| 00 | [00-repo-setup](00-repo-setup/task.md) — Khung dự án Expo + TypeScript, lint, test, tasks-dashboard | ✅ | — | feat/00-repo-setup |
| 01 | [01-domain-store-seed](01-domain-store-seed/task.md) — Kiểu dữ liệu, store persist, dữ liệu mặc định, theme tokens | ✅ | 00 | feat/01-domain-store-seed |
| 02 | [02-random-engine](02-random-engine/task.md) — Engine chọn ngẫu nhiên: noRepeat, ghim, chế độ template, yêu thích | ✅ | 01 | feat/02-random-engine |
| 03 | [03-wallpaper-canvas](03-wallpaper-canvas/task.md) — WallpaperCanvas, layout vùng đồng hồ, fitText, 8 template builtin | ✅ | 01 | feat/03-wallpaper-canvas |
| 04 | [04-home-preview-ui](04-home-preview-ui/task.md) — Tab Hôm nay và màn Xem trước | ✅ | 02, 03 | feat/04-home-preview-ui |
| 05 | [05-quotes-ui](05-quotes-ui/task.md) — Tab Danh ngôn: danh sách, tìm kiếm, thêm/sửa, bật/tắt, yêu thích | ✅ | 01 | feat/05-quotes-ui |
| 06 | [06-images-ui](06-images-ui/task.md) — Tab Ảnh: chọn từ Photos, chép vào app, bật/tắt, điểm lấy nét, xóa | ⬜ | 01 | feat/06-images-ui |
| 07 | [07-templates-ui](07-templates-ui/task.md) — Tab Mẫu: chế độ Cố định / Ngẫu nhiên, bật/tắt, nhân bản, xóa | ⬜ | 03 | feat/07-templates-ui |
| 08 | [08-export-settings-mvp](08-export-settings-mvp/task.md) — Lưu vào Ảnh, Cài đặt, Sáng/Tối, hoàn thiện MVP | ⬜ | 04, 05, 06, 07 | feat/08-export-settings-mvp |
| 09 | [09-template-editor](09-template-editor/task.md) — Trình tạo/sửa template tự tạo | ⬜ | 07, 08 | feat/09-template-editor |
| 10 | [10-batch-export-shortcuts](10-batch-export-shortcuts/task.md) — Xuất hàng loạt vào album và hướng dẫn Phím tắt | ⬜ | 08 | feat/10-batch-export-shortcuts |
| 11 | [11-import-history](11-import-history/task.md) — Nhập/xuất danh ngôn (JSON/CSV) và lịch sử hình nền | ⬜ | 05, 08 | feat/11-import-history |
| 12 | [12-eas-build](12-eas-build/task.md) — Development build và bản cài độc lập qua EAS | ⬜ | 08 | feat/12-eas-build |
| 13 | [13-polish-performance](13-polish-performance/task.md) — Hoàn thiện: hiệu năng, truy cập, xử lý lỗi | ⬜ | 09, 10, 11 | feat/13-polish-performance |

## Thứ tự làm đề xuất
- **00 → 01** nền: dự án Expo, store, dữ liệu mặc định, theme.
- **02, 03** song song: engine random và WallpaperCanvas.
- **04 → 05, 06, 07 → 08** giao diện MVP. Xong 08: dùng được hằng ngày trong Expo Go.
- **09, 10, 11** mở rộng. **12** khi có tài khoản Apple Developer. **13** hoàn thiện.

## Đã chốt (16/11/2026)
- Chỉ iOS (iPhone, dọc). Expo + React Native + TypeScript, dev trên Windows, chạy thử bằng Expo Go.
- Code bằng Google Antigravity (AGENTS.md, .agents/rules, .agents/skills).
- Danh ngôn: bộ mặc định + người dùng tự nhập. Template: 8 mẫu có sẵn + người dùng tự tạo (task 09).
- Hỗ trợ Sáng / Tối / Theo hệ thống cho giao diện app; hình nền không đổi theo chế độ.
- Không server, không đăng nhập, dữ liệu chỉ trên máy.
- Tự đổi hình nền chỉ qua Phím tắt (task 10); app không tự đặt hình nền.

## Điểm cần quyết định
- **bundleIdentifier** (ví dụ com.<tên>.quotewallpaper). (task 00)
- **Danh sách 50 danh ngôn mặc định**: người dùng cung cấp hay agent đề xuất để duyệt. (task 01)
- **12 ảnh mặc định**: nguồn ảnh (tự chụp / Unsplash có giấy phép). (task 01)
- **5 font** hỗ trợ tiếng Việt (gợi ý: Lora, Be Vietnam Pro, Nunito, JetBrains Mono, Dancing Script). (task 03)
- **Thư viện cần hỏi trước khi cài:** expo-document-picker, expo-sharing (11).
- **Tài khoản Apple Developer** cho task 12.

# Tiến độ — 07-templates-ui

Trạng thái: ✅

| Bước | Nội dung | Trạng thái | Ngày | Commit |
|---|---|---|---|---|
| 1 | Lưới + chế độ | ✅ | 2026-11-17 | feat(07): step 1 - templates grid with fixed and random modes |
| 2 | Nhân bản / Xóa | ✅ | 2026-11-17 | feat(07): step 2 - context menu, clone builtin, and fallback on delete |

## Nhật ký
- 2026-11-17: Khởi tạo nhánh `feat/07-templates-ui`, lập kế hoạch chi tiết `plan.md`.
- 2026-11-17: Hoàn thành bước 1. Hiện thực `app/(tabs)/templates.tsx` với giao diện lưới 2 cột, segmented control Cố định / Ngẫu nhiên kèm ghi chú diễn giải, thẻ xem trước template với mini quote simulation, badge "Đang dùng" (Cố định) và công tắc bật/tắt (Ngẫu nhiên). Đạt TC-UI-01 (cố định giữ nguyên qua 10 lần shuffle) và TC-UI-02 (chặn tắt template cuối cùng theo R12).
- 2026-11-17: Hoàn thành bước 2. Menu ngữ cảnh khi nhấn giữ hỗ trợ Nhân bản (TC-UI-03), Sửa mẫu, Xóa mẫu tự tạo với cơ chế tự động fallback về template builtin đầu tiên theo R11 nếu xóa template đang cố định. Toàn bộ test suite đều xanh.

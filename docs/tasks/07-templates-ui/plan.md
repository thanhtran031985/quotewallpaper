# Kế hoạch thực hiện — 07-templates-ui

Tab Mẫu: chế độ Cố định / Ngẫu nhiên, bật/tắt, nhân bản, xóa.

## Mục tiêu
- Quản lý kho mẫu template theo PRD D5 và các quy tắc R2, R11, R12.
- Người dùng có thể chuyển đổi giữa 2 chế độ:
  - **Cố định**: luôn dùng 1 template được chỉ định (TC-UI-01).
  - **Ngẫu nhiên**: chọn ngẫu nhiên trong các template đang bật (chặn tắt template cuối cùng theo R12 - TC-UI-02).
- Nhân bản template có sẵn để tạo mẫu riêng của người dùng (TC-UI-03).
- Xóa template của người dùng; nếu xóa template đang cố định thì chuyển về builtin đầu tiên theo R11.
- Hiển thị lưới 2 cột thẻ template trực quan, có preview thu nhỏ.

---

## Chi tiết các bước

### Bước 1 — Lưới + Chế độ (`app/(tabs)/templates.tsx`)
- Viết test trước trong `tests/components/TemplatesList.test.tsx`:
  - Segmented control 2 chế độ: Cố định và Ngẫu nhiên.
  - Chạm chọn template ở chế độ Cố định -> cập nhật `fixedTemplateId` và `current.templateId`.
  - TC-UI-01: Chọn Cố định và đổi ngẫu nhiên 10 lần -> luôn giữ nguyên template đó.
  - TC-UI-02: Ở chế độ Ngẫu nhiên, chặn không cho tắt template đang bật cuối cùng (R12).
- Hiện thực `app/(tabs)/templates.tsx` với lưới 2 cột, segmented control, badge trạng thái (Đang dùng / Đang bật).

### Bước 2 — Nhân bản / Xóa
- Viết test cho tác vụ nhấn giữ:
  - TC-UI-03: Nhân bản template builtin tạo bản sao ở nhóm Của tôi với hậu tố "(bản sao)".
  - Xóa template user: xóa thành công khỏi store; template builtin không có nút xóa.
  - R11: Xóa template đang được chọn làm `fixedTemplateId` thì tự động fallback về template builtin đầu tiên.
- Hoàn thiện menu tác vụ (ActionSheet modal) và menu tùy chọn hàng loạt.

---

## Tiêu chí nghiệm thu
- Tất cả các test cases trong checklist.md (TC-UI-01, TC-UI-02, TC-UI-03, TC-REG-01..04) đều đạt.
- `npm run typecheck`, `npm run lint`, `npm test` đều xanh.
- `npm run tasks-dashboard` cập nhật.

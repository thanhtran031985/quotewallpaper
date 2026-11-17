# Kế hoạch thực hiện: Task 05 — 05-quotes-ui

- **Mục tiêu:** Xây dựng màn hình Tab Danh ngôn (PRD D3) với danh sách dạng inset grouped, tìm kiếm tiếng Việt không dấu (TC-LOG-01), 4 chế độ lọc segmented, sheet thêm/sửa có đếm ký tự và validate inline (R8), thao tác yêu thích, xóa câu tự tạo (R9), và menu hàng loạt (Bật/Tắt tất cả, Khôi phục mặc định).
- **Nhánh git:** feat/05-quotes-ui

---

### Bước 1 — Danh sách + lọc + tìm kiếm không dấu
- **Mô tả:**
  - `src/engine/vietnameseSearch.ts`:
    - `removeVietnameseDiacritics(str: string): string`: chuẩn hóa chuỗi loại bỏ dấu tiếng Việt (NFD).
    - `matchesSearch(text: string, query: string): boolean`: kiểm tra khớp tìm kiếm không phân biệt dấu và hoa thường.
  - Xây dựng giao diện danh sách `app/(tabs)/quotes.tsx`:
    - Ô tìm kiếm với icon kính lúp và nút xóa tìm kiếm.
    - Segmented control 4 tab: "Tất cả", "Đang bật", "Yêu thích", "Tự tạo".
    - `FlatList` inset grouped, hiển thị danh ngôn (tối đa 2 dòng, có ellipsis), tác giả, công tắc bật/tắt (Switch), trạng thái yêu thích.
- **File tạo/sửa:**
  - `src/engine/vietnameseSearch.ts`
  - `app/(tabs)/quotes.tsx`
  - `tests/unit/vietnameseSearch.test.ts`
  - `tests/components/QuotesList.test.tsx`
- **Test viết trước:** `tests/unit/vietnameseSearch.test.ts` (TC-LOG-01) và `tests/components/QuotesList.test.tsx`.
- **Lệnh kiểm tra:** `npm test`.

---

### Bước 2 — Sheet thêm/sửa danh ngôn (quote-edit)
- **Mô tả:**
  - Đăng ký màn modal `quote-edit` trong `app/_layout.tsx`.
  - Xây dựng `app/quote-edit.tsx`:
    - Header: Nút "Hủy" và "Lưu".
    - Ô nhập câu danh ngôn (đếm `len/220`, validate inline 1–220 ký tự sau khi trim, kiểm tra trùng nội dung).
    - Ô nhập tác giả (tối đa 60 ký tự).
    - Nút "Lưu" bị vô hiệu hóa khi form không hợp lệ (TC-UI-01).
    - Bọc trong `KeyboardAvoidingView` để không bị che khuất bàn phím (TC-IOS-01).
- **File tạo/sửa:**
  - `app/quote-edit.tsx`
  - `app/_layout.tsx`
  - `tests/components/QuoteEdit.test.tsx`
- **Test viết trước:** `tests/components/QuoteEdit.test.tsx` (TC-UI-01).
- **Lệnh kiểm tra:** `npm test`.

---

### Bước 3 — Thao tác vuốt/hàng + Menu hàng loạt
- **Mô tả:**
  - Hàng danh ngôn hỗ trợ:
    - Nút Yêu thích (gắn cờ favorite để hưởng R7 trọng số x2).
    - Nút Xóa (chỉ hiển thị cho câu có `source === 'user'`; câu `source === 'default'` không có nút xóa theo R9 / TC-UI-02).
  - Menu tác vụ ở navbar:
    - Bật tất cả
    - Tắt tất cả (khi tắt hết, tab Hôm nay báo thiếu câu theo TC-UI-03)
    - Khôi phục mặc định (gọi `resetToDefault` từ seed)
- **File tạo/sửa:**
  - `app/(tabs)/quotes.tsx`
  - `tests/components/QuotesActions.test.tsx`
- **Test viết trước:** `tests/components/QuotesActions.test.tsx` (TC-UI-02, TC-UI-03).
- **Lệnh kiểm tra:** `npm test`, `npm run typecheck`, `npm run lint`.

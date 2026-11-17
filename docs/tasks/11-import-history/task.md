# 11-import-history — Nhập/xuất danh ngôn (JSON/CSV) và lịch sử hình nền

- Ngày tạo: 2026-11-16
- Giai đoạn: GĐ2
- Phụ thuộc: 05, 08
- Nhánh git: feat/11-import-history

## Mục tiêu
- Nạp nhanh nhiều danh ngôn, sao lưu và xem lại hình đã tạo.

## Phạm vi
- Nhập JSON/CSV qua expo-document-picker (hỏi trước khi cài); xem trước số câu hợp lệ/trùng/lỗi trước khi nhập.
- Xuất sao lưu danh ngôn user ra JSON (expo-sharing — hỏi trước khi cài).
- Lịch sử (R17): danh sách 50 tổ hợp, chạm để mở lại vào Xem trước.

## Ngoài phạm vi
- Sao lưu ảnh, template.

## Thiết kế
- designs/reference/prototype.html — Agent đề xuất theo HIG.

## PRD liên quan
- docs/PRD.md mục D7, C (R8, R17)

## Các bước

### Bước 1 — Parser nhập
- Làm: Hàm thuần parse JSON/CSV (UTF-8, có BOM, dấu phẩy trong ngoặc kép).
- Test viết trước: Test: file mẫu hợp lệ, trùng, quá dài, sai định dạng.
- Kiểm tra: `npm test`.

### Bước 2 — UI nhập/xuất
- Làm: Picker, màn xem trước, chia sẻ.
- Test viết trước: Test luồng xác nhận.
- Kiểm tra: `npm test`.

### Bước 3 — Lịch sử
- Làm: Màn lịch sử.
- Test viết trước: Test mục có ảnh/câu đã xóa hiển thị "không còn".
- Kiểm tra: `npm test`.

## Chấp nhận khi
- [ ] Nhập 500 câu < 3 giây, báo đúng số trùng/lỗi.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` xanh.

### Ảnh hưởng dữ liệu
- Không.

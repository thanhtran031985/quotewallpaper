# 09-template-editor — Trình tạo/sửa template tự tạo

- Ngày tạo: 2026-11-16
- Giai đoạn: GĐ2
- Phụ thuộc: 07, 08
- Nhánh git: feat/09-template-editor

## Mục tiêu
- Người dùng tạo template riêng theo PRD D6.

## Phạm vi
- Màn `template-edit/[id]`: canvas xem trước + LockScreenOverlay mờ, kéo khối chữ (gesture-handler + reanimated, chặn R13).
- 5 tab công cụ: Chữ (font, đậm, nghiêng, in hoa, cỡ, giãn dòng, màu, căn, bóng), Khối (nền, độ mờ, bo, đệm, viền trái, độ rộng), Phủ (kiểu, màu, độ mờ), Ảnh (blur, độ sáng), Khung.
- Bảng màu 12 swatch + chọn tùy chỉnh (HEX).
- Hoàn tác 1 bước; thoát chưa lưu hỏi xác nhận; đổi tên.
- Validate TemplateStyle trước khi lưu.

## Ngoài phạm vi
- Chia sẻ template, nhiều khối chữ.

## Thiết kế
- designs/reference/prototype.html — Chưa có trong prototype — agent đề xuất bố cục theo PRD D6 và chờ duyệt ở bước 1.

## PRD liên quan
- docs/PRD.md mục D6, B (TemplateStyle), C (R13)

## Các bước

### Bước 1 — Bố cục (duyệt trước)
- Làm: Dựng khung màn hình, chụp ảnh, DỪNG chờ duyệt bố cục.
- Test viết trước: Test render.
- Kiểm tra: Ảnh chụp Sáng/Tối.

### Bước 2 — Kéo khối chữ
- Làm: Gesture + R13.
- Test viết trước: Test hàm clamp vị trí.
- Kiểm tra: `npm test`.

### Bước 3 — 5 tab công cụ
- Làm: Control + cập nhật style.
- Test viết trước: Test mỗi control cập nhật đúng trường style.
- Kiểm tra: `npm test`.

### Bước 4 — Lưu / hoàn tác / thoát
- Làm: Lưu, undo, xác nhận thoát.
- Test viết trước: Test validate fail không lưu; undo trả style trước.
- Kiểm tra: `npm test`, thử trên iPhone.

## Chấp nhận khi
- [ ] Tạo template mới, dùng được trong random và chế độ Cố định.
- [ ] Không đặt được chữ vào vùng đồng hồ.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` xanh.

### Ảnh hưởng dữ liệu
- Không đổi cấu trúc (template user đã có trong store).

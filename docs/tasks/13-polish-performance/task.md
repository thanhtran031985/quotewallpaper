# 13-polish-performance — Hoàn thiện: hiệu năng, truy cập, xử lý lỗi

- Ngày tạo: 2026-11-16
- Giai đoạn: GĐ3
- Phụ thuộc: 09, 10, 11
- Nhánh git: feat/13-polish-performance

## Mục tiêu
- Đạt tiêu chí chất lượng PRD mục H.

## Phạm vi
- Đo thời gian mở app/đổi/xuất với 200 ảnh, 1.000 câu (script seed lớn chỉ dùng __DEV__).
- Cache thumbnail, tối ưu re-render (memo, selector zustand).
- Rà VoiceOver, Dynamic Type, Reduce Motion.
- Rà mọi đường lỗi: dữ liệu hỏng, file mất, quyền bị từ chối.

## Ngoài phạm vi
- Tính năng mới.

## Thiết kế
- designs/reference/prototype.html — —

## PRD liên quan
- docs/PRD.md mục H

## Các bước

### Bước 1 — Đo và tối ưu
- Làm: Seed lớn, đo, tối ưu.
- Test viết trước: Test hiệu năng engine (pick 10.000 lần < 200ms).
- Kiểm tra: `npm test`.

### Bước 2 — Truy cập
- Làm: VoiceOver, Dynamic Type.
- Test viết trước: Test accessibilityLabel toàn màn hình.
- Kiểm tra: Người dùng thử VoiceOver.

### Bước 3 — Đường lỗi
- Làm: Rà soát.
- Test viết trước: Test các case lỗi.
- Kiểm tra: `npm test`.

## Chấp nhận khi
- [ ] Đạt 4 chỉ số PRD H trên iPhone thật.
- [ ] VoiceOver đọc được mọi control.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` xanh.

### Ảnh hưởng dữ liệu
- Không.

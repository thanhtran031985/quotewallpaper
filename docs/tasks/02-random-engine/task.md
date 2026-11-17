# 02-random-engine — Engine chọn ngẫu nhiên: noRepeat, ghim, chế độ template, yêu thích

- Ngày tạo: 2026-11-16
- Giai đoạn: GĐ1
- Phụ thuộc: 01
- Nhánh git: feat/02-random-engine

## Mục tiêu
- Hàm thuần chọn tổ hợp ảnh + câu + template theo R1–R7, và tích hợp vào store (action `shuffle`, lịch sử).

## Phạm vi
- `src/engine/randomPick.ts`: `pickSelection(lib, settings, prev, pinned, rng)` trả `Result<Selection>`; `rng` inject được để test.
- Lỗi R5 trả code `EMPTY_IMAGES | EMPTY_QUOTES | EMPTY_TEMPLATES` (có thể nhiều).
- Trọng số yêu thích (R7).
- Đếm số kết hợp cho dòng thống kê.
- Action `shuffle()` trong store: ghi current, đẩy history (≤ 50, R17), haptic do UI gọi.
- Hook `useShuffleOnOpen()`: khởi động + AppState background→active (R6).

## Ngoài phạm vi
- Giao diện (task 04).

## Thiết kế
- designs/reference/prototype.html — —

## PRD liên quan
- docs/PRD.md mục C (R1–R7, R17)

## Các bước

### Bước 1 — pickSelection
- Làm: randomPick.ts.
- Test viết trước: Test R1, R2, R3 (kể cả khi chỉ có 1 mục), R4, R5, R7 với rng cố định; test phân bố gần đều qua 10.000 lần.
- Kiểm tra: `npm test`.

### Bước 2 — Tích hợp store + history
- Làm: Action shuffle, history 50.
- Test viết trước: Test history cắt ở 50; ghim reset khi mục bị tắt.
- Kiểm tra: `npm test`.

### Bước 3 — Shuffle khi mở
- Làm: useShuffleOnOpen.
- Test viết trước: Test mock AppState: active sau background → shuffle 1 lần; tắt cài đặt → không shuffle.
- Kiểm tra: `npm test`.

## Chấp nhận khi
- [ ] Toàn bộ R1–R7, R17 có test pass.
- [ ] Không lặp liên tiếp khi có ≥ 2 mục.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` xanh.

### Ảnh hưởng dữ liệu
- Không đổi cấu trúc.

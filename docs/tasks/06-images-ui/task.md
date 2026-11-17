# 06-images-ui — Tab Ảnh: chọn từ Photos, chép vào app, bật/tắt, điểm lấy nét, xóa

- Ngày tạo: 2026-11-16
- Giai đoạn: GĐ1
- Phụ thuộc: 01
- Nhánh git: feat/06-images-ui

## Mục tiêu
- Quản lý kho ảnh theo PRD D4 và R10.

## Phạm vi
- `services/imageLibrary.ts`: chọn nhiều (≤ 20) bằng expo-image-picker, resize/nén (expo-image-manipulator), chép vào documentDirectory/images/, xóa file khi xóa ảnh, dọn file mồ côi khi khởi động.
- Lưới 3 cột 2 section (Mặc định, Của tôi), chạm bật/tắt, nhấn giữ: Xem, Đặt điểm lấy nét, Xóa.
- Màn đặt điểm lấy nét: chạm lên ảnh để đặt focalPoint, xem trước khung 9:19.5.
- Xử lý ảnh mất file: đánh dấu lỗi, loại khỏi random, hiện biểu tượng cảnh báo.

## Ngoài phạm vi
- Chỉnh sửa ảnh (crop tự do, filter).

## Thiết kế
- designs/reference/prototype.html — Tab Ảnh trong prototype.

## PRD liên quan
- docs/PRD.md mục D4, C (R10)

## Các bước

### Bước 1 — imageLibrary service
- Làm: Picker, nén, chép, xóa, dọn mồ côi.
- Test viết trước: Test với mock FileSystem: chép đúng thư mục, xóa file khi xóa ảnh, file mồ côi bị dọn.
- Kiểm tra: `npm test`.

### Bước 2 — Lưới ảnh
- Làm: Grid + bật/tắt + menu.
- Test viết trước: Test chạm đổi enabled; ảnh default không có Xóa.
- Kiểm tra: `npm test`.

### Bước 3 — Điểm lấy nét + ảnh lỗi
- Làm: Màn focal, xử lý ảnh mất.
- Test viết trước: Test ảnh mất file bị loại khỏi pick.
- Kiểm tra: `npm test`, thử trên iPhone.

## Chấp nhận khi
- [ ] Ảnh đã thêm vẫn hiển thị sau khi xóa ảnh gốc trong Photos.
- [ ] Không xin quyền khi chưa bấm +.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` xanh.

### Ảnh hưởng dữ liệu
- Không.

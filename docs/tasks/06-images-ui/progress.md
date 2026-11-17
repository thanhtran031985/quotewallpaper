# Tiến độ — 06-images-ui

Trạng thái: ✅

| Bước | Nội dung | Trạng thái | Ngày | Commit |
|---|---|---|---|---|
| 1 | imageLibrary service | ✅ | 2026-11-17 | feat(06): step 1 - imageLibrary service, compress, copy, delete, and orphan cleanup |
| 2 | Lưới ảnh | ✅ | 2026-11-17 | feat(06): step 2 - image grid 3 columns, toggle, add photos, and batch menu |
| 3 | Điểm lấy nét + ảnh lỗi | ✅ | 2026-11-17 | feat(06): step 3 - focal point editor and missing file handling |

## Nhật ký
- 2026-11-17: Khởi tạo nhánh `feat/06-images-ui`. Cài đặt các gói `expo-image-picker`, `expo-image-manipulator`, `expo-file-system`.
- 2026-11-17: Hoàn thành bước 1. Hiện thực `src/services/imageLibrary.ts` với đầy đủ tính năng: chọn tối đa 20 ảnh với quyền thư viện, nén resize tự động, lưu vào `documentDirectory/images/`, xóa file an toàn khi xóa ảnh user (TC-LOG-01), dọn dẹp file mồ côi `cleanupOrphanImages` và kiểm tra file tồn tại `verifyImageExists`.
- 2026-11-17: Hoàn thành bước 2. Hiện thực `app/(tabs)/images.tsx` với giao diện lưới 3 cột Apple HIG, chia 2 nhóm (ẢNH CỦA TÔI và MẶC ĐỊNH), card Thêm ảnh, chạm để bật/tắt (kèm badge checkmark trực quan), nhấn giữ mở menu tác vụ (chỉ ảnh user có xóa), menu tùy chọn hàng loạt.
- 2026-11-17: Hoàn thành bước 3. Đăng ký modal `image-focal` trong `app/_layout.tsx`, hiện thực màn hình chọn điểm lấy nét `app/image-focal.tsx` cho phép chạm chọn tọa độ và nút đưa về tâm; xử lý loại bỏ ảnh mất file (`fileMissing: true`) khỏi thuật toán random pick (TC-LOG-02) và hiển thị biểu tượng cảnh báo.

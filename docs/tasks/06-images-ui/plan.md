# Kế hoạch thực hiện — 06-images-ui

Tab Ảnh: chọn từ Photos, chép vào app, bật/tắt, điểm lấy nét, xóa file mồ côi.

## Mục tiêu
- Quản lý kho ảnh hình nền theo PRD D4 và quy tắc R10.
- Người dùng có thể chọn tối đa 20 ảnh từ thư viện Photos của iPhone.
- Ảnh được nén, resize hợp lý và sao chép an toàn vào `documentDirectory/images/`.
- Khi xóa ảnh khỏi app: xóa file thực tế trong thư mục app (TC-LOG-01). Tuyệt đối không xóa ảnh gốc trong Photos.
- Dọn dẹp file ảnh mồ côi (file có trong thư mục nhưng không còn trong store).
- Lưới ảnh 3 cột chia làm 2 nhóm (Của tôi, Mặc định), hỗ trợ bật/tắt khi chạm, nhấn giữ mở menu tác vụ.
- Đặt điểm lấy nét (focal point) trực quan với khung xem trước 9:19.5.
- Phát hiện ảnh bị mất file và loại khỏi random engine (TC-LOG-02).

---

## Chi tiết các bước

### Bước 1 — imageLibrary service (`src/services/imageLibrary.ts`)
- Viết test unit trước trong `tests/unit/imageLibrary.test.ts`:
  - `pickImagesFromLibrary`: xin quyền khi bấm, nén & resize, lưu vào `documentDirectory/images/`.
  - `deleteImageFile`: xóa file trong app thư mục, không xóa nếu không phải file app (TC-LOG-01).
  - `cleanupOrphanImages`: quét thư mục `images/`, xóa file không có trong danh sách store.
  - `verifyImageExists`: kiểm tra file tồn tại trên đĩa.
- Hiện thực `src/services/imageLibrary.ts` tích hợp `expo-image-picker`, `expo-image-manipulator`, `expo-file-system`.
- Cập nhật store `useLibraryStore` kết nối `deleteImage` với `deleteImageFile`.

### Bước 2 — Lưới ảnh (`app/(tabs)/images.tsx`)
- Viết test trước trong `tests/components/ImagesList.test.tsx`:
  - Render lưới ảnh 3 cột chia 2 phần (Của tôi, Mặc định).
  - Chạm ảnh để bật/tắt tham gia random.
  - Ảnh mặc định không có nút xóa; ảnh của tôi có nút xóa (có alert xác nhận).
  - Menu tác vụ: Bật tất cả, Tắt tất cả, Khôi phục mặc định.
- Hiện thực `app/(tabs)/images.tsx` chuẩn Apple HIG, badge bật/tắt, nút thêm ảnh "+".

### Bước 3 — Điểm lấy nét (`app/image-focal.tsx`) & Xử lý ảnh lỗi
- Đăng ký màn modal `image-focal` trong `app/_layout.tsx`.
- Viết test `tests/components/ImageFocal.test.tsx`:
  - Mở ảnh theo param `id`.
  - Chạm màn hình để đổi `focalPoint { x, y }`.
  - Khung xem trước tỷ lệ 9:19.5.
  - Lưu cập nhật `focalPoint` vào `useLibraryStore.updateImage`.
  - Test ảnh mất file bị loại khỏi random engine (TC-LOG-02).
- Hoàn thiện xử lý ảnh mất file và cập nhật checklist.md.

---

## Tiêu chí nghiệm thu
- Tất cả các test cases logic, UI, iOS trong checklist.md đều đạt.
- `npm run typecheck`, `npm run lint`, `npm test` đều xanh.
- `npm run tasks-dashboard` cập nhật.

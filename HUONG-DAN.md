# Hướng dẫn bắt đầu

## 1. Chuẩn bị (một lần)

1. Cài Node.js LTS (≥ 20) và Git trên Windows.
2. Cài **Expo Go** trên iPhone từ App Store.
3. Mở thư mục dự án bằng Antigravity.
4. Chép file prototype giao diện vào `designs/reference/prototype.html`.

## 2. Làm việc với agent

1. Gõ: `làm task 00` (skill lam-task tự đọc README task, task.md, progress.md).
2. Agent đưa **Implementation Plan** → đọc và trả lời "duyệt" hoặc góp ý.
3. Sau mỗi bước, agent dừng và báo cáo. Kiểm tra trên iPhone, gõ `continue` để làm tiếp hoặc `commit` để đồng ý commit.
4. Muốn thêm yêu cầu mới: gõ `tạo task <mô tả>` (skill tao-task).
5. Xong task: agent chạy skill dong-task, cập nhật bảng tổng.

## 3. Chạy thử trên iPhone

```powershell
npx expo start
```
Quét QR bằng Camera iPhone → mở trong Expo Go. iPhone và máy tính cùng Wi-Fi; mạng công ty chặn thì dùng `npx expo start --tunnel`.

## 4. Thứ tự task

Xem `docs/tasks/README.md`. MVP xong ở task 08; sau đó mở rộng template tự tạo, xuất album cho Phím tắt và build bản cài độc lập.

## 5. Đặt hình nền tự động bằng Phím tắt (sau task 10)

1. Trong app: Cài đặt → **Xuất hàng loạt vào album** (ví dụ 30 hình).
2. Mở **Phím tắt** → Tự động hóa → Thời gian trong ngày (ví dụ 6:00) → Chạy ngay.
3. Hành động: **Tìm ảnh** (Album là "Quote Wallpaper") → **Lấy mục ngẫu nhiên từ danh sách** → **Đặt ảnh làm hình nền** (Màn hình khóa).

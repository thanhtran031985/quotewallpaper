# Checklist kiểm thử — 04-home-preview-ui

## 2. Giao diện (Sáng / Tối)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-UI-01** | Bấm Đổi ngẫu nhiên | Hình đổi, có haptic, chip cập nhật | ⬜ |
| **TC-UI-02** | Ghim câu rồi đổi | Câu giữ nguyên | ⬜ |
| **TC-UI-03** | Tắt hết ảnh | EmptyState "Chưa có ảnh nào đang bật" + nút tới tab Ảnh | ⬜ |
| **TC-UI-04** | Sáng/Tối | Nền app đổi, hình nền không đổi màu | ⬜ |

## 3. Trên iPhone (người dùng thử trong Expo Go)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-IOS-01** | Chạm thẻ → Xem trước → vuốt ngang | Đổi hình, overlay đồng hồ đúng vị trí | ⬜ |
| **TC-IOS-02** | Bật Reduce Motion | Không có animation trượt | ⬜ |

## 4. Hồi quy
| Mã TC | Lệnh kiểm tra | Tiêu chí đạt | Trạng thái |
|---|---|---|---|
| **TC-REG-01** | npm run typecheck | Không lỗi | ⬜ |
| **TC-REG-02** | npm run lint | Không lỗi | ⬜ |
| **TC-REG-03** | npm test | Tất cả pass | ⬜ |
| **TC-REG-04** | npm run tasks-dashboard | Dashboard cập nhật | ⬜ |

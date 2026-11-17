# Checklist kiểm thử — 06-images-ui

## 1. Logic
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-LOG-01** | Xóa ảnh user | File trong documentDirectory bị xóa | ✅ |
| **TC-LOG-02** | Ảnh mất file | Không được chọn khi random | ⬜ |

## 3. Trên iPhone (người dùng thử trong Expo Go)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-IOS-01** | Thêm 5 ảnh | Hiện trong section Của tôi, đang bật | ⬜ |
| **TC-IOS-02** | Xóa ảnh gốc trong Photos | Ảnh trong app vẫn hiện | ⬜ |
| **TC-IOS-03** | Từ chối quyền | Hiện hướng dẫn mở Cài đặt, không crash | ⬜ |

## 4. Hồi quy
| Mã TC | Lệnh kiểm tra | Tiêu chí đạt | Trạng thái |
|---|---|---|---|
| **TC-REG-01** | npm run typecheck | Không lỗi | ⬜ |
| **TC-REG-02** | npm run lint | Không lỗi | ⬜ |
| **TC-REG-03** | npm test | Tất cả pass | ⬜ |
| **TC-REG-04** | npm run tasks-dashboard | Dashboard cập nhật | ⬜ |

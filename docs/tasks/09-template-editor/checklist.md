# Checklist kiểm thử — 09-template-editor

## 1. Logic
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-LOG-01** | Kéo chữ lên vùng đồng hồ | Bị chặn dưới vùng | ✅ |

## 2. Giao diện (Sáng / Tối)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-UI-01** | Đổi font/màu | Xem trước cập nhật ngay | ✅ |
| **TC-UI-02** | Thoát chưa lưu | Hỏi xác nhận | ✅ |

## 3. Trên iPhone (người dùng thử trong Expo Go)
| Mã TC | Nội dung kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **TC-IOS-01** | Kéo khối chữ | Mượt, có haptic khi chạm biên | ✅ |

## 4. Hồi quy
| Mã TC | Lệnh kiểm tra | Tiêu chí đạt | Trạng thái |
|---|---|---|---|
| **TC-REG-01** | npm run typecheck | Không lỗi | ✅ |
| **TC-REG-02** | npm run lint | Không lỗi | ✅ |
| **TC-REG-03** | npm test | Tất cả pass | ✅ |
| **TC-REG-04** | npm run tasks-dashboard | Dashboard cập nhật | ✅ |
